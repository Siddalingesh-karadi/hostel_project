const express = require('express');
const router = express.Router();
const { getMenu, updateMenu } = require('../controllers/messMenuController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getMenu);
router.put('/:day', protect, authorize('admin'), updateMenu);

module.exports = router;
