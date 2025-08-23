const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lab_inventory',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    // First, test connection without specifying database
    const tempConfig = { ...dbConfig };
    delete tempConfig.database; // Remove database from config for initial connection
    const tempPool = mysql.createPool(tempConfig);
    
    const connection = await tempPool.getConnection();
    console.log('Connected to MySQL server successfully');
    connection.release();
    tempPool.end(); // Close temporary pool
    return true;
  } catch (error) {
    console.error('Could not connect to MySQL database:', error);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create connection without specifying database for initial setup
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    const tempPool = mysql.createPool(tempConfig);
    const connection = await tempPool.getConnection();
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);
    
    // Read and execute schema file
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }
      console.log('Database schema initialized successfully');
    }
    
    // Post-initialization: ensure 'type' column exists on 'miscellaneous'
    try {
      const [columns] = await connection.query("SHOW COLUMNS FROM miscellaneous LIKE 'type'");
      if (!columns || columns.length === 0) {
        await connection.query('ALTER TABLE miscellaneous ADD COLUMN type VARCHAR(255)');
        console.log("Added 'type' column to 'miscellaneous'");
      }
    } catch (colErr) {
      console.warn("Could not verify/add 'type' column on 'miscellaneous':", colErr.message);
    }
    
    connection.release();
    tempPool.end(); // Close temporary pool
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('master_admin', 'admin', 'faculty', 'student', 'phd_scholar', 'dissertation_student') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    fullName VARCHAR(255) NOT NULL,
    rollNo VARCHAR(255) UNIQUE,
    year VARCHAR(20),
    department VARCHAR(100),
    category ENUM('UG/PG', 'PhD', 'Project Student'),
    lastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX role_index (role)
)`;

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};