require('dotenv').config();
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    console.log('Creating Admin User...');

    const adminData = {
      username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2024',
      role: 'admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@nuv.ac.in',
      fullName: process.env.DEFAULT_ADMIN_FULLNAME || 'System Administrator'
    };

    // Check if an admin user with this username or email already exists
    const [existingAdmins] = await pool.execute(
      'SELECT id, username, role, email, fullName FROM users WHERE username = ? OR email = ?',
      [adminData.username, adminData.email.toLowerCase()]
    );

    if (existingAdmins.length > 0) {
      console.log('Admin user already exists with details:');
      existingAdmins.forEach((user) => {
        console.log({ id: user.id, username: user.username, role: user.role, email: user.email, fullName: user.fullName });
      });
      return;
    }

    // Hash password and insert
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, role, email, fullName) VALUES (?, ?, ?, ?, ?)',
      [adminData.username, hashedPassword, adminData.role, adminData.email.toLowerCase(), adminData.fullName]
    );

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🆔 User ID: ${result.insertId}`);
    console.log(`👤 Username: ${adminData.username}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`👨‍💼 Role: ${adminData.role}`);
    console.log(`📝 Full Name: ${adminData.fullName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await pool.end();
    console.log('\n🔐 Database connection closed.');
  }
}

createAdminUser();


