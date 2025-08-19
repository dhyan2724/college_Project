require('dotenv').config();
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createMasterAdmin() {
  try {
    console.log('Creating Master Admin User...');
    
    // Check if master admin already exists
    const [existingMasterAdmins] = await pool.execute(
      'SELECT * FROM users WHERE role = ? OR username = ?',
      ['master_admin', 'master_admin']
    );
    
    if (existingMasterAdmins.length > 0) {
      console.log('Master Admin user already exists with details:');
      existingMasterAdmins.forEach(admin => {
        console.log({
          id: admin.id,
          username: admin.username,
          role: admin.role,
          email: admin.email,
          fullName: admin.fullName
        });
      });
      console.log('\nIf you want to reset the master admin password, delete the existing master admin first.');
      return;
    }

    // Create master admin user
    const adminData = {
      username: 'master_admin',
      password: 'MasterAdmin@2024',
      role: 'master_admin',
      email: 'master.admin@nuv.ac.in',
      fullName: 'Master Administrator'
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Insert master admin user
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, role, email, fullName) VALUES (?, ?, ?, ?, ?)',
      [adminData.username, hashedPassword, adminData.role, adminData.email.toLowerCase(), adminData.fullName]
    );

    console.log('✅ Master Admin user created successfully!');
    console.log('Master Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🆔 User ID: ${result.insertId}`);
    console.log(`👤 Username: ${adminData.username}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`👑 Role: ${adminData.role}`);
    console.log(`📝 Full Name: ${adminData.fullName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎯 Master Admin Privileges:');
    console.log('• Can create ALL types of accounts (admin, faculty, student, etc.)');
    console.log('• Can change passwords for ANY user account');
    console.log('• Can delete ANY user account');
    console.log('• Can manage all inventory (chemicals, glassware, plasticware, instruments)');
    console.log('• Can view and manage all pending requests');
    console.log('• Can view all issued items and activity logs');
    console.log('• Can access all admin-only features and settings');
    console.log('• Has FULL system control and management capabilities');
    
    console.log('\n🌐 How to Login:');
    console.log('1. Start your frontend application');
    console.log('2. Navigate to the login page');
    console.log(`3. Enter username: ${adminData.username}`);
    console.log(`4. Enter password: ${adminData.password}`);
    console.log('5. You will be redirected to the Master Admin Dashboard');
    
    console.log('\n⚠️ Security Note:');
    console.log('Please change the default password after first login for security!');

  } catch (error) {
    console.error('❌ Error creating master admin:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Master Admin user already exists with this username or email.');
    }
  } finally {
    // Close the pool
    await pool.end();
    console.log('\n🔐 Database connection closed.');
  }
}

// Run the script
createMasterAdmin();