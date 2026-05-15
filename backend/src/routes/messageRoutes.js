const express = require('express');
const router = express.Router();
const { sendMessage, getMyMessages } = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', sendMessage);
router.get('/', authorize('admin'), getMyMessages);

module.exports = router;
