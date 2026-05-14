const { db } = require('../config/db');

// @desc    Get all inventory items
// @route   GET /api/inventory
exports.getInventory = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM inventory ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update inventory item
// @route   POST /api/inventory
exports.updateInventory = async (req, res, next) => {
  const { name, quantity, description } = req.body;

  try {
    // Check if item exists
    const [rows] = await db.query('SELECT * FROM inventory WHERE name = ?', [name]);
    
    if (rows.length > 0) {
      await db.query(
        'UPDATE inventory SET quantity = ?, description = ? WHERE name = ?',
        [quantity, description, name]
      );
    } else {
      await db.query(
        'INSERT INTO inventory (name, quantity, description) VALUES (?, ?, ?)',
        [name, quantity, description]
      );
    }
    res.json({ success: true, message: 'Inventory updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
exports.deleteInventory = async (req, res, next) => {
  try {
    await db.query('DELETE FROM inventory WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Item removed from inventory' });
  } catch (error) {
    next(error);
  }
};
