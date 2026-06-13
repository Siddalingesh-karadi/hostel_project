const bcrypt = require('bcryptjs');
const { db } = require('../config/db');

// ==========================================
// Admin: Parent Account Management
// ==========================================

// @desc    Create a parent account and link to a student
// @route   POST /api/parents
exports.createParent = async (req, res, next) => {
  const { name, email, phone, relationship, student_id } = req.body;

  if (!name || !email || !student_id) {
    return res.status(400).json({ success: false, message: 'Name, email, and student_id are required.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Check if student exists
    const [students] = await conn.query('SELECT student_id FROM students WHERE student_id = ?', [student_id]);
    if (students.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // 2. Check if email already exists
    const [existingUser] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // 3. Create user account with role 'parent' (default password = parent's name)
    const hashedPassword = await bcrypt.hash(name, 10);
    const [userResult] = await conn.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'parent']
    );

    const parentUserId = userResult.insertId;

    // 4. Create parent-student mapping
    await conn.query(
      'INSERT INTO parent_student_mapping (parent_user_id, student_id, relationship, phone) VALUES (?, ?, ?, ?)',
      [parentUserId, student_id, relationship || 'guardian', phone || null]
    );

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Parent account created successfully.',
      data: { parent_user_id: parentUserId, student_id }
    });
  } catch (error) {
    if (conn) await conn.rollback();
    next(error);
  } finally {
    if (conn) conn.release();
  }
};

// @desc    Get all parent accounts with linked students
// @route   GET /api/parents
exports.getAllParents = async (req, res, next) => {
  try {
    const [parents] = await db.query(`
      SELECT u.id AS parent_user_id, u.name AS parent_name, u.email AS parent_email,
             psm.relationship, psm.phone AS parent_phone, psm.student_id,
             su.name AS student_name, s.student_number, s.usn, s.branch
      FROM parent_student_mapping psm
      JOIN users u ON psm.parent_user_id = u.id
      JOIN students s ON psm.student_id = s.student_id
      JOIN users su ON s.user_id = su.id
      ORDER BY u.name ASC
    `);

    res.json({ success: true, data: parents });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a parent account
// @route   DELETE /api/parents/:id
exports.deleteParent = async (req, res, next) => {
  try {
    // Deleting the user will cascade-delete the mapping
    const [result] = await db.query('DELETE FROM users WHERE id = ? AND role = ?', [req.params.id, 'parent']);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Parent account not found.' });
    }
    res.json({ success: true, message: 'Parent account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update parent-student mapping
// @route   PUT /api/parents/:id/mapping
exports.updateParentMapping = async (req, res, next) => {
  const { student_id, relationship } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE parent_student_mapping SET student_id = ?, relationship = ? WHERE parent_user_id = ?',
      [student_id, relationship, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Mapping not found.' });
    }
    res.json({ success: true, message: 'Parent mapping updated.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Parent: Dashboard & Data Views
// ==========================================

// @desc    Get parent dashboard (comprehensive student overview)
// @route   GET /api/parents/dashboard
exports.getParentDashboard = async (req, res, next) => {
  try {
    const studentId = req.linkedStudentId;

    // Student profile
    const [profile] = await db.query(`
      SELECT s.*, u.name, u.email, r.room_number, r.block
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN rooms r ON s.room_id = r.room_id
      WHERE s.student_id = ?
    `, [studentId]);

    // Attendance summary (last 30 days)
    const [attendance] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM student_attendance
      WHERE student_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY status
    `, [studentId]);

    const attendanceSummary = { present: 0, absent: 0, on_leave: 0 };
    attendance.forEach(row => { attendanceSummary[row.status] = row.count; });
    const totalDays = attendanceSummary.present + attendanceSummary.absent + attendanceSummary.on_leave;
    attendanceSummary.percentage = totalDays > 0 ? Math.round((attendanceSummary.present / totalDays) * 100) : 0;

    // Fee status (latest)
    const [fees] = await db.query(`
      SELECT * FROM fees WHERE student_id = ? ORDER BY created_at DESC LIMIT 1
    `, [studentId]);

    // Recent leaves (last 5)
    const [leaves] = await db.query(`
      SELECT lr.*, w.name AS warden_name
      FROM leave_requests lr
      LEFT JOIN users w ON lr.approved_by = w.id
      WHERE lr.student_id = ?
      ORDER BY lr.created_at DESC LIMIT 5
    `, [studentId]);

    // Recent complaints (last 5)
    const [complaints] = await db.query(`
      SELECT * FROM complaints WHERE student_id = ? ORDER BY created_at DESC LIMIT 5
    `, [studentId]);

    // Latest notices (last 5)
    const [notices] = await db.query(`
      SELECT n.*, u.name AS created_by_name
      FROM notices n
      JOIN users u ON n.created_by = u.id
      ORDER BY n.created_at DESC LIMIT 5
    `);

    // Unread notification count
    const [[{ unreadCount }]] = await db.query(
      'SELECT COUNT(*) as unreadCount FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        student: profile[0] || null,
        attendance: attendanceSummary,
        fee: fees[0] || null,
        leaves,
        complaints,
        notices,
        unread_notifications: unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed attendance for the linked student
// @route   GET /api/parents/attendance
exports.getParentAttendance = async (req, res, next) => {
  try {
    const studentId = req.linkedStudentId;

    const [history] = await db.query(`
      SELECT sa.date, sa.status, u.name AS marked_by_name
      FROM student_attendance sa
      LEFT JOIN users u ON sa.marked_by = u.id
      WHERE sa.student_id = ?
      ORDER BY sa.date DESC
    `, [studentId]);

    // Monthly stats
    const [monthlyStats] = await db.query(`
      SELECT DATE_FORMAT(date, '%Y-%m') AS month, status, COUNT(*) AS count
      FROM student_attendance
      WHERE student_id = ?
      GROUP BY month, status
      ORDER BY month DESC
    `, [studentId]);

    res.json({ success: true, data: { history, monthlyStats } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fee details for the linked student
// @route   GET /api/parents/fees
exports.getParentFees = async (req, res, next) => {
  try {
    const studentId = req.linkedStudentId;

    const [fees] = await db.query(`
      SELECT * FROM fees WHERE student_id = ? ORDER BY created_at DESC
    `, [studentId]);

    res.json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave requests for the linked student
// @route   GET /api/parents/leaves
exports.getParentLeaves = async (req, res, next) => {
  try {
    const studentId = req.linkedStudentId;

    const [leaves] = await db.query(`
      SELECT lr.*, w.name AS warden_name
      FROM leave_requests lr
      LEFT JOIN users w ON lr.approved_by = w.id
      WHERE lr.student_id = ?
      ORDER BY lr.created_at DESC
    `, [studentId]);

    res.json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints for the linked student
// @route   GET /api/parents/complaints
exports.getParentComplaints = async (req, res, next) => {
  try {
    const studentId = req.linkedStudentId;

    const [complaints] = await db.query(`
      SELECT * FROM complaints WHERE student_id = ? ORDER BY created_at DESC
    `, [studentId]);

    res.json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notifications for the parent
// @route   GET /api/parents/notifications
exports.getParentNotifications = async (req, res, next) => {
  try {
    const [notifications] = await db.query(`
      SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    `, [req.user.id]);

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/parents/notifications/:id/read
exports.markNotificationRead = async (req, res, next) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};
