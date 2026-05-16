const { db } = require('../config/db');

// @desc    Get all leave requests
// @route   GET /api/leaves
exports.getAllLeaves = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT leave_requests.*, users.name, students.phone 
      FROM leave_requests 
      JOIN students ON leave_requests.student_id = students.student_id
      JOIN users ON students.user_id = users.id
      ORDER BY leave_requests.created_at DESC
    `);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own leave requests
// @route   GET /api/leaves/my
exports.getMyLeaves = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT leave_requests.* 
      FROM leave_requests 
      JOIN students ON leave_requests.student_id = students.student_id
      WHERE students.user_id = ?
      ORDER BY leave_requests.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for leave
// @route   POST /api/leaves
exports.applyLeave = async (req, res, next) => {
  const { reason, from_date, to_date, destination } = req.body;
  try {
    const [students] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) return res.status(404).json({ success: false, message: 'Student profile not found' });

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const leaveFrom = new Date(from_date);
    
    if (leaveFrom < today) {
      return res.status(400).json({ success: false, message: 'Leave cannot be applied for previous days' });
    }

    if (new Date(to_date) < leaveFrom) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const [result] = await db.query(
      'INSERT INTO leave_requests (student_id, reason, destination, from_date, to_date) VALUES (?, ?, ?, ?, ?)',
      [students[0].student_id, reason, destination || 'N/A', from_date, to_date]
    );

    res.status(201).json({ success: true, data: { id: result.insertId, status: 'pending' } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id
exports.updateLeaveStatus = async (req, res, next) => {
  const { status } = req.body;
  try {
    const [result] = await db.query('UPDATE leave_requests SET status = ? WHERE leave_id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, message: 'Leave request updated successfully' });
  } catch (error) {
    next(error);
  }
};
