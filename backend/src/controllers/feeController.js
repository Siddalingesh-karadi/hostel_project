const { db } = require('../config/db');

// @desc    Get all fee records
// @route   GET /api/fees
exports.getAllFees = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT fees.*, users.name, students.phone 
      FROM fees 
      JOIN students ON fees.student_id = students.student_id
      JOIN users ON students.user_id = users.id
      ORDER BY fees.due_date DESC
    `);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own fee history
// @route   GET /api/fees/my
exports.getMyFees = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT fees.* 
      FROM fees 
      JOIN students ON fees.student_id = students.student_id
      WHERE students.user_id = ?
      ORDER BY fees.due_date DESC
    `, [req.user.id]);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a fee record
// @route   POST /api/fees
exports.addFee = async (req, res, next) => {
  const { student_id, amount, due_date } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO fees (student_id, amount, due_date) VALUES (?, ?, ?)',
      [student_id, amount, due_date]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, amount, status: 'unpaid' } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fee status (Payment)
// @route   PUT /api/fees/:id
exports.updateFeeStatus = async (req, res, next) => {
  const { status } = req.body;
  const paymentDate = status === 'paid' ? new Date() : null;
  
  try {
    const [result] = await db.query(
      'UPDATE fees SET status = ?, payment_date = ? WHERE fee_id = ?',
      [status, paymentDate, req.params.id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Fee record not found' });
    res.json({ success: true, message: 'Fee status updated successfully' });
  } catch (error) {
    next(error);
  }
};
