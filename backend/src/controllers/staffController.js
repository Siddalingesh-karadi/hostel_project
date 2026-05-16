const { db } = require('../config/db');

// @desc    Get staff profile
// @route   GET /api/admin/staff-profile/:userId
exports.getStaffProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    const [profile] = await db.query(`
      SELECT u.id as user_id, u.name, u.email, u.role, p.* 
      FROM users u
      LEFT JOIN staff_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `, [userId]);

    if (profile.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, data: profile[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff profile
// @route   PUT /api/admin/staff-profile
exports.updateStaffProfile = async (req, res, next) => {
  const { phone, address, experience, blood_group, emergency_contact, name } = req.body;
  const userId = req.user.id;

  try {
    // Update user name
    if (name) {
      await db.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    }

    // Check if profile exists
    const [existing] = await db.query('SELECT * FROM staff_profiles WHERE user_id = ?', [userId]);

    if (existing.length === 0) {
      await db.query(`
        INSERT INTO staff_profiles (user_id, phone, address, experience, blood_group, emergency_contact)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userId, phone, address, experience, blood_group, emergency_contact]);
    } else {
      await db.query(`
        UPDATE staff_profiles 
        SET phone = ?, address = ?, experience = ?, blood_group = ?, emergency_contact = ?
        WHERE user_id = ?
      `, [phone, address, experience, blood_group, emergency_contact, userId]);
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};
