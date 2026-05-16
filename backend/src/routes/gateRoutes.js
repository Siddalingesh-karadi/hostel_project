const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { logGateActivity, verifyLeave } = require('../controllers/gateController');

router.post('/log', protect, authorize('security'), logGateActivity);
router.get('/verify-leave/:leaveId', protect, authorize('security'), verifyLeave);

module.exports = router;
