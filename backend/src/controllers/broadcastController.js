const { db } = require('../config/db');

// @desc    Get active broadcasts
// @route   GET /api/broadcasts
exports.getBroadcasts = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM broadcasts WHERE is_active = TRUE ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a broadcast (Emergency/Alert)
// @route   POST /api/broadcasts
exports.createBroadcast = async (req, res, next) => {
  const { message, type } = req.body;
  const userId = req.user.id;

  try {
    // Optional: Deactivate old broadcasts of the same type if needed
    // await db.query('UPDATE broadcasts SET is_active = FALSE WHERE type = ?', [type]);

    await db.query(
      'INSERT INTO broadcasts (message, type, created_by) VALUES (?, ?, ?)',
      [message, type || 'alert', userId]
    );
    res.status(201).json({ success: true, message: 'Broadcast sent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate a broadcast
// @route   PUT /api/broadcasts/:id/deactivate
exports.deactivateBroadcast = async (req, res, next) => {
  try {
    await db.query('UPDATE broadcasts SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Broadcast deactivated' });
  } catch (error) {
    next(error);
  }
};
