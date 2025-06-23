const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/chemical-lab', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected for seeding...');
  return seedAdmin();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function seedAdmin() {
  try {
    console.log('Checking for existing admin user...');
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists with details:', {
        username: existingAdmin.username,
        role: existingAdmin.role,
        email: existingAdmin.email
      });
      return;
    }

    console.log('Creating new admin user...');
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      email: 'admin@navrachana.edu',
      fullName: 'System Administrator'
    });

    await adminUser.save();
    console.log('Admin user created successfully with details:', {
      username: adminUser.username,
      role: adminUser.role,
      email: adminUser.email
    });
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
} 