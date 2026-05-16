const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { toggleAttendance, getLogs } = require('../controllers/attendanceController');

router.post('/toggle', protect, authorize('housekeeper', 'security'), toggleAttendance);
router.get('/logs', protect, authorize('admin', 'warden'), getLogs);

module.exports = router;
