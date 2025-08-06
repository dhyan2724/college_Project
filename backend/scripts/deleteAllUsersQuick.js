require('dotenv').config();
const { pool } = require('../config/database');

async function deleteAllUsersQuick() {
  try {
    console.log('🗑️  DELETING ALL USERS FROM DATABASE...\n');
    
    // Show current users first
    const [users] = await pool.execute(
      'SELECT id, username, role, email FROM users'
    );
    
    console.log(`📋 Found ${users.length} user(s) to delete:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.role}) - ${user.email}`);
    });
    
    if (users.length === 0) {
      console.log('ℹ️  No users found in database.');
      return;
    }
    
    console.log('\n🚀 Deleting all users...');
    
    // Disable foreign key checks temporarily
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Delete all users
    const [deleteResult] = await pool.execute('DELETE FROM users');
    
    // Re-enable foreign key checks
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    // Reset auto-increment counter
    await pool.execute('ALTER TABLE users AUTO_INCREMENT = 1');
    
    console.log(`✅ Successfully deleted ${deleteResult.affectedRows} user(s)!`);
    
    // Verify deletion
    const [remaining] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Verification: ${remaining[0].count} users remaining.`);
    
    console.log('\n🎯 Next: Run createMasterAdmin.js to create your new admin account!');
    
  } catch (error) {
    console.error('❌ Error deleting users:', error);
  } finally {
    await pool.end();
    console.log('\n🔐 Database connection closed.');
  }
}

deleteAllUsersQuick();