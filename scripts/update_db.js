const { db } = require('../backend/src/config/db');
const bcrypt = require('bcryptjs');

const updateDatabase = async () => {
  try {
    console.log('🚀 Starting database updates...');

    // 1. Update users table role enum
    // Note: In MySQL, we can use ALTER TABLE to modify ENUM
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
    const adminEmail = 'administrator@gmail.com';
    const adminPass = 'administrator';
    const [adminRows] = await db.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(adminPass, salt);

    if (adminRows.length === 0) {
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Administrator', adminEmail, hashedPass, 'admin']
      );
      console.log('✅ Administrator created.');
    } else {
      // Update password just in case
      await db.query(
        'UPDATE users SET password = ?, role = "admin" WHERE email = ?',
        [hashedPass, adminEmail]
      );
      console.log('✅ Administrator updated.');
    }

    console.log('✨ Database updates completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }
};

updateDatabase();
