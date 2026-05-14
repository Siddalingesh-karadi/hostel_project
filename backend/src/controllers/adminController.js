const { db } = require('../config/db');

// @desc    Get all staff and students (details for admin)
// @route   GET /api/admin/all-users
exports.getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, email, role, created_at 
      FROM users 
      WHERE role IN ('warden', 'housekeeper', 'security')
    `);

    const [students] = await db.query(`
      SELECT u.id, u.name, u.email, u.role, s.* 
      FROM users u 
      JOIN students s ON u.id = s.user_id 
      WHERE u.role = 'student'
    `);

    res.json({ 
      success: true, 
      data: {
        staff: users,
        students: students
      }
    });
  } catch (error) {
    next(error);
  }
};
