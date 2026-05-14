const express = require('express');
const router = express.Router();
const { getBroadcasts, createBroadcast, deactivateBroadcast } = require('../controllers/broadcastController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getBroadcasts);
router.post('/', protect, authorize('admin', 'warden'), createBroadcast);
router.put('/:id/deactivate', protect, authorize('admin', 'warden'), deactivateBroadcast);

module.exports = router;
