// Load environment variables first
require('dotenv').config();

const mysql = require('mysql2/promise');

async function testWithEnv() {
  try {
    console.log('Testing database connection with environment variables...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
    console.log('DB_NAME:', process.env.DB_NAME);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lab_inventory'
    });
    
    console.log('✅ Connected to database successfully!');
    
    // Test if we can query the plasticwares table
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM plasticwares');
    console.log('✅ Plasticwares table accessible. Count:', rows[0].count);
    
    // Test if we can insert data
    const testData = {
      name: 'Test Plasticware',
      type: 'Test Type',
      storagePlace: 'Test Location',
      totalQuantity: 5,
      company: 'Test Company',
      catalogNumber: 'TEST-' + Date.now()
    };
    
    const [result] = await connection.execute(
      'INSERT INTO plasticwares (name, type, storagePlace, totalQuantity, availableQuantity, company, catalogNumber, plasticwareId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [testData.name, testData.type, testData.storagePlace, testData.totalQuantity, testData.totalQuantity, testData.company, testData.catalogNumber, 'TEST-ID-' + Date.now()]
    );
    
    console.log('✅ Insert test successful. ID:', result.insertId);
    
    // Verify the data was inserted
    const [insertedRows] = await connection.execute('SELECT * FROM plasticwares WHERE id = ?', [result.insertId]);
    console.log('✅ Data verification successful:', insertedRows[0]);
    
    // Clean up
    await connection.execute('DELETE FROM plasticwares WHERE id = ?', [result.insertId]);
    console.log('✅ Cleanup successful');
    
    await connection.end();
    console.log('🎉 All tests passed! Database is working correctly.');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  }
}

testWithEnv();
