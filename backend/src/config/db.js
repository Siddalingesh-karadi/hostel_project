const mysql = require('mysql2/promise');
require('dotenv').config();

// Determine if SSL is needed (TiDB Cloud / production)
const isSSL = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// TiDB Cloud requires SSL connections
if (isSSL) {
  poolConfig.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  };
  console.log('🔒 SSL enabled for database connection');
}

const db = mysql.createPool(poolConfig);

// Test connection function
const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully!');
    console.log(`📍 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { db, testConnection };
