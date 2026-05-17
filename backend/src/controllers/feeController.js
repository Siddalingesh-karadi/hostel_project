const { db } = require('../config/db');

// @desc    Get all fee records (Admin/Warden only)
// @route   GET /api/fees
exports.getAllFees = async (req, res, next) => {
  try {
    const [fees] = await db.query(`
      SELECT f.*, u.name, s.phone, s.student_number 
      FROM fees f
      JOIN students s ON f.student_id = s.student_id
      JOIN users u ON s.user_id = u.id
      ORDER BY f.due_date DESC
    `);

    res.json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my fee records (Student only)
// @route   GET /api/fees/my
exports.getMyFees = async (req, res, next) => {
  try {
    const [student] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const [fees] = await db.query('SELECT * FROM fees WHERE student_id = ? ORDER BY due_date DESC', [student[0].student_id]);
    res.json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
};

// @desc    Create fee record (Admin only)
// @route   POST /api/fees
exports.createFee = async (req, res, next) => {
  const { student_id, amount, due_date } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO fees (student_id, amount, due_date, status, paid_amount) VALUES (?, ?, ?, ?, ?)',
      [student_id, amount, due_date, 'unpaid', 0]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, amount, status: 'unpaid', paid_amount: 0 } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fee status or amount
// @route   PUT /api/fees/:id
exports.updateFee = async (req, res, next) => {
  const { status, paid_amount } = req.body;
  try {
    // If we are updating paid_amount, we also check if total is reached
    const [feeRows] = await db.query('SELECT amount FROM fees WHERE fee_id = ?', [req.params.id]);
    if (feeRows.length === 0) return res.status(404).json({ success: false, message: 'Fee record not found' });
    
    const totalHostelFee = 67000;
    const paid = parseFloat(paid_amount);
    
    let finalStatus = status;
    if (paid >= totalHostelFee) {
      finalStatus = 'paid';
    } else if (paid > 0) {
      finalStatus = 'partial';
    } else {
      finalStatus = 'unpaid';
    }

    await db.query(
      'UPDATE fees SET status = ?, paid_amount = ?, payment_date = ? WHERE fee_id = ?',
      [finalStatus, paid, finalStatus === 'paid' ? new Date() : null, req.params.id]
    );

    res.json({ success: true, message: 'Fee updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global fee deadline
// @route   GET /api/fees/deadline
exports.getDeadline = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT setting_value FROM settings WHERE setting_key = 'fee_deadline'");
    res.json({ success: true, deadline: rows.length > 0 ? rows[0].setting_value : 'Not Announced Yet' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update global fee deadline (Admin only)
// @route   PUT /api/fees/deadline
exports.updateDeadline = async (req, res, next) => {
  try {
    const { deadline } = req.body;
    await db.query("UPDATE settings SET setting_value = ? WHERE setting_key = 'fee_deadline'", [deadline]);
    res.json({ success: true, message: 'Deadline updated successfully' });
  } catch (error) {
    next(error);
  }
};
