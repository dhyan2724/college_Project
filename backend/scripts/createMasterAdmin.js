require('dotenv').config();
const bcrypt = require('bcryptjs');

// Prefer Supabase for backend operations when configured, otherwise fall back to MySQL pool
let usingSupabase = false;
let supabase;
let pool;
try {
  const supabaseConfig = require('../config/supabase');
  supabase = supabaseConfig.supabase;
  if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
    usingSupabase = true;
  }
} catch (e) {
  // supabase config not present or failed to load — will use MySQL pool
}

if (!usingSupabase) {
  ({ pool } = require('../config/database'));
}

async function createMasterAdmin() {
  try {
    console.log('Creating Master Admin User...');

    // Check if master admin already exists (Supabase or MySQL)
    let existingMasterAdmins = [];
    if (usingSupabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or('role.eq.master_admin,username.eq.master_admin');
      if (error) throw error;
      existingMasterAdmins = data || [];
    } else {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE role = ? OR username = ?',
        ['master_admin', 'master_admin']
      );
      existingMasterAdmins = rows || [];
    }

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
      email: 'dhyan.k.patel@nuv.ac.in',
      fullName: 'Master Administrator'
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Insert master admin user
    let insertResult;
    if (usingSupabase) {
      const toInsert = {
        username: adminData.username,
        password: hashedPassword,
        role: adminData.role,
        email: adminData.email.toLowerCase(),
        fullName: adminData.fullName
      };
      const { data, error } = await supabase.from('users').insert([toInsert]).select('*');
      if (error) {
        // If the Supabase table doesn't have `fullName`, retry without it
        const msg = String(error.message || '');
        if (msg.includes('fullName') || msg.includes("Could not find the 'fullName'")) {
          // Supabase table uses different column naming (e.g., `fullname`).
          delete toInsert.fullName;
          // Try with lowercase `fullname` column if schema expects that
          const toInsertAlt = { ...toInsert, fullname: adminData.fullName };
          const { data: data2, error: error2 } = await supabase.from('users').insert([toInsertAlt]).select('*');
          if (error2) throw error2;
          insertResult = data2 && data2[0];
        } else {
          throw error;
        }
      } else {
        insertResult = data && data[0];
      }
    } else {
      const [result] = await pool.execute(
        'INSERT INTO users (username, password, role, email, fullName) VALUES (?, ?, ?, ?, ?)',
        [adminData.username, hashedPassword, adminData.role, adminData.email.toLowerCase(), adminData.fullName]
      );
      insertResult = { insertId: result.insertId };
    }

    console.log('✅ Master Admin user created successfully!');
    console.log('Master Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (usingSupabase) {
      console.log(`🆔 User ID: ${insertResult.id}`);
    } else {
      console.log(`🆔 User ID: ${insertResult.insertId}`);
    }
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
    // Handle common Supabase/Postgres duplicate error message code
    if (error && (error.code === 'ER_DUP_ENTRY' || error.code === '23505')) {
      console.log('Master Admin user already exists with this username or email.');
    }
  } finally {
    // Close the pool if using MySQL
    try {
      if (!usingSupabase && pool && pool.end) await pool.end();
    } catch (e) {
      // ignore
    }
    console.log('\n🔐 Database connection closed.');
  }
}

// Run the script
createMasterAdmin();