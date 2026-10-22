const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL Connection Pool Configuration
let pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'marketplace_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Test the pool connection on startup asynchronously
  pool.getConnection()
    .then((connection) => {
      console.log('Successfully connected to MySQL database: marketplace_db');
      connection.release();
    })
    .catch((err) => {
      console.warn('MySQL Database connection warning (running with fallback if needed):', err.message);
    });
} catch (error) {
  console.warn('Could not initialize MySQL pool. Running in offline/mock fallback mode.', error.message);
}

module.exports = pool;
