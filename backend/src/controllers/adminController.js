const { db } = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get all staff and students (details for admin)
// @route   GET /api/admin/all-users
exports.getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, email, role, created_at 
      FROM users 
      WHERE role IN ('warden', 'housekeeper', 'security')
    `);

    const [students] = await db.query(`
      SELECT u.id, u.name, u.email, u.role, s.* 
      FROM users u 
      JOIN students s ON u.id = s.user_id 
      WHERE u.role = 'student'
    `);

    res.json({ 
      success: true, 
      data: {
        staff: users,
        students: students
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin create new user (any role)
// @route   POST /api/admin/users
exports.createUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    const [exists] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (exists.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const userId = result.insertId;
    if (role === 'student') {
      await db.query('INSERT INTO students (user_id) VALUES (?)', [userId]);
    }

    res.status(201).json({ success: true, message: `${role} account created successfully` });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

