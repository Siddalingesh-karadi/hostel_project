const { db } = require('../config/db');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/stats
exports.getStats = async (req, res, next) => {
  try {
    // 1. Total Students
    const [students] = await db.query('SELECT COUNT(*) as count FROM students');
    
    // 2. Room Occupancy
    const [rooms] = await db.query('SELECT SUM(occupied) as occupied, SUM(capacity) as capacity FROM rooms');
    
    // 3. Pending Complaints
    const [complaints] = await db.query('SELECT COUNT(*) as count FROM complaints WHERE status = "pending"');
    
    // 4. Unpaid Fees
    const [fees] = await db.query('SELECT SUM(amount) as total FROM fees WHERE status = "unpaid"');

    res.json({
      success: true,
      data: {
        totalStudents: students[0].count,
        occupancy: `${rooms[0].occupied || 0}/${rooms[0].capacity || 0}`,
        pendingComplaints: complaints[0].count,
        unpaidFees: fees[0].total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
