require('dotenv').config();
const { pool } = require('../config/database');

async function showAdminInfo() {
  try {
    console.log('🔍 Fetching Admin User Information...\n');
    
    const [rows] = await pool.execute(
      'SELECT id, username, role, email, fullName, created_at FROM users WHERE role = ?',
      ['admin']
    );
    
    if (rows.length === 0) {
      console.log('❌ No admin users found in the database.');
      return;
    }
    
    console.log('👑 MASTER ADMIN USER DETAILS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    rows.forEach((admin, index) => {
      console.log(`\n🆔 Admin ${index + 1}:`);
      console.log(`   User ID: ${admin.id}`);
      console.log(`   👤 Username: ${admin.username}`);
      console.log(`   🔑 Default Password: admin123`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   👨‍💼 Role: ${admin.role}`);
      console.log(`   📝 Full Name: ${admin.fullName}`);
      console.log(`   📅 Created: ${admin.created_at}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎯 MASTER ADMIN ACCESS PRIVILEGES:');
    console.log('✅ Full inventory management (chemicals, glassware, plasticware, instruments)');
    console.log('✅ User management (create/edit/delete faculty and student accounts)');
    console.log('✅ Pending request approval/rejection');
    console.log('✅ Issued items tracking and management');
    console.log('✅ Activity logs monitoring');
    console.log('✅ System administration features');
    console.log('✅ All data export/import capabilities');
    
    console.log('\n🌐 HOW TO LOGIN:');
    console.log('1. 🚀 Start your frontend application');
    console.log('2. 🔗 Navigate to the login page');
    console.log(`3. 👤 Enter username: ${rows[0].username}`);
    console.log('4. 🔑 Enter password: admin123');
    console.log('5. ➡️  Click login - you will be redirected to Admin Dashboard');
    
    console.log('\n⚠️  SECURITY RECOMMENDATIONS:');
    console.log('• Change the default password after first login');
    console.log('• Use a strong password with numbers, symbols, and mixed case');
    console.log('• Consider setting up two-factor authentication if available');
    console.log('• Regularly review user accounts and permissions');
    
  } catch (error) {
    console.error('❌ Error fetching admin info:', error);
  } finally {
    await pool.end();
    console.log('\n🔐 Database connection closed.');
  }
}

showAdminInfo();