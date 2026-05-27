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

// @desc    Submit fee payment request (Student only)
// @route   POST /api/fees/:id/pay
exports.submitPaymentRequest = async (req, res, next) => {
  const { amount, transaction_id } = req.body;
  const fee_id = req.params.id;
  try {
    const [student] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const student_id = student[0].student_id;

    // Verify fee record exists and belongs to this student
    const [fee] = await db.query('SELECT * FROM fees WHERE fee_id = ? AND student_id = ?', [fee_id, student_id]);
    if (fee.length === 0) return res.status(404).json({ success: false, message: 'Fee record not found for this student' });

    // Verify transaction_id is provided
    if (!transaction_id || transaction_id.trim() === '') {
      return res.status(400).json({ success: false, message: 'Transaction reference ID is required' });
    }

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    // Insert request
    await db.query(
      'INSERT INTO fee_payment_requests (fee_id, student_id, amount, transaction_id, status) VALUES (?, ?, ?, ?, ?)',
      [fee_id, student_id, amount, transaction_id, 'pending']
    );

    res.status(201).json({ success: true, message: 'Payment request submitted successfully. Awaiting Warden approval.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payment requests (Warden/Admin only)
// @route   GET /api/fees/payment-requests/all
exports.getPaymentRequests = async (req, res, next) => {
  try {
    const [requests] = await db.query(`
      SELECT pr.*, u.name as student_name, s.student_number, f.amount as fee_total, f.paid_amount as fee_paid
      FROM fee_payment_requests pr
      JOIN students s ON pr.student_id = s.student_id
      JOIN users u ON s.user_id = u.id
      JOIN fees f ON pr.fee_id = f.fee_id
      ORDER BY pr.created_at DESC
    `);
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my payment requests (Student only)
// @route   GET /api/fees/payment-requests/my
exports.getMyPaymentRequests = async (req, res, next) => {
  try {
    const [student] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const [requests] = await db.query(`
      SELECT pr.*, f.amount as fee_total
      FROM fee_payment_requests pr
      JOIN fees f ON pr.fee_id = f.fee_id
      WHERE pr.student_id = ?
      ORDER BY pr.created_at DESC
    `, [student[0].student_id]);

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a payment request (Warden/Admin only)
// @route   PUT /api/fees/payment-requests/:requestId/approve
exports.approvePaymentRequest = async (req, res, next) => {
  const request_id = req.params.requestId;
  const { remarks } = req.body;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get the payment request
    const [requestRows] = await connection.query(
      'SELECT * FROM fee_payment_requests WHERE request_id = ?', 
      [request_id]
    );
    if (requestRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Payment request not found' });
    }

    const request = requestRows[0];
    if (request.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Request has already been processed' });
    }

    // 2. Fetch the corresponding fee record
    const [feeRows] = await connection.query(
      'SELECT amount, paid_amount FROM fees WHERE fee_id = ?', 
      [request.fee_id]
    );
    if (feeRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Associated fee record not found' });
    }

    const currentFee = feeRows[0];
    const newPaidAmount = parseFloat(currentFee.paid_amount || 0) + parseFloat(request.amount);
    const totalHostelFee = parseFloat(currentFee.amount) || 67000;

    let finalStatus = 'unpaid';
    if (newPaidAmount >= totalHostelFee) {
      finalStatus = 'paid';
    } else if (newPaidAmount > 0) {
      finalStatus = 'partial';
    }

    // 3. Update the fee record
    await connection.query(
      'UPDATE fees SET status = ?, paid_amount = ?, payment_date = ? WHERE fee_id = ?',
      [finalStatus, newPaidAmount, new Date(), request.fee_id]
    );

    // 4. Update the payment request status to approved
    await connection.query(
      'UPDATE fee_payment_requests SET status = ?, remarks = ? WHERE request_id = ?',
      ['approved', remarks || 'Approved by Warden', request_id]
    );

    await connection.commit();
    res.json({ success: true, message: 'Payment request approved and fee updated successfully' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// @desc    Reject a payment request (Warden/Admin only)
// @route   PUT /api/fees/payment-requests/:requestId/reject
exports.rejectPaymentRequest = async (req, res, next) => {
  const request_id = req.params.requestId;
  const { remarks } = req.body;

  try {
    // Get request
    const [requestRows] = await db.query('SELECT * FROM fee_payment_requests WHERE request_id = ?', [request_id]);
    if (requestRows.length === 0) return res.status(404).json({ success: false, message: 'Payment request not found' });

    const request = requestRows[0];
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request has already been processed' });
    }

    // Update request status to rejected
    await db.query(
      'UPDATE fee_payment_requests SET status = ?, remarks = ? WHERE request_id = ?',
      ['rejected', remarks || 'Rejected by Warden', request_id]
    );

    res.json({ success: true, message: 'Payment request rejected successfully' });
  } catch (error) {
    next(error);
  }
};

