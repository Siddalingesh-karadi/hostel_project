const { db } = require('../config/db');

// @desc    Get all notices
// @route   GET /api/notices
exports.getNotices = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, u.name as posted_by, u.role as poster_role 
      FROM notices n 
      JOIN users u ON n.created_by = u.id 
      ORDER BY n.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a notice
// @route   POST /api/notices
exports.createNotice = async (req, res, next) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const [result] = await db.query(
      'INSERT INTO notices (title, content, created_by) VALUES (?, ?, ?)',
      [title, content, userId]
    );
    res.status(201).json({ success: true, message: 'Notice posted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
exports.deleteNotice = async (req, res, next) => {
  try {
    await db.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    next(error);
  }
};
