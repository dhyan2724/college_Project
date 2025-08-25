const mysql = require('mysql2/promise');

// XAMPP MySQL configuration
const dbConfig = {
  host: 'localhost',  // XAMPP MySQL runs on localhost
  user: 'root',
  password: '',  // XAMPP MySQL usually has no password by default
  database: 'lab_inventory',
  port: 3306
};

async function testMySQLConnection() {
  console.log('🔍 Testing MySQL connection through XAMPP...');
  console.log('📍 Connection config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port
  });

  try {
    // First test connection without specifying database
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    
    console.log('\n📡 Attempting to connect to MySQL server...');
    const connection = await mysql.createConnection(tempConfig);
    console.log('✅ Successfully connected to MySQL server!');
    
    // Check if database exists
    console.log('\n📊 Checking if database exists...');
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === 'lab_inventory');
    
    if (dbExists) {
      console.log('✅ Database "lab_inventory" exists!');
      
      // Connect to the specific database
      await connection.execute('USE lab_inventory');
      console.log('✅ Connected to "lab_inventory" database');
      
      // Check tables
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('📋 Available tables:', tables.map(t => Object.values(t)[0]));
      
      // Check if tables have data
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`📊 Table "${tableName}": ${count[0].count} records`);
      }
      
    } else {
      console.log('❌ Database "lab_inventory" does not exist!');
      console.log('💡 You need to create the database first.');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure XAMPP is running');
    console.log('2. Start MySQL service in XAMPP Control Panel');
    console.log('3. Check if port 3306 is not blocked');
    console.log('4. Verify MySQL credentials (usually root with no password)');
  }
}

testMySQLConnection();
