const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/all-users', protect, authorize('admin'), getAllUsers);

module.exports = router;
