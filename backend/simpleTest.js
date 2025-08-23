const mysql = require('mysql2/promise');

async function simpleTest() {
  try {
    console.log('Testing database connection...');
    
    // Try to connect with common default settings
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // No password
      database: 'lab_inventory'
    });
    
    console.log('✅ Connected to database successfully!');
    
    // Test if we can query the plasticwares table
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM chemicals');
    console.log('✅ Plasticwares table accessible. Count:', rows[0].count);
    
    // Test if we can insert data
    const testData = {
      name: 'Test Item',
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
    
    // Clean up
    await connection.execute('DELETE FROM plasticwares WHERE id = ?', [result.insertId]);
    console.log('✅ Cleanup successful');
    
    await connection.end();
    console.log('🎉 All tests passed! Database is working correctly.');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 This means the database credentials are incorrect.');
      console.log('💡 You need to check your .env file or MySQL user permissions.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 This means MySQL server is not running.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 This means the database "lab_inventory" does not exist.');
    }
  }
}

simpleTest();
