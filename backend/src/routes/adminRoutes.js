const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/all-users', getAllUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);

module.exports = router;

