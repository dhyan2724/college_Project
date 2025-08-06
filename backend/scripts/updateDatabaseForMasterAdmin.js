require('dotenv').config();
const { pool } = require('../config/database');

async function updateDatabaseForMasterAdmin() {
  try {
    console.log('Updating database schema for Master Admin role...');
    
    // Update the users table to include master_admin role
    const [result] = await pool.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('master_admin', 'admin', 'faculty', 'student', 'phd_scholar', 'dissertation_student') NOT NULL
    `);
    
    console.log('✅ Database schema updated successfully!');
    console.log('Master Admin role has been added to the users table.');
    
    // Check if there are any existing users
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log(`Current number of users in database: ${users[0].count}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Run createMasterAdmin.js to create your master admin account');
    console.log('2. Login with master admin credentials');
    console.log('3. Use the master admin dashboard to manage all users');
    
  } catch (error) {
    console.error('❌ Error updating database schema:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Schema already updated. Master admin role already exists.');
    }
  } finally {
    // Close the pool
    await pool.end();
    console.log('\n🔐 Database connection closed.');
  }
}

// Run the script
updateDatabaseForMasterAdmin(); 