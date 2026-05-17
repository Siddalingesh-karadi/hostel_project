const express = require('express');
const router = express.Router();
const { sendMessage, getMyMessages, getUnreadCount, markAsRead } = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', sendMessage);
router.get('/', getMyMessages);
router.get('/unread-count', getUnreadCount);
router.put('/mark-read', markAsRead);

module.exports = router;
