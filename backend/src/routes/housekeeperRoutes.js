const express = require('express');
const router = express.Router();
const { getMyTasks, updateTaskStatus, assignTask } = require('../controllers/housekeeperController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/tasks', authorize('housekeeper'), getMyTasks);
router.put('/tasks/:id', authorize('housekeeper'), updateTaskStatus);
router.post('/assign', authorize('admin'), assignTask);

module.exports = router;
