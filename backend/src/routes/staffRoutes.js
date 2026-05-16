const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getStaffProfile, updateStaffProfile } = require('../controllers/staffController');

router.get('/profile', protect, getStaffProfile);
router.get('/profile/:userId', protect, authorize('admin', 'warden'), getStaffProfile);
router.put('/profile', protect, updateStaffProfile);

module.exports = router;
