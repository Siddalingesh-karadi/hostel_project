const { db } = require('../config/db');

// @desc    Get all students
// @route   GET /api/students
exports.getAllStudents = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT students.*, users.name, users.email 
      FROM students 
      JOIN users ON students.user_id = users.id
    `);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
exports.getStudentById = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT students.*, users.name, users.email 
      FROM students 
      JOIN users ON students.user_id = users.id 
      WHERE students.student_id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

const bcrypt = require('bcryptjs');

// @desc    Create student user and profile
// @route   POST /api/students
exports.createStudent = async (req, res, next) => {
  const { name, email, password, course, branch, year, phone, blood_group, address } = req.body;
  
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Create User Account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'student123', salt);

    const [userResult] = await conn.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "student")',
      [name, email, hashedPassword]
    );

    const userId = userResult.insertId;

    // 2. Create Student Profile
    await conn.query(
      'INSERT INTO students (user_id, course, branch, year, phone, blood_group, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, course, branch, year, phone, blood_group, address]
    );

    await conn.commit();
    res.status(201).json({ success: true, message: 'Student created successfully' });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
exports.updateStudent = async (req, res, next) => {
  const { course, branch, year, phone, blood_group, address } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE students SET course=?, branch=?, year=?, phone=?, blood_group=?, address=? WHERE student_id=?',
      [course, branch, year, phone, blood_group, address, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student profile and user account
// @route   DELETE /api/students/:id
exports.deleteStudent = async (req, res, next) => {
  try {
    // 1. Get user_id associated with this student
    const [students] = await db.query('SELECT user_id FROM students WHERE student_id = ?', [req.params.id]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const userId = students[0].user_id;

    // 2. Delete the user (this will automatically delete the student profile due to CASCADE)
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ success: true, message: 'Student and account removed successfully' });
  } catch (error) {
    next(error);
  }
};
