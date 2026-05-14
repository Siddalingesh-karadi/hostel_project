const express = require('express');
const router = express.Router();
const { getNotices, createNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getNotices);
router.post('/', protect, authorize('admin', 'warden'), createNotice);
router.delete('/:id', protect, authorize('admin', 'warden'), deleteNotice);

module.exports = router;
