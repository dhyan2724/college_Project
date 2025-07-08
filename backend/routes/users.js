const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateToken, JWT_SECRET, authorizeRoles } = require('../middleware/auth');
const nodemailer = require('nodemailer');
require('dotenv').config();

// GET all teachers (public)
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'faculty' }).select('-password');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id,
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
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all users (protected route)
router.get('/', authenticateToken, authorizeRoles('admin', 'faculty'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new user (registration)
router.post('/', async (req, res) => {
  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      role: req.body.role,
      email: req.body.email,
      fullName: req.body.fullName,
      rollNo: req.body.rollNo
    });

    const newUser = await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        email: newUser.email,
        fullName: newUser.fullName,
        rollNo: newUser.rollNo
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send welcome email if email is provided
    if (newUser.email) {
      // Configure transporter (replace with your SMTP credentials)
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      let mailOptions = {
        from: `biomedical science laboratory <${process.env.EMAIL_USER}>`,
        to: newUser.email,
        subject: 'Welcome to Biomedical Science Laboratory',
        html: `
          <p>Dear ${newUser.fullName || newUser.username},</p>
          <p>Welcome to Biomedical Science Laboratory!</p>
          <p>Your account has been created.</p>
          <p>
            <b>Username:</b> ${newUser.username}<br>
            <b>Password:</b> ${req.body.password}
          </p>
          <p>Please keep this information safe.</p>
          <p>Best regards,<br>
          Biomedical Science Laboratory Team</p>
          <img src="https://aniportalimages.s3.amazonaws.com/media/details/ANI-20250218121007.jpg" alt="Navrachana University Logo" width="200"/>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending welcome email:', error);
        } else {
          console.log('Welcome email sent:', info.response);
        }
      });
    }

    // Send response without password
    const userResponse = newUser.toObject();
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

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a user
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export router
module.exports = router; 