const { db } = require('../config/db');

// @desc    Get all complaints
// @route   GET /api/complaints
exports.getAllComplaints = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT complaints.*, students.phone, users.name 
      FROM complaints 
      JOIN students ON complaints.student_id = students.student_id
      JOIN users ON students.user_id = users.id
      ORDER BY complaints.created_at DESC
    `);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own complaints
// @route   GET /api/complaints/my
exports.getMyComplaints = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT complaints.* 
      FROM complaints 
      JOIN students ON complaints.student_id = students.student_id
      WHERE students.user_id = ?
      ORDER BY complaints.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Raise a new complaint
// @route   POST /api/complaints
exports.raiseComplaint = async (req, res, next) => {
  const { title, description, category, priority } = req.body;
  
  try {
    // Get student_id from user_id
    const [students] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const student_id = students[0].student_id;

    const [result] = await db.query(
      'INSERT INTO complaints (student_id, title, description, category, priority) VALUES (?, ?, ?, ?, ?)',
      [student_id, title, description, category, priority]
    );

    res.status(201).json({ success: true, data: { id: result.insertId, title, status: 'pending' } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
exports.updateComplaintStatus = async (req, res, next) => {
  const { status } = req.body;
  try {
    const [result] = await db.query('UPDATE complaints SET status = ? WHERE complaint_id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    next(error);
  }
};
