require('dotenv').config();
const { pool } = require('../config/database');

async function fixMasterAdminRole() {
  try {
    console.log('🔧 Fixing Master Admin Role...');
    
    // Update the existing user to have master_admin role
    const [result] = await pool.execute(
      'UPDATE users SET role = ? WHERE username = ?',
      ['master_admin', 'dhyan']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Successfully updated user role to master_admin');
      
      // Verify the change
      const [users] = await pool.execute(
        'SELECT id, username, role, email, fullName FROM users WHERE username = ?',
        ['dhyan']
      );
      
      if (users.length > 0) {
        const user = users[0];
        console.log('\n👑 Updated Master Admin Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🆔 User ID: ${user.id}`);
        console.log(`👤 Username: ${user.username}`);
        console.log(`👑 Role: ${user.role}`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`📝 Full Name: ${user.fullName}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        console.log('\n🎯 Now you can login with:');
        console.log('Username: dhyan');
        console.log('Password: Dhyan@2724');
        console.log('You will be redirected to the Master Admin Dashboard');
      }
    } else {
      console.log('❌ No user found with username "dhyan"');
      console.log('Please run createMasterAdmin.js first to create the user');
    }
    
  } catch (error) {
    console.error('❌ Error fixing master admin role:', error);
  } finally {
    await pool.end();
    console.log('\n🔐 Database connection closed.');
  }
}

// Run the script
fixMasterAdminRole(); 