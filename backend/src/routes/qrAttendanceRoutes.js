const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createSession,
  getActiveSessions,
  getSessionHistory,
  getSessionById,
  getSessionReport,
  closeSession,
  markAttendance,
  getMyQrAttendance
} = require('../controllers/qrAttendanceController');

// --- Warden/Admin Routes ---
router.post('/sessions', protect, authorize('admin', 'warden'), createSession);
router.get('/sessions', protect, authorize('admin', 'warden'), getActiveSessions);
router.get('/sessions/history', protect, authorize('admin', 'warden'), getSessionHistory);
router.get('/sessions/:id', protect, authorize('admin', 'warden'), getSessionById);
router.get('/sessions/:id/report', protect, authorize('admin', 'warden'), getSessionReport);
router.put('/sessions/:id/close', protect, authorize('admin', 'warden'), closeSession);

// --- Student Routes ---
router.post('/mark', protect, authorize('student'), markAttendance);
router.get('/my-history', protect, authorize('student'), getMyQrAttendance);

module.exports = router;
