const mongoose = require('mongoose');

const IssuedItemSchema = new mongoose.Schema({
  itemType: { type: String, enum: ['Chemical', 'Glassware', 'Plasticware', 'Instrument'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemType', required: true },
  issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedByName: { type: String },
  issuedByRole: { type: String },
  issuedByRollNo: { type: String },
  facultyInCharge: { type: String },
  quantity: { type: Number }, // for glassware/plasticware/instrument
  totalWeightIssued: { type: Number }, // for chemicals
  purpose: { type: String },
  issueDate: { type: Date, default: Date.now },
  returnDate: { type: Date },
  status: { type: String, enum: ['issued', 'returned'], default: 'issued' },
  notes: { type: String },
});

module.exports = mongoose.model('IssuedItem', IssuedItemSchema); 