const mongoose = require('mongoose');

const InstrumentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  storagePlace: { type: String, required: true, trim: true },
  totalQuantity: { type: Number, required: true },
  company: { type: String, trim: true },
  dateOfEntry: { type: Date, default: Date.now },
  instrumentId: { type: String, unique: true, required: true }, // Auto-generated
});

InstrumentSchema.pre('validate', function(next) {
  if (!this.instrumentId) {
    this.instrumentId = 'INST-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Instrument', InstrumentSchema); 