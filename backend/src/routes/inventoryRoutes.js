const express = require('express');
const router = express.Router();
const { getInventory, updateInventory, deleteInventory } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Equipment management is for admin
router.get('/', protect, authorize('admin', 'warden'), getInventory);
router.post('/', protect, authorize('warden'), updateInventory);
router.delete('/:id', protect, authorize('warden'), deleteInventory);

module.exports = router;
