require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    database: 'hostelhub',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  console.log('✅ Connected to TiDB Cloud!\n');

  const statements = [
    // --- Fix missing columns in students ---
    "ALTER TABLE students ADD COLUMN parent_name VARCHAR(100) NULL",
    "ALTER TABLE students ADD COLUMN parent_phone VARCHAR(15) NULL",
    "ALTER TABLE students ADD COLUMN aadhar_number VARCHAR(20) NULL",
    "ALTER TABLE students ADD COLUMN age INT NULL",
    "ALTER TABLE students ADD COLUMN student_number VARCHAR(20) NULL",
    "ALTER TABLE students ADD COLUMN permanent_address TEXT NULL",
    "ALTER TABLE students ADD COLUMN usn VARCHAR(20) NULL",
    "ALTER TABLE students ADD COLUMN semester INT NULL",

    // --- Fix missing column in fees ---
    "ALTER TABLE fees ADD COLUMN paid_amount DECIMAL(10, 2) DEFAULT 0",

    // --- Fix missing columns in leave_requests ---
    "ALTER TABLE leave_requests ADD COLUMN destination VARCHAR(255) DEFAULT 'N/A'",
    "ALTER TABLE leave_requests ADD COLUMN approved_by INT NULL",

    // --- Create settings table ---
    `CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // --- Seed default settings ---
    "INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('fee_deadline', '2025-12-31')",

    // --- Create broadcasts table ---
    `CREATE TABLE IF NOT EXISTS broadcasts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      message TEXT NOT NULL,
      type ENUM('alert', 'emergency', 'info') DEFAULT 'alert',
      is_active BOOLEAN DEFAULT TRUE,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // --- Create staff_profiles table ---
    `CREATE TABLE IF NOT EXISTS staff_profiles (
      profile_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT UNIQUE NOT NULL,
      phone VARCHAR(15),
      address TEXT,
      experience VARCHAR(100),
      blood_group VARCHAR(5),
      emergency_contact VARCHAR(15),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // --- Create security_assignments table ---
    `CREATE TABLE IF NOT EXISTS security_assignments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      security_id INT NOT NULL,
      location VARCHAR(255) NOT NULL,
      shift ENUM('morning', 'evening', 'night') DEFAULT 'morning',
      assigned_date DATE NOT NULL,
      FOREIGN KEY (security_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // --- Create security_alerts table ---
    `CREATE TABLE IF NOT EXISTS security_alerts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      security_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type ENUM('intrusion', 'fire', 'medical', 'other') DEFAULT 'other',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (security_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // --- Create gate_logs table ---
    `CREATE TABLE IF NOT EXISTS gate_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL,
      type ENUM('entry', 'exit') NOT NULL,
      destination VARCHAR(255) DEFAULT 'N/A',
      security_id INT NOT NULL,
      logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
      FOREIGN KEY (security_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // --- Create mess_menu table ---
    `CREATE TABLE IF NOT EXISTS mess_menu (
      id INT PRIMARY KEY AUTO_INCREMENT,
      day_name VARCHAR(15) UNIQUE NOT NULL,
      tiffin TEXT,
      lunch TEXT,
      snacks TEXT,
      dinner TEXT
    )`,

    // --- Seed mess menu data ---
    `INSERT IGNORE INTO mess_menu (day_name, tiffin, lunch, snacks, dinner) VALUES 
      ('Monday','Idli/Dosa','Rice/Dal','Tea/Biscuits','Chapati/Curry'),
      ('Tuesday','Poha/Upma','Rice/Sambar','Tea/Snacks','Rice/Curry'),
      ('Wednesday','Bread/Jam','Rice/Rasam','Tea/Biscuits','Chapati/Sabji'),
      ('Thursday','Idli/Vada','Rice/Dal','Tea/Snacks','Biryani'),
      ('Friday','Dosa/Chutney','Rice/Sambar','Tea/Biscuits','Chapati/Paneer'),
      ('Saturday','Puri/Sabji','Rice/Dal','Tea/Snacks','Fried Rice'),
      ('Sunday','Chole Bhature','Rice/Curry','Tea/Cake','Chapati/Special')`,

    // --- Create notices table ---
    `CREATE TABLE IF NOT EXISTS notices (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_by INT NOT NULL,
      attachment_url VARCHAR(500) NULL,
      file_name VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // --- Create inventory table ---
    `CREATE TABLE IF NOT EXISTS inventory (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) UNIQUE NOT NULL,
      quantity INT DEFAULT 0,
      description TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // --- Create attendance_logs table ---
    `CREATE TABLE IF NOT EXISTS attendance_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      type ENUM('check-in', 'check-out') NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // --- Create student_attendance table ---
    `CREATE TABLE IF NOT EXISTS student_attendance (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL,
      status ENUM('present', 'absent', 'on_leave') DEFAULT 'present',
      date DATE NOT NULL,
      marked_by INT,
      UNIQUE KEY unique_attendance (student_id, date),
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
      FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
    )`,

    // --- Create private_messages table ---
    `CREATE TABLE IF NOT EXISTS private_messages (
      id INT PRIMARY KEY AUTO_INCREMENT,
      sender_id INT NOT NULL,
      recipient_id INT NULL,
      recipient_role VARCHAR(20) NULL,
      content TEXT,
      attachment_url VARCHAR(500) NULL,
      file_name VARCHAR(255) NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    try {
      await conn.execute(statements[i]);
      console.log(`✅ [${i + 1}/${statements.length}] Success`);
      success++;
    } catch (e) {
      if (e.message.includes('Duplicate column') || e.message.includes('already exists')) {
        console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (already exists)`);
        skipped++;
      } else {
        console.log(`❌ [${i + 1}/${statements.length}] ${e.message.substring(0, 120)}`);
        failed++;
      }
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Success: ${success}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);

  // Verify
  const [tables] = await conn.execute('SHOW TABLES');
  console.log(`\n📊 Total tables: ${tables.length}`);
  tables.forEach(t => console.log('  → ' + Object.values(t)[0]));

  await conn.end();
  console.log('\n🎉 Migration complete!');
}

migrate().catch(console.error);
