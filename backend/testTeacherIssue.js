const mysql = require('mysql2/promise');
require('dotenv').config();

async function testTeacherIssue() {
  try {
    // Test database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lab_inventory'
    });

    console.log('✅ Database connection successful');

    // Test pending requests table
    const [pendingRequests] = await connection.execute('SELECT * FROM pending_requests LIMIT 5');
    console.log('✅ Pending requests table accessible');
    console.log('Sample pending requests:', pendingRequests);

    // Test pending_request_items table
    const [pendingRequestItems] = await connection.execute('SELECT * FROM pending_request_items LIMIT 5');
    console.log('✅ Pending request items table accessible');
    console.log('Sample pending request items:', pendingRequestItems);

    // Test issued_items table
    const [issuedItems] = await connection.execute('SELECT * FROM issued_items LIMIT 5');
    console.log('✅ Issued items table accessible');
    console.log('Sample issued items:', issuedItems);

    // Test users table
    const [users] = await connection.execute('SELECT id, username, fullName, role FROM users WHERE role = "faculty" LIMIT 5');
    console.log('✅ Users table accessible');
    console.log('Sample faculty users:', users);

    // Test if there are any pending requests for faculty
    if (users.length > 0) {
      const facultyId = users[0].id;
      const [facultyRequests] = await connection.execute(
        'SELECT * FROM pending_requests WHERE facultyInChargeId = ? LIMIT 5',
        [facultyId]
      );
      console.log(`✅ Found ${facultyRequests.length} pending requests for faculty ${facultyId}`);
      
      if (facultyRequests.length > 0) {
        const requestId = facultyRequests[0].id;
        const [requestItems] = await connection.execute(
          'SELECT * FROM pending_request_items WHERE pendingRequestId = ?',
          [requestId]
        );
        console.log(`✅ Found ${requestItems.length} items for request ${requestId}`);
        console.log('Request items:', requestItems);
      }
    }

    await connection.end();
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTeacherIssue();
