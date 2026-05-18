const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  toggleAttendance, 
  getLogs,
  getStudentAttendanceList,
  submitStudentAttendance,
  getAttendanceStats,
  getStudentAttendanceHistory
} = require('../controllers/attendanceController');

// 1. Staff Attendance Logs
router.post('/toggle', protect, authorize('security'), toggleAttendance);
router.get('/logs', protect, authorize('admin', 'warden'), getLogs);

// 2. Student Daily Attendance
router.get('/students', protect, authorize('admin', 'warden'), getStudentAttendanceList);
router.post('/submit', protect, authorize('admin', 'warden'), submitStudentAttendance);
router.get('/stats', protect, authorize('admin', 'warden'), getAttendanceStats);
router.get('/student-history', protect, authorize('student'), getStudentAttendanceHistory);

module.exports = router;
