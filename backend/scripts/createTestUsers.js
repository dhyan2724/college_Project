const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/lab_inventory');
    console.log('Connected to MongoDB');

    // Create test users
    const testUsers = [
      {
        username: 'faculty1',
        password: 'faculty123',
        role: 'faculty',
        email: 'faculty1@lab.com',
        fullName: 'Faculty One'
      },
      {
        username: 'student1',
        password: 'student123',
        role: 'student',
        email: 'student1@lab.com',
        fullName: 'Student One',
        rollNo: 'ST001'
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        console.log(`User ${userData.username} already exists`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await user.save();
      console.log(`User ${userData.username} created successfully`);
    }

    console.log('All test users created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers(); 