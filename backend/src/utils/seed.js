const { db } = require('../config/db');
const bcrypt = require('bcryptjs');

const updateDatabase = async () => {
  try {
    console.log('🚀 Starting database updates...');

    // 1. Update users table role enum
    console.log('Updating user roles...');
    await db.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('admin', 'student', 'warden', 'housekeeper', 'security') DEFAULT 'student'
    `);

    // 2. Create notices table
    console.log('Creating notices table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS notices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. Create inventory table
    console.log('Creating inventory table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        quantity INT DEFAULT 0,
        description TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 4. Create mess_menu table
    console.log('Creating mess_menu table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS mess_menu (
        id INT PRIMARY KEY AUTO_INCREMENT,
        day_name ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL UNIQUE,
        tiffin TEXT,
        lunch TEXT,
        snacks TEXT,
        dinner TEXT
      )
    `);

    // 4b. Create private_messages table
    console.log('Creating/Updating private_messages table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS private_messages (
        message_id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        recipient_id INT DEFAULT NULL,
        recipient_role ENUM('admin', 'warden', 'student') DEFAULT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Ensure columns exist for older versions
    try {
      await db.query('ALTER TABLE private_messages ADD COLUMN recipient_id INT DEFAULT NULL AFTER sender_id');
      await db.query('ALTER TABLE private_messages ADD FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL');
    } catch (e) { /* ignore if already exists */ }

    try {
      await db.query("ALTER TABLE private_messages MODIFY COLUMN recipient_role ENUM('admin', 'warden', 'student') DEFAULT NULL");
    } catch (e) { /* ignore */ }    // 4c. Create broadcasts table
    console.log('Creating broadcasts table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS broadcasts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        message TEXT NOT NULL,
        type ENUM('alert', 'emergency', 'info') DEFAULT 'alert',
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4d. Create security tables
    console.log('Creating security tables...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS security_assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        security_id INT NOT NULL,
        location VARCHAR(100) NOT NULL,
        shift ENUM('morning', 'afternoon', 'night') NOT NULL,
        assigned_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (security_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS security_alerts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        security_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type ENUM('emergency', 'suspicious', 'fire', 'other') DEFAULT 'other',
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (security_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4e. Create cleaning tasks table
    console.log('Creating cleaning tasks table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS cleaning_tasks (
        task_id INT PRIMARY KEY AUTO_INCREMENT,
        housekeeper_id INT NOT NULL,
        room_id INT NOT NULL,
        status ENUM('pending', 'completed') DEFAULT 'pending',
        task_date DATE NOT NULL,
        completed_at DATETIME DEFAULT NULL,
        FOREIGN KEY (housekeeper_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
      )
    `);
    // Seed mess menu if empty
    const [menuRows] = await db.query('SELECT COUNT(*) as count FROM mess_menu');
    if (menuRows[0].count === 0) {
      console.log('Seeding mess menu...');
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      for (const day of days) {
        await db.query('INSERT INTO mess_menu (day_name, tiffin, lunch, snacks, dinner) VALUES (?, ?, ?, ?, ?)', 
          [day, 'Not set', 'Not set', 'Not set', 'Not set']);
      }
    }

    // 5. Seed administrator
    console.log('Seeding administrator...');
    const adminEmail = 'administrator@hostel.com';
    const adminPass = 'administrator';
    const [adminRows] = await db.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
    
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPass = await bcrypt.hash(adminPass, salt);

    if (adminRows.length === 0) {
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Administrator', adminEmail, hashedAdminPass, 'admin']
      );
      console.log('✅ Administrator created.');
    } else {
      await db.query(
        'UPDATE users SET password = ?, role = "admin" WHERE email = ?',
        [hashedAdminPass, adminEmail]
      );
      console.log('✅ Administrator updated.');
    }

    // 6. Seed Warden
    console.log('Seeding warden...');
    const wardenEmail = 'warden@hostel.com';
    const wardenPass = 'warden';
    const [wardenRows] = await db.query('SELECT * FROM users WHERE email = ?', [wardenEmail]);
    
    const hashedWardenPass = await bcrypt.hash(wardenPass, salt);

    if (wardenRows.length === 0) {
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Warden', wardenEmail, hashedWardenPass, 'warden']
      );
      console.log('✅ Warden created.');
    } else {
      await db.query(
        'UPDATE users SET password = ?, role = "warden" WHERE email = ?',
        [hashedWardenPass, wardenEmail]
      );
      console.log('✅ Warden updated.');
    }

    // Cleanup old admin if exists
    await db.query('DELETE FROM users WHERE email = ?', ['administrator@gmail.com']);


    // 4f. Update leave_requests with destination
    console.log('Updating leave_requests table...');
    try {
      await db.query('ALTER TABLE leave_requests ADD COLUMN destination VARCHAR(255) AFTER reason');
    } catch (e) { /* ignore */ }

    // 4g. Create staff_profiles table
    console.log('Creating staff_profiles table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS staff_profiles (
        profile_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        phone VARCHAR(15),
        address TEXT,
        designation VARCHAR(100),
        experience VARCHAR(50),
        blood_group VARCHAR(5),
        emergency_contact VARCHAR(15),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4h. Create gate_logs table (Student Entry/Exit)
    console.log('Creating gate_logs table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS gate_logs (
        log_id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        type ENUM('entry', 'exit') NOT NULL,
        destination VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        security_id INT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        FOREIGN KEY (security_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4i. Create attendance_logs table (Staff)
    console.log('Creating attendance_logs table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance_logs (
        attendance_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        type ENUM('check-in', 'check-out') NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4j. Update students table to include USN and Semester if missing (already there but ensuring USN is present)
    try {
      await db.query('ALTER TABLE students ADD COLUMN usn VARCHAR(20) UNIQUE AFTER room_id');
      await db.query('ALTER TABLE students ADD COLUMN semester INT AFTER usn');
    } catch (e) { /* ignore */ }

    // Seed profiles for existing staff
    console.log('Seeding staff profiles...');
    const [staffUsers] = await db.query('SELECT id, role FROM users WHERE role IN ("warden", "admin", "housekeeper", "security")');
    for (const s of staffUsers) {
      const [existing] = await db.query('SELECT * FROM staff_profiles WHERE user_id = ?', [s.id]);
      if (existing.length === 0) {
        await db.query('INSERT INTO staff_profiles (user_id, designation) VALUES (?, ?)', [s.id, s.role.toUpperCase()]);
      }
    }
    const [studentCount] = await db.query('SELECT COUNT(*) as count FROM students');
    if (studentCount[0].count === 0) {
      console.log('Seeding sample data...');
      
      // Add a few rooms
      await db.query('INSERT IGNORE INTO rooms (room_number, block, floor, capacity, status) VALUES (?, ?, ?, ?, ?)', ['101', 'A', 1, 3, 'available']);
      await db.query('INSERT IGNORE INTO rooms (room_number, block, floor, capacity, status) VALUES (?, ?, ?, ?, ?)', ['102', 'A', 1, 3, 'available']);
      
      // Add a sample student
      const [userResult] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['John Doe', 'student@hostel.com', await bcrypt.hash('student', 10), 'student']
      );
      
      await db.query(
        'INSERT INTO students (user_id, student_number, course, branch, year, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [userResult.insertId, 'STU20240001', 'B.Tech', 'CSE', 2, '9876543210']
      );
      console.log('✅ Sample data seeded.');
    }

    // 8. Seed Inventory if empty
    const [invRows] = await db.query('SELECT COUNT(*) as count FROM inventory');
    if (invRows[0].count === 0) {
      console.log('Seeding sample inventory...');
      await db.query('INSERT INTO inventory (name, quantity, description) VALUES (?, ?, ?)', ['Mattress', 50, 'Standard size mattresses']);
      await db.query('INSERT INTO inventory (name, quantity, description) VALUES (?, ?, ?)', ['Study Table', 30, 'Wooden study tables']);
      await db.query('INSERT INTO inventory (name, quantity, description) VALUES (?, ?, ?)', ['Chair', 100, 'Ergonomic chairs']);
    }

    console.log('✨ Database updates completed successfully!');


    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }
};

updateDatabase();
