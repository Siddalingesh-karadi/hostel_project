const express = require('express');
const router = express.Router();
const { 
  getAllStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  getMyProfile
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.get('/me', protect, getMyProfile);
router.get('/', protect, authorize('admin', 'warden'), getAllStudents);
router.get('/:id', getStudentById); // Students can see their own profile
router.post('/', authorize('admin'), createStudent);
router.put('/:id', authorize('admin', 'warden'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);

module.exports = router;
