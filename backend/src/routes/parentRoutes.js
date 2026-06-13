const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { resolveParentStudent } = require('../middleware/parentAccessMiddleware');
const {
  createParent,
  getAllParents,
  deleteParent,
  updateParentMapping,
  getParentDashboard,
  getParentAttendance,
  getParentFees,
  getParentLeaves,
  getParentComplaints,
  getParentNotifications,
  markNotificationRead
} = require('../controllers/parentController');

// --- Admin/Warden Routes: Manage parent accounts ---
router.post('/', protect, authorize('admin', 'warden'), createParent);
router.get('/', protect, authorize('admin', 'warden'), getAllParents);
router.delete('/:id', protect, authorize('admin', 'warden'), deleteParent);
router.put('/:id/mapping', protect, authorize('admin', 'warden'), updateParentMapping);

// --- Parent Routes: View linked student data ---
router.get('/dashboard', protect, authorize('parent'), resolveParentStudent, getParentDashboard);
router.get('/attendance', protect, authorize('parent'), resolveParentStudent, getParentAttendance);
router.get('/fees', protect, authorize('parent'), resolveParentStudent, getParentFees);
router.get('/leaves', protect, authorize('parent'), resolveParentStudent, getParentLeaves);
router.get('/complaints', protect, authorize('parent'), resolveParentStudent, getParentComplaints);
router.get('/notifications', protect, authorize('parent'), resolveParentStudent, getParentNotifications);
router.put('/notifications/:id/read', protect, authorize('parent'), resolveParentStudent, markNotificationRead);

module.exports = router;
