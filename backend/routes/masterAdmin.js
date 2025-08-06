const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateToken, JWT_SECRET, authorizeRoles } = require('../middleware/auth');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Middleware to ensure only master admin can access these routes
const authorizeMasterAdmin = authorizeRoles('master_admin');

// GET all users (master admin can see all users)
router.get('/users', authenticateToken, authorizeMasterAdmin, async (req, res) => {
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

// GET users by role (master admin can filter users by role)
router.get('/users/role/:role', authenticateToken, authorizeMasterAdmin, async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.findByRole(role);
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

// POST create any type of user account (master admin can create admin, faculty, student, etc.)
router.post('/create-user', authenticateToken, authorizeMasterAdmin, async (req, res) => {
  try {
    const { username, password, role, email, fullName, rollNo, category } = req.body;

    // Validate required fields
    if (!username || !password || !role || !email || !fullName) {
      return res.status(400).json({ 
        message: 'Username, password, role, email, and fullName are required' 
      });
    }

    // Validate role
    const validRoles = ['admin', 'faculty', 'student', 'phd_scholar', 'dissertation_student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be one of: admin, faculty, student, phd_scholar, dissertation_student' 
      });
    }

    // Check if username or email already exists
    const existingUsername = await User.findByUsername(username);
    const existingEmail = await User.findByEmail(email);

    if (existingUsername || existingEmail) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }

    // Create user
    const newUser = await User.create({
      username,
      password,
      role,
      email,
      fullName,
      rollNo,
      category
    });

    // Send welcome email with credentials
    if (newUser.email) {
      try {
        const emailUtils = require('../utils/emailUtils');
        
        if (emailUtils.isEmailServiceConfigured()) {
          await emailUtils.sendWelcomeEmailWithCredentials(
            newUser.email, 
            newUser.fullName || newUser.username,
            newUser.username,
            password, // The original password from request
            newUser.rollNo || null,
            role
          );
          console.log('Welcome email with credentials sent successfully');
        } else {
          console.log('Email service not configured. Skipping welcome email.');
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }
    }

    // Send response without password
    const userResponse = { ...newUser };
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(400).json({ message: err.message });
  }
});

// PATCH change user password (master admin can change any user's password)
router.patch('/users/:id/change-password', authenticateToken, authorizeMasterAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    const success = await User.updateById(id, { password: hashedPassword });

    if (!success) {
      return res.status(500).json({ message: 'Failed to update password' });
    }

    // Send password change notification email
    if (user.email) {
      try {
        const emailUtils = require('../utils/emailUtils');
        
        if (emailUtils.isEmailServiceConfigured()) {
          await emailUtils.sendPasswordChangeNotification(
            user.email,
            user.fullName || user.username,
            newPassword
          );
          console.log('Password change notification email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending password change notification:', emailError);
      }
    }

    res.json({ 
      message: 'Password changed successfully',
      userId: id,
      username: user.username
    });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH update user details (master admin can update any user's details)
router.patch('/users/:id', authenticateToken, authorizeMasterAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    
    // Allow updating specific fields
    if (req.body.rollNo) updates.rollNo = req.body.rollNo;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.fullName) updates.fullName = req.body.fullName;
    if (req.body.role) updates.role = req.body.role;
    if (req.body.category) updates.category = req.body.category;
    
    // If password is being updated, hash it
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const success = await User.updateById(id, updates);
    
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch updated user
    const user = await User.findById(id);
    const { password, ...userWithoutPassword } = user;

    res.json({
      message: 'User updated successfully',
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE user (master admin can delete any user)
router.delete('/users/:id', authenticateToken, authorizeMasterAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent master admin from deleting themselves
    if (user.role === 'master_admin') {
      return res.status(403).json({ message: 'Cannot delete master admin account' });
    }

    const success = await User.deleteById(id);
    if (success) {
      res.json({ 
        message: 'User deleted successfully',
        deletedUser: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } else {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET user statistics (master admin can see system statistics)
router.get('/statistics', authenticateToken, authorizeMasterAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    
    const statistics = {
      totalUsers: users.length,
      byRole: {
        master_admin: users.filter(u => u.role === 'master_admin').length,
        admin: users.filter(u => u.role === 'admin').length,
        faculty: users.filter(u => u.role === 'faculty').length,
        student: users.filter(u => u.role === 'student').length,
        phd_scholar: users.filter(u => u.role === 'phd_scholar').length,
        dissertation_student: users.filter(u => u.role === 'dissertation_student').length
      },
      recentUsers: users
        .filter(u => {
          const createdDate = new Date(u.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdDate > thirtyDaysAgo;
        })
        .length
    };

    res.json(statistics);
  } catch (err) {
    console.error('Error getting statistics:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 