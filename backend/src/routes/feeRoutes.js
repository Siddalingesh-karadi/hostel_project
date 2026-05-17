const express = require('express');
const router = express.Router();
const { 
  getAllFees, 
  getMyFees, 
  createFee, 
  updateFee,
  getDeadline,
  updateDeadline
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/deadline', getDeadline);
router.put('/deadline', authorize('admin'), updateDeadline);

router.get('/', authorize('admin', 'warden'), getAllFees);
router.get('/my', getMyFees);
router.post('/', authorize('warden'), createFee);
router.put('/:id', authorize('warden', 'student'), updateFee);

module.exports = router;
