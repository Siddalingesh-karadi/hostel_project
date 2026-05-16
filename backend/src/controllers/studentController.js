const { db } = require('../config/db');

// @desc    Get all students
// @route   GET /api/students
exports.getAllStudents = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT students.*, users.name, users.email, rooms.room_number, rooms.block
      FROM students 
      JOIN users ON students.user_id = users.id
      LEFT JOIN rooms ON students.room_id = rooms.room_id
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
      SELECT students.*, users.name, users.email, rooms.room_number, rooms.block
      FROM students 
      JOIN users ON students.user_id = users.id 
      LEFT JOIN rooms ON students.room_id = rooms.room_id
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
  const { 
    name, email, course, branch, year, phone, blood_group, address,
    parent_name, parent_phone, aadhar_number, age, permanent_address,
    usn, semester
  } = req.body;

  
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Create User Account
    const hashedPassword = await bcrypt.hash('student123', 10);
    const [userResult] = await conn.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'student']
    );

    const userId = userResult.insertId;

    // Generate student_number (e.g., STU + year + ID)
    const student_number = `STU${year}${userId.toString().padStart(4, '0')}`;

    // 2. Create Student Profile
    await conn.query(
      `INSERT INTO students (
        user_id, course, branch, year, phone, blood_group, address, 
        parent_name, parent_phone, aadhar_number, age, student_number, permanent_address,
        usn, semester
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, course, branch, year, phone, blood_group, address,
        parent_name, parent_phone, aadhar_number, age, student_number, permanent_address,
        usn, semester
      ]
    );


    await conn.commit();
    res.status(201).json({ success: true, message: 'Student registered successfully' });
  } catch (error) {
    if (conn) await conn.rollback();
    next(error);
  } finally {
    if (conn) conn.release();
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
exports.updateStudent = async (req, res, next) => {
  const { 
    name, course, branch, year, phone, blood_group, address,
    parent_name, parent_phone, aadhar_number, age, student_number, permanent_address,
    usn, semester
  } = req.body;


  try {
    const [result] = await db.query(
      `UPDATE students s
       JOIN users u ON s.user_id = u.id
       SET u.name = ?, s.course = ?, s.branch = ?, s.year = ?, s.phone = ?, s.blood_group = ?, s.address = ?,
           s.parent_name = ?, s.parent_phone = ?, s.aadhar_number = ?, s.age = ?, s.student_number = ?, s.permanent_address = ?,
           s.usn = ?, s.semester = ?
       WHERE s.student_id = ?`,

      [
        name, course, branch, year, phone, blood_group, address,
        parent_name, parent_phone, aadhar_number, age, student_number, permanent_address,
        usn, semester,
        req.params.id
      ]
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

// @desc    Get current student profile
// @route   GET /api/students/me
exports.getMyProfile = async (req, res, next) => {
  try {
    const [student] = await db.query(
      `SELECT s.*, u.name, u.email, r.room_number, r.block 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       LEFT JOIN rooms r ON s.room_id = r.room_id 
       WHERE s.user_id = ?`,
      [req.user.id]
    );

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, data: student[0] });
  } catch (error) {
    next(error);
  }
};
