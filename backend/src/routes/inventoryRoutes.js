const express = require('express');
const router = express.Router();
const { getInventory, updateInventory, deleteInventory } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Equipment management is for admin
router.get('/', protect, authorize('admin'), getInventory);
router.post('/', protect, authorize('admin'), updateInventory);
router.delete('/:id', protect, authorize('admin'), deleteInventory);

module.exports = router;
