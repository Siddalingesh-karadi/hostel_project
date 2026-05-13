const express = require('express');
const router = express.Router();
const { 
  getAllFees, 
  getMyFees, 
  createFee, 
  updateFee 
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin', 'warden'), getAllFees);
router.get('/my', getMyFees);
router.post('/', authorize('admin'), createFee);
router.put('/:id', authorize('admin', 'warden'), updateFee);

module.exports = router;
