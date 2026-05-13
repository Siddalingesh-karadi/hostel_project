const express = require('express');
const router = express.Router();
const { getAllLeaves, getMyLeaves, applyLeave, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin', 'warden'), getAllLeaves);
router.get('/my', authorize('student'), getMyLeaves);
router.post('/', authorize('student'), applyLeave);
router.put('/:id', authorize('warden', 'admin'), updateLeaveStatus);

module.exports = router;
