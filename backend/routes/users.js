const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateToken, JWT_SECRET, authorizeRoles } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const https = require('https');
require('dotenv').config();

// GET all teachers (public)
// router.get('/teachers', async (req, res) => {
//   try {
//     const teachers = await User.find({ role: 'faculty' }).select('-password');
//     res.json(teachers);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.findByRole('faculty');
    // Remove passwords from response
    const teachersWithoutPasswords = teachers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(teachersWithoutPasswords);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username (using MySQL method)
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
        rollNo: user.rollNo
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response without password
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET all users (protected route)
router.get('/', authenticateToken, authorizeRoles('admin', 'faculty', 'master_admin'), async (req, res) => {
  try {
    const users = await User.findAll();
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(usersWithoutPasswords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new user (registration)
router.post('/', async (req, res) => {
  try {
    // Check if username or email already exists
    const existingUsername = await User.findByUsername(req.body.username);
    const existingEmail = await User.findByEmail(req.body.email);

    if (existingUsername || existingEmail) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }

    // Create user using MySQL method
    const newUser = await User.create({
      username: req.body.username,
      password: req.body.password, // User.create handles password hashing
      role: req.body.role,
      email: req.body.email,
      fullName: req.body.fullName,
      rollNo: req.body.rollNo,
      category: req.body.category
    });
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        email: newUser.email,
        fullName: newUser.fullName,
        rollNo: newUser.rollNo
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

        // Send welcome email with credentials using our email service
    if (newUser.email) {
      try {
        const emailUtils = require('../utils/emailUtils');
        
        if (emailUtils.isEmailServiceConfigured()) {
          // Determine user role based on the role field
          const userRole = newUser.role || 'Student';
          
          await emailUtils.sendWelcomeEmailWithCredentials(
            newUser.email, 
            newUser.fullName || newUser.username,
            newUser.username,
            req.body.password, // The password from the request
            newUser.rollNumber || null,
            userRole
          );
          console.log('Welcome email with credentials sent successfully');
        } else {
          console.log('Email service not configured. Skipping welcome email.');
          console.log('To enable email sending, configure the email service in config/email.js');
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }
    }

    // Send response without password
    const userResponse = { ...newUser };
    delete userResponse.password;

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH (update) an existing user
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const updates = {};
    
    // Only allow updating specific fields
    if (req.body.rollNo) updates.rollNo = req.body.rollNo;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.fullName) updates.fullName = req.body.fullName;
    
    // If password is being updated, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const success = await User.updateById(req.params.id, updates);
    
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch updated user
    const user = await User.findById(req.params.id);
    const { password, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a user (restricted to master_admin)
router.delete('/:id', authenticateToken, authorizeRoles('master_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent deleting master admin accounts via this route
    if (user.role === 'master_admin') {
      return res.status(403).json({ message: 'Cannot delete master admin account' });
    }
    
    const success = await User.deleteById(req.params.id);
    if (success) {
      res.json({ message: 'User deleted' });
    } else {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export router
module.exports = router; 