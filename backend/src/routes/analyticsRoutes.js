const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin', 'warden'), getStats);

module.exports = router;
