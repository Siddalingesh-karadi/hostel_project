const { db } = require('../config/db');

// @desc    Log student entry/exit
// @route   POST /api/gate/log
exports.logGateActivity = async (req, res, next) => {
  const { student_id, type, destination } = req.body;
  try {
    // 1. Check if student exists
    const [student] = await db.query('SELECT student_id FROM students WHERE student_id = ?', [student_id]);
    if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });

    // 2. Insert log
    await db.query(
      'INSERT INTO gate_logs (student_id, type, destination, security_id) VALUES (?, ?, ?, ?)',
      [student_id, type, destination || 'N/A', req.user.id]
    );

    res.json({ success: true, message: `Gate activity logged: ${type}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave details by ID (for QR scanning)
// @route   GET /api/gate/verify-leave/:leaveId
exports.verifyLeave = async (req, res, next) => {
  try {
    const [leave] = await db.query(`
      SELECT l.*, u.name, s.student_number as usn, s.phone
      FROM leave_requests l
      JOIN students s ON l.student_id = s.student_id
      JOIN users u ON s.user_id = u.id
      WHERE l.leave_id = ?
    `, [req.params.leaveId]);

    if (leave.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave record not found' });
    }

    res.json({ success: true, data: leave[0] });
  } catch (error) {
    next(error);
  }
};
