require('dotenv').config();
const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

async function createMasterAdmin() {
  try {
    console.log('Creating Master Admin User in Supabase...');
    
    // Check if master admin already exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from('users')
      .select('*')
      .or('role.eq.master_admin,username.eq.master_admin');
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingAdmins && existingAdmins.length > 0) {
      console.log('⚠️  Master Admin user already exists with details:');
      existingAdmins.forEach(admin => {
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

    // Insert master admin user into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: adminData.username,
        password: hashedPassword,
        role: adminData.role,
        email: adminData.email.toLowerCase(),
        fullName: adminData.fullName
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Master Admin user created successfully!');
    console.log('Master Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🆔 User ID: ${data.id}`);
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
    
    console.log('\n⚠️  Security Note:');
    console.log('Please change the default password after first login for security!');

  } catch (error) {
    console.error('❌ Error creating master admin:', error);
    if (error.code === '23505') {
      console.log('Master Admin user already exists with this username or email.');
    } else if (error.code === 'PGRST116') {
      console.log('Error: Users table does not exist. Please run the schema_supabase.sql file first.');
    } else {
      console.log('Error details:', error.message);
    }
    process.exit(1);
  }
}

// Run the script
createMasterAdmin()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
