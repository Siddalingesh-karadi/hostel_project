const express = require('express');
const router = express.Router();
const { getAllRooms, addRoom, allocateRoom, deallocateRoom, updateRoom, getMyRoommates } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my-roommates', getMyRoommates);
router.get('/', getAllRooms);
router.post('/', authorize('admin'), addRoom);
router.put('/:id', authorize('admin', 'warden'), updateRoom);
router.post('/allocate', authorize('admin', 'warden'), allocateRoom);
router.post('/deallocate', authorize('admin', 'warden'), deallocateRoom);


module.exports = router;
