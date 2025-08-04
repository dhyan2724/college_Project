const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student', 'phd_scholar', 'dissertation_student'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  rollNo: {
    type: String,
    required: function() { 
      return this.role === 'student' || this.role === 'phd_scholar' || this.role === 'dissertation_student';
    },
    trim: true,
    unique: true,
    sparse: true // Allows null values for non-student roles without violating unique constraint
  },
  category: {
    type: String,
    enum: ['UG/PG', 'PhD', 'Project Student'],
    required: function() {
      return this.role === 'student' || this.role === 'phd_scholar' || this.role === 'dissertation_student';
    },
    trim: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster lookups
UserSchema.index({ rollNo: 1 }, { sparse: true });

// Pre-save middleware to normalize role to lowercase
UserSchema.pre('save', function(next) {
  if (this.role) {
    this.role = this.role.toLowerCase();
  }
  next();
});

module.exports = mongoose.model('User', UserSchema); 