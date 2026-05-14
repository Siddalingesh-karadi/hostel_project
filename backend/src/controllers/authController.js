const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    // 1. Check if user exists or if email is protected
    if (email === 'administrator@gmail.com') {
      return res.status(400).json({ success: false, message: 'This email is reserved for administration' });
    }

    if (role === 'admin') {
      return res.status(400).json({ success: false, message: 'Administrator accounts cannot be created manually' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'student']
    );

    const userId = result.insertId;

    // 4. Create blank student profile if role is student
    if ((role || 'student') === 'student') {
      await db.query('INSERT INTO students (user_id) VALUES (?)', [userId]);
    }

    // 5. Generate Token
    const token = jwt.sign({ id: result.insertId, role: role || 'student' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: result.insertId, name, email, role: role || 'student' }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Check user
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Generate Token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};
