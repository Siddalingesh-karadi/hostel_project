const { db } = require('../config/db');

const addBroadcastTable = async () => {
  try {
    console.log('🚀 Adding broadcasts table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS broadcasts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        message TEXT NOT NULL,
        type ENUM('emergency', 'alert', 'info') DEFAULT 'alert',
        created_by INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Broadcasts table created.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addBroadcastTable();
