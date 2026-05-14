const { db } = require('../config/db');

// @desc    Get full mess menu
// @route   GET /api/mess-menu
exports.getMenu = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM mess_menu');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Update mess menu for a day
// @route   PUT /api/mess-menu/:day
exports.updateMenu = async (req, res, next) => {
  const { tiffin, lunch, snacks, dinner } = req.body;
  const day = req.params.day;

  try {
    await db.query(
      'UPDATE mess_menu SET tiffin = ?, lunch = ?, snacks = ?, dinner = ? WHERE day_name = ?',
      [tiffin, lunch, snacks, dinner, day]
    );
    res.json({ success: true, message: `Menu updated for ${day}` });
  } catch (error) {
    next(error);
  }
};
