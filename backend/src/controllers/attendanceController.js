const { db } = require('../config/db');

// ==========================================
// 1. Staff Attendance Logs (Check-In / Out)
// ==========================================

// @desc    Check-in/Check-out for staff
// @route   POST /api/attendance/toggle
exports.toggleAttendance = async (req, res, next) => {
  const { type } = req.body; // 'check-in' or 'check-out'
  try {
    await db.query(
      'INSERT INTO attendance_logs (user_id, type) VALUES (?, ?)',
      [req.user.id, type]
    );
    res.json({ success: true, message: `Successfully ${type}ed` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get staff attendance logs
// @route   GET /api/attendance/logs
exports.getLogs = async (req, res, next) => {
  try {
    const [logs] = await db.query(`
      SELECT a.*, u.name, u.role
      FROM attendance_logs a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.timestamp DESC
      LIMIT 100
    `);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. Student Daily Roll Call Attendance
// ==========================================

// @desc    Get student list with their attendance/leave status for a specific date
// @route   GET /api/attendance/students
exports.getStudentAttendanceList = async (req, res, next) => {
  const { date, block, floor } = req.query;
  const targetDate = date || new Date().toISOString().slice(0, 10);

  try {
    let queryParams = [targetDate, targetDate];
    let query = `
      SELECT s.student_id, u.name, s.student_number, s.usn, s.semester, s.branch, r.room_number, r.block, r.floor,
             sa.status AS attendance_status,
             (SELECT COUNT(*) FROM leave_requests WHERE student_id = s.student_id AND status = 'approved' AND ? BETWEEN from_date AND to_date) AS on_approved_leave
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.room_id
      LEFT JOIN student_attendance sa ON s.student_id = sa.student_id AND sa.date = ?
      WHERE 1=1
    `;

    if (block) {
      query += ` AND r.block = ?`;
      queryParams.push(block);
    }
    if (floor) {
      query += ` AND r.floor = ?`;
      queryParams.push(floor);
    }

    query += ` ORDER BY r.room_number ASC, u.name ASC`;

    const [students] = await db.query(query, queryParams);
    
    // Format the response, resolving default status (e.g. if student has approved leave, default to 'on_leave')
    const formattedStudents = students.map(student => {
      let resolvedStatus = student.attendance_status;
      if (!resolvedStatus) {
        resolvedStatus = student.on_approved_leave > 0 ? 'on_leave' : 'unmarked';
      }
      return {
        ...student,
        status: resolvedStatus
      };
    });

    res.json({ success: true, date: targetDate, data: formattedStudents });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit student attendance list for a specific date
// @route   POST /api/attendance/submit
exports.submitStudentAttendance = async (req, res, next) => {
  const { date, records } = req.body; // records: [{ student_id, status }]
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const markedBy = req.user.id;

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty records provided' });
  }

  try {
    // Format records for bulk insert [[student_id, status, date, marked_by], ...]
    const values = records.map(r => [r.student_id, r.status, targetDate, markedBy]);

    await db.query(
      `INSERT INTO student_attendance (student_id, status, date, marked_by) 
       VALUES ? 
       ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)`,
      [values]
    );

    res.json({ success: true, message: `Attendance for ${targetDate} saved successfully` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall student attendance stats for dashboard
// @route   GET /api/attendance/stats
exports.getAttendanceStats = async (req, res, next) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().slice(0, 10);

  try {
    // Total students
    const [[{ totalStudents }]] = await db.query('SELECT COUNT(*) as totalStudents FROM students');

    // Present, Absent, On Leave counts for that date
    const [counts] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM student_attendance 
      WHERE date = ? 
      GROUP BY status
    `, [targetDate]);

    const stats = {
      date: targetDate,
      totalStudents,
      present: 0,
      absent: 0,
      on_leave: 0,
      unmarked: totalStudents
    };

    counts.forEach(row => {
      stats[row.status] = row.count;
    });

    stats.unmarked = Math.max(0, totalStudents - (stats.present + stats.absent + stats.on_leave));

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history for the currently logged-in student
// @route   GET /api/attendance/student-history
exports.getStudentAttendanceHistory = async (req, res, next) => {
  try {
    const [history] = await db.query(`
      SELECT sa.date, sa.status, u.name as marked_by_name
      FROM student_attendance sa
      JOIN students s ON sa.student_id = s.student_id
      LEFT JOIN users u ON sa.marked_by = u.id
      WHERE s.user_id = ?
      ORDER BY sa.date DESC
    `, [req.user.id]);

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
