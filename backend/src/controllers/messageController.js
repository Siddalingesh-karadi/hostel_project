const { db } = require('../config/db');

// @desc    Send private message to admin/administrator
// @route   POST /api/messages
exports.sendMessage = async (req, res, next) => {
  const { recipient_role, content } = req.body;
  try {
    await db.query(
      'INSERT INTO private_messages (sender_id, recipient_role, content) VALUES (?, ?, ?)',
      [req.user.id, recipient_role, content]
    );

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for current user (Admin/Administrator)
// @route   GET /api/messages
exports.getMyMessages = async (req, res, next) => {
  try {
    // Only admins can see messages targeted at their role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [messages] = await db.query(`
      SELECT m.*, u.name as sender_name, u.role as sender_role 
      FROM private_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.recipient_role = 'admin'
      ORDER BY m.created_at DESC
    `);

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};
