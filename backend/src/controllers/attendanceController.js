const { db } = require('../config/db');

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

// @desc    Get attendance logs
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
