require('dotenv').config();
const { pool } = require('../config/database');

async function deleteAllUsers() {
  try {
    console.log('⚠️  WARNING: This will delete ALL users from the database!');
    console.log('🔍 Checking current users in the database...\n');
    
    // First, show current users
    const [users] = await pool.execute(
      'SELECT id, username, role, email, fullName, created_at FROM users ORDER BY role, created_at'
    );
    
    if (users.length === 0) {
      console.log('ℹ️  No users found in the database.');
      return;
    }
    
    console.log('📋 Current users in the database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id} | Username: ${user.username} | Role: ${user.role} | Email: ${user.email}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`🗑️  Proceeding to delete ${users.length} user(s)...\n`);
    
    // Check for foreign key constraints and handle them
    console.log('🔗 Checking for related data that might be affected...');
    
    // Check issued items
    const [issuedItems] = await pool.execute(
      'SELECT COUNT(*) as count FROM issued_items'
    );
    
    // Check pending requests
    const [pendingRequests] = await pool.execute(
      'SELECT COUNT(*) as count FROM pending_requests'
    );
    
    // Check activity logs
    const [activityLogs] = await pool.execute(
      'SELECT COUNT(*) as count FROM activity_logs'
    );
    
    console.log(`📊 Related data found:`);
    console.log(`   • Issued Items: ${issuedItems[0].count}`);
    console.log(`   • Pending Requests: ${pendingRequests[0].count}`);
    console.log(`   • Activity Logs: ${activityLogs[0].count}`);
    
    if (issuedItems[0].count > 0 || pendingRequests[0].count > 0) {
      console.log('\n⚠️  WARNING: There are related records that reference user IDs.');
      console.log('   These will also be deleted due to foreign key constraints!');
    }
    
    console.log('\n🚀 Starting deletion process...');
    
    // Disable foreign key checks temporarily to avoid constraint issues
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Delete all users
    const [deleteResult] = await pool.execute('DELETE FROM users');
    
    // Re-enable foreign key checks
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    // Reset auto-increment counter
    await pool.execute('ALTER TABLE users AUTO_INCREMENT = 1');
    
    console.log(`✅ Successfully deleted ${deleteResult.affectedRows} user(s) from the database!`);
    
    // Verify deletion
    const [remainingUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Verification: ${remainingUsers[0].count} users remaining in the database.`);
    
    console.log('\n🎯 Next steps:');
    console.log('1. Run the createMasterAdmin.js script to create a new admin user');
    console.log('2. Create new faculty and student accounts as needed');
    console.log('3. Re-issue any items that were previously issued');
    
    console.log('\n💡 Tip: You can run the updated createMasterAdmin.js script now with your new credentials!');
    
  } catch (error) {
    console.error('❌ Error deleting users:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('• Make sure the database connection is working');
    console.log('• Check if there are foreign key constraint issues');
    console.log('• Verify you have the necessary database permissions');
  } finally {
    await pool.end();
    console.log('\n🔐 Database connection closed.');
  }
}

// Add confirmation prompt
console.log('🚨 DANGER ZONE: Delete All Users 🚨');
console.log('This script will permanently delete ALL users from the database.');
console.log('This action CANNOT be undone!');
console.log('\nPress Ctrl+C to cancel, or any key to continue...');

// Wait for user input (this is a simple approach for Node.js)
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
  deleteAllUsers();
});