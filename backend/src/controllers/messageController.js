const { db } = require('../config/db');

// @desc    Send private message
// @route   POST /api/messages
exports.sendMessage = async (req, res, next) => {
  const { recipient_role, recipient_id, content, attachment_url, file_name } = req.body;
  try {
    if ((!content || content.trim() === '') && !attachment_url) {
      return res.status(400).json({ success: false, message: 'Message content or attachment is required.' });
    }
    if (!recipient_role && !recipient_id) {
      return res.status(400).json({ success: false, message: 'Please specify a recipient.' });
    }

    await db.query(
      'INSERT INTO private_messages (sender_id, recipient_id, recipient_role, content, attachment_url, file_name) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, recipient_id || null, recipient_role || null, content || '', attachment_url || null, file_name || null]
    );

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for current user (inbox + sent)
// @route   GET /api/messages
exports.getMyMessages = async (req, res, next) => {
  try {
    const { role, id } = req.user;

    // Fetch messages sent TO this user, TO their role group, OR BY this user
    const [messages] = await db.query(`
      SELECT m.*, u.name as sender_name, u.role as sender_role
      FROM private_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.recipient_id = ? OR m.recipient_role = ? OR m.sender_id = ?
      ORDER BY m.created_at DESC
    `, [id, role, id]);

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of users the current user can message
// @route   GET /api/messages/contacts
exports.getContacts = async (req, res, next) => {
  try {
    const { id } = req.user;

    // Fetch all users in the system except the current user, ordered by role and name
    const [rows] = await db.query(
      `SELECT id, name, role FROM users WHERE id != ? ORDER BY role, name`,
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread messages count
// @route   GET /api/messages/unread-count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM private_messages WHERE (recipient_id = ? OR recipient_role = ?) AND is_read = FALSE',
      [id, role]
    );
    res.json({ success: true, count: rows[0].count });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/mark-read
exports.markAsRead = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    await db.query(
      'UPDATE private_messages SET is_read = TRUE WHERE (recipient_id = ? OR recipient_role = ?) AND is_read = FALSE',
      [id, role]
    );
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};
