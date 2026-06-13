const crypto = require('crypto');
const { db } = require('../config/db');

// ==========================================
// QR-Based Attendance Session Management
// ==========================================

// @desc    Create a new QR attendance session
// @route   POST /api/qr-attendance/sessions
exports.createSession = async (req, res, next) => {
  const { title, duration_minutes } = req.body;

  if (!title || !duration_minutes) {
    return res.status(400).json({ success: false, message: 'Title and duration are required.' });
  }

  try {
    // Generate a cryptographically secure session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + duration_minutes * 60 * 1000);

    const [result] = await db.query(
      `INSERT INTO qr_attendance_sessions (title, session_token, created_by, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [title, sessionToken, req.user.id, expiresAt]
    );

    res.status(201).json({
      success: true,
      data: {
        session_id: result.insertId,
        title,
        session_token: sessionToken,
        expires_at: expiresAt,
        duration_minutes
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active (non-expired) sessions
// @route   GET /api/qr-attendance/sessions
exports.getActiveSessions = async (req, res, next) => {
  try {
    // Auto-expire sessions that have passed their expiry time
    await db.query(
      `UPDATE qr_attendance_sessions SET status = 'expired' WHERE expires_at < NOW() AND status = 'active'`
    );

    const [sessions] = await db.query(`
      SELECT qs.*, u.name AS created_by_name,
             (SELECT COUNT(*) FROM qr_attendance_records WHERE session_id = qs.session_id) AS marked_count
      FROM qr_attendance_sessions qs
      JOIN users u ON qs.created_by = u.id
      WHERE qs.status = 'active'
      ORDER BY qs.created_at DESC
    `);

    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single session by ID (includes token for QR display)
// @route   GET /api/qr-attendance/sessions/:id
exports.getSessionById = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT qs.*, u.name AS created_by_name,
             (SELECT COUNT(*) FROM qr_attendance_records WHERE session_id = qs.session_id) AS marked_count
      FROM qr_attendance_sessions qs
      JOIN users u ON qs.created_by = u.id
      WHERE qs.session_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session history (past sessions with stats)
// @route   GET /api/qr-attendance/sessions/history
exports.getSessionHistory = async (req, res, next) => {
  try {
    // Auto-expire old sessions first
    await db.query(
      `UPDATE qr_attendance_sessions SET status = 'expired' WHERE expires_at < NOW() AND status = 'active'`
    );

    const [sessions] = await db.query(`
      SELECT qs.*, u.name AS created_by_name,
             (SELECT COUNT(*) FROM qr_attendance_records WHERE session_id = qs.session_id) AS marked_count,
             (SELECT COUNT(*) FROM students WHERE status = 'active') AS total_students
      FROM qr_attendance_sessions qs
      JOIN users u ON qs.created_by = u.id
      ORDER BY qs.created_at DESC
      LIMIT 50
    `);

    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed report for a session (present + absent students)
// @route   GET /api/qr-attendance/sessions/:id/report
exports.getSessionReport = async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    // Get session info
    const [sessionRows] = await db.query('SELECT * FROM qr_attendance_sessions WHERE session_id = ?', [sessionId]);
    if (sessionRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Get present students
    const [presentStudents] = await db.query(`
      SELECT qr.record_id, qr.marked_at, s.student_id, u.name, s.student_number, s.usn, 
             s.branch, s.semester, r.room_number, r.block
      FROM qr_attendance_records qr
      JOIN students s ON qr.student_id = s.student_id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.room_id
      WHERE qr.session_id = ?
      ORDER BY qr.marked_at ASC
    `, [sessionId]);

    // Get all active students to calculate absent
    const [allStudents] = await db.query(`
      SELECT s.student_id, u.name, s.student_number, s.usn, s.branch, s.semester, r.room_number, r.block
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.room_id
      WHERE s.status = 'active'
    `);

    const presentIds = new Set(presentStudents.map(s => s.student_id));
    const absentStudents = allStudents.filter(s => !presentIds.has(s.student_id));

    res.json({
      success: true,
      data: {
        session: sessionRows[0],
        total_students: allStudents.length,
        present_count: presentStudents.length,
        absent_count: absentStudents.length,
        percentage: allStudents.length > 0 ? Math.round((presentStudents.length / allStudents.length) * 100) : 0,
        present: presentStudents,
        absent: absentStudents
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close a session manually
// @route   PUT /api/qr-attendance/sessions/:id/close
exports.closeSession = async (req, res, next) => {
  try {
    const [result] = await db.query(
      `UPDATE qr_attendance_sessions SET status = 'closed' WHERE session_id = ? AND status = 'active'`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Active session not found.' });
    }

    res.json({ success: true, message: 'Session closed successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Student QR Attendance Marking
// ==========================================

// @desc    Mark attendance by scanning QR code
// @route   POST /api/qr-attendance/mark
exports.markAttendance = async (req, res, next) => {
  const { session_token } = req.body;

  if (!session_token) {
    return res.status(400).json({ success: false, message: 'Session token is required.' });
  }

  try {
    // 1. Find the session by token
    const [sessions] = await db.query(
      'SELECT * FROM qr_attendance_sessions WHERE session_token = ?',
      [session_token]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid QR code. Session not found.' });
    }

    const session = sessions[0];

    // 2. Check if session is still active
    if (session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This attendance session has been closed.' });
    }

    // 3. Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      // Auto-expire
      await db.query(`UPDATE qr_attendance_sessions SET status = 'expired' WHERE session_id = ?`, [session.session_id]);
      return res.status(400).json({ success: false, message: 'This QR code has expired. Please ask the warden for a new one.' });
    }

    // 4. Get the student_id for the logged-in user
    const [students] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const studentId = students[0].student_id;

    // 5. Check for duplicate attendance
    const [existing] = await db.query(
      'SELECT * FROM qr_attendance_records WHERE session_id = ? AND student_id = ?',
      [session.session_id, studentId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Attendance already marked for this session.' });
    }

    // 6. Mark attendance
    await db.query(
      'INSERT INTO qr_attendance_records (session_id, student_id) VALUES (?, ?)',
      [session.session_id, studentId]
    );

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully!',
      data: {
        session_title: session.title,
        marked_at: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get QR attendance history for the logged-in student
// @route   GET /api/qr-attendance/my-history
exports.getMyQrAttendance = async (req, res, next) => {
  try {
    const [students] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const [history] = await db.query(`
      SELECT qr.record_id, qr.marked_at, qs.title, qs.created_at AS session_date,
             u.name AS created_by_name
      FROM qr_attendance_records qr
      JOIN qr_attendance_sessions qs ON qr.session_id = qs.session_id
      JOIN users u ON qs.created_by = u.id
      WHERE qr.student_id = ?
      ORDER BY qr.marked_at DESC
    `, [students[0].student_id]);

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
