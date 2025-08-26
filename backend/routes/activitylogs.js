const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/activitylogs/recent - Get recent activity logs from MySQL (admin only)
router.get('/recent', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const logs = await ActivityLog.getRecent(days);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;