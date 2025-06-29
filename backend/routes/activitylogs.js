const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/activitylogs/recent - Get the 20 most recent activity logs (admin only)
router.get('/recent', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 