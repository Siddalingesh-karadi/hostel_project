const express = require('express');
const router = express.Router();
const { getAllFees, getMyFees, addFee, updateFeeStatus } = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin', 'warden'), getAllFees);
router.get('/my', authorize('student'), getMyFees);
router.post('/', authorize('admin'), addFee);
router.put('/:id', authorize('admin'), updateFeeStatus);

module.exports = router;
