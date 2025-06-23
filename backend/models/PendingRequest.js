const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  itemType: { type: String, enum: ['chemical', 'glassware', 'plasticware', 'instrument'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'items.itemType' },
  quantity: { type: Number },
  totalWeightRequested: { type: Number },
}, { _id: false });

const PendingRequestSchema = new mongoose.Schema({
  items: { type: [ItemSchema], required: true },
  facultyInCharge: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedByName: { type: String },
  requestedByRole: { type: String },
  requestedByRollNo: { type: String },
  requestedByCollegeEmail: { type: String },
  purpose: { type: String },
  desiredIssueTime: { type: Date },
  desiredReturnTime: { type: Date },
  requestDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  notes: { type: String },
});

module.exports = mongoose.model('PendingRequest', PendingRequestSchema); 