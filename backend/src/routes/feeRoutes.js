const express = require('express');
const router = express.Router();
const { 
  getAllFees, 
  getMyFees, 
  createFee, 
  updateFee,
  getDeadline,
  updateDeadline,
  submitPaymentRequest,
  getPaymentRequests,
  getMyPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/deadline', getDeadline);
router.put('/deadline', authorize('admin'), updateDeadline);

// Payment Requests (Must be defined before general /:id routes)
router.get('/payment-requests/all', authorize('warden', 'admin'), getPaymentRequests);
router.get('/payment-requests/my', authorize('student'), getMyPaymentRequests);
router.put('/payment-requests/:requestId/approve', authorize('warden', 'admin'), approvePaymentRequest);
router.put('/payment-requests/:requestId/reject', authorize('warden', 'admin'), rejectPaymentRequest);

router.get('/', authorize('admin', 'warden'), getAllFees);
router.get('/my', getMyFees);
router.post('/', authorize('warden'), createFee);
router.put('/:id', authorize('warden', 'admin'), updateFee);
router.post('/:id/pay', authorize('student'), submitPaymentRequest);

module.exports = router;

