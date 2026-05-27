const { db } = require('../config/db');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/stats
exports.getStats = async (req, res, next) => {
  try {
    // 1. Total Active Students
    const [students] = await db.query('SELECT COUNT(*) as count FROM students WHERE status = "active"');
    
    // 1b. Total Students Left Hostel
    const [leftStudents] = await db.query('SELECT COUNT(*) as count FROM students WHERE status = "left"');
    
    // 2. Room Occupancy
    const [rooms] = await db.query('SELECT SUM(occupied) as occupied, SUM(capacity) as capacity FROM rooms');
    
    // 3. Pending Complaints
    const [complaints] = await db.query('SELECT COUNT(*) as count FROM complaints WHERE status = "pending"');
    
    // 4. Unpaid Fees
    const [fees] = await db.query('SELECT SUM(amount) as total FROM fees WHERE status = "unpaid"');

    // 5. Total Rooms
    const [totalRooms] = await db.query('SELECT COUNT(*) as count FROM rooms');

    // 6. Active Security Locations
    const [securityLocations] = await db.query(`
      SELECT u.name, a.location 
      FROM security_assignments a
      JOIN users u ON a.security_id = u.id
      WHERE a.assigned_date = CURDATE()
    `);

    const notifications = [];

    const [recentStudents] = await db.query(`
      SELECT u.name, u.created_at 
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      ORDER BY u.id DESC LIMIT 10
    `);
    recentStudents.forEach(s => notifications.push({ 
      title: 'New Admission', 
      message: `${s.name} recently joined the hostel.`, 
      time: s.created_at || new Date(), 
      type: 'student' 
    }));

    const [recentFees] = await db.query(`
      SELECT f.amount, u.name 
      FROM fees f 
      JOIN students s ON f.student_id = s.student_id 
      JOIN users u ON s.user_id = u.id 
      ORDER BY f.fee_id DESC LIMIT 10
    `);
    recentFees.forEach(f => notifications.push({ 
      title: 'Invoice Generated', 
      message: `$${f.amount} fee invoice generated for ${f.name}.`, 
      time: new Date(), 
      type: 'fee' 
    }));

    const [leavesToday] = await db.query(`
      SELECT COUNT(*) as count 
      FROM leave_requests 
      WHERE status = "approved" AND CURDATE() BETWEEN from_date AND to_date
    `);
    if(leavesToday[0].count > 0) {
      notifications.push({ 
        title: 'Active Leaves', 
        message: `${leavesToday[0].count} student(s) are currently on approved leave today.`, 
        time: new Date(), 
        type: 'leave' 
      });
    }

    res.json({
      success: true,
      data: {
        totalStudents: students[0].count,
        leftStudents: leftStudents[0].count,
        occupancy: `${rooms[0].occupied || 0}/${rooms[0].capacity || 0}`,
        pendingComplaints: complaints[0].count,
        unpaidFees: fees[0].total || 0,
        totalRooms: totalRooms[0].count,
        securityLocations: securityLocations,
        notifications: notifications
      }
    });

  } catch (error) {
    next(error);
  }
};
