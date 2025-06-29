const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'add', 'edit', 'delete', 'approve'
  itemType: { type: String, required: true }, // e.g., 'chemical', 'glassware', 'user', etc.
  itemId: { type: mongoose.Schema.Types.ObjectId, required: false },
  itemName: { type: String, required: false },
  user: { type: String, required: false }, // username or userId
  details: { type: String }, // optional extra info
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema); 