const express = require('express');
const router = express.Router();
const { getAllComplaints, getMyComplaints, raiseComplaint, updateComplaintStatus } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin', 'warden'), getAllComplaints);
router.get('/my', authorize('student'), getMyComplaints);
router.post('/', authorize('student'), raiseComplaint);
router.put('/:id', authorize('admin', 'warden'), updateComplaintStatus);

module.exports = router;
