const { pool } = require('./config/database');
const Plasticware = require('./models/Plasticware');

async function testPlasticware() {
  try {
    console.log('Testing plasticware database operations...');
    
    // Test 1: Check if we can connect to the database
    console.log('1. Testing database connection...');
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', rows);
    
    // Test 2: Check if the plasticwares table exists and has data
    console.log('2. Checking plasticwares table...');
    const [tableRows] = await pool.execute('SHOW TABLES LIKE "plasticwares"');
    console.log('✅ Plasticwares table exists:', tableRows);
    
    // Test 3: Check table structure
    console.log('3. Checking table structure...');
    const [structureRows] = await pool.execute('DESCRIBE plasticwares');
    console.log('✅ Table structure:', structureRows);
    
    // Test 4: Check if there are any existing records
    console.log('4. Checking existing records...');
    const [existingRows] = await pool.execute('SELECT COUNT(*) as count FROM plasticwares');
    console.log('✅ Existing records count:', existingRows);
    
    // Test 5: Try to create a test plasticware
    console.log('5. Testing create operation...');
    const testData = {
      name: 'Test Plasticware',
      type: 'Test Type',
      storagePlace: 'Test Location',
      totalQuantity: 10,
      company: 'Test Company',
      
    };
    
    const newPlasticware = await Plasticware.create(testData);
    console.log('✅ Create operation successful:', newPlasticware);
    
    // Test 6: Try to retrieve the created plasticware
    console.log('6. Testing findById operation...');
    const foundPlasticware = await Plasticware.findById(newPlasticware.id);
    console.log('✅ FindById operation successful:', foundPlasticware);
    
    // Test 7: Try to retrieve all plasticwares
    console.log('7. Testing findAll operation...');
    const allPlasticwares = await Plasticware.findAll();
    console.log('✅ FindAll operation successful. Count:', allPlasticwares.length);
    console.log('Sample data:', allPlasticwares.slice(0, 2));
    
    // Test 8: Clean up test data
    console.log('8. Cleaning up test data...');
    await Plasticware.deleteById(newPlasticware.id);
    console.log('✅ Cleanup successful');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testPlasticware();
