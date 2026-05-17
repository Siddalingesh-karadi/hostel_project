const { db } = require('../config/db');

// @desc    Send private message
// @route   POST /api/messages
exports.sendMessage = async (req, res, next) => {
  const { recipient_role, recipient_id, content } = req.body;
  try {
    await db.query(
      'INSERT INTO private_messages (sender_id, recipient_id, recipient_role, content) VALUES (?, ?, ?, ?)',
      [req.user.id, recipient_id || null, recipient_role || null, content]
    );

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for current user
// @route   GET /api/messages
exports.getMyMessages = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    
    let messages;
    if (role === 'admin' || role === 'warden') {
      // Staff see messages sent to their role
      [messages] = await db.query(`
        SELECT m.*, u.name as sender_name, u.role as sender_role 
        FROM private_messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.recipient_role = ?
        ORDER BY m.created_at DESC
      `, [role]);
    } else {
      // Students see messages sent directly to them
      [messages] = await db.query(`
        SELECT m.*, u.name as sender_name, u.role as sender_role 
        FROM private_messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.recipient_id = ?
        ORDER BY m.created_at DESC
      `, [id]);
    }

    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread messages count
// @route   GET /api/messages/unread-count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let count = 0;
    
    if (role === 'admin' || role === 'warden') {
      const [rows] = await db.query('SELECT COUNT(*) as count FROM private_messages WHERE recipient_role = ? AND is_read = FALSE', [role]);
      count = rows[0].count;
    } else {
      const [rows] = await db.query('SELECT COUNT(*) as count FROM private_messages WHERE recipient_id = ? AND is_read = FALSE', [id]);
      count = rows[0].count;
    }
    
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/mark-read
exports.markAsRead = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    
    if (role === 'admin' || role === 'warden') {
      await db.query('UPDATE private_messages SET is_read = TRUE WHERE recipient_role = ? AND is_read = FALSE', [role]);
    } else {
      await db.query('UPDATE private_messages SET is_read = TRUE WHERE recipient_id = ? AND is_read = FALSE', [id]);
    }
    
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};
