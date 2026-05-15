const { db } = require('../config/db');

// @desc    Get my assignment (Security)
// @route   GET /api/security/assignment
exports.getMyAssignment = async (req, res, next) => {
  try {
    const [assignments] = await db.query(`
      SELECT * FROM security_assignments 
      WHERE security_id = ? AND assigned_date = CURDATE()
    `, [req.user.id]);

    res.json({ success: true, data: assignments[0] || null });
  } catch (error) {
    next(error);
  }
};

// @desc    Send alert (Security)
// @route   POST /api/security/alerts
exports.sendAlert = async (req, res, next) => {
  const { title, description, type } = req.body;
  try {
    await db.query(
      'INSERT INTO security_alerts (security_id, title, description, type) VALUES (?, ?, ?, ?)',
      [req.user.id, title, description, type]
    );

    res.status(201).json({ success: true, message: 'Alert sent to administrator' });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign security location (Admin only)
// @route   POST /api/security/assign
exports.assignSecurity = async (req, res, next) => {
  const { security_id, location, shift, assigned_date } = req.body;
  try {
    await db.query(
      'INSERT INTO security_assignments (security_id, location, shift, assigned_date) VALUES (?, ?, ?, ?)',
      [security_id, location, shift, assigned_date]
    );

    res.status(201).json({ success: true, message: 'Security assigned successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active security locations (Admin only)
// @route   GET /api/security/locations
exports.getSecurityLocations = async (req, res, next) => {
  try {
    const [locations] = await db.query(`
      SELECT a.*, u.name as security_name 
      FROM security_assignments a
      JOIN users u ON a.security_id = u.id
      WHERE a.assigned_date = CURDATE()
    `);

    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all alerts (Admin only)
// @route   GET /api/security/alerts
exports.getAllAlerts = async (req, res, next) => {
  try {
    const [alerts] = await db.query(`
      SELECT a.*, u.name as security_name 
      FROM security_alerts a
      JOIN users u ON a.security_id = u.id
      ORDER BY a.created_at DESC
    `);

    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};
