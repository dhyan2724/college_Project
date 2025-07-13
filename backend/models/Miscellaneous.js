const mongoose = require('mongoose');

const MiscellaneousSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  storagePlace: { type: String, required: true, trim: true },
  totalQuantity: { type: Number, required: true },
  availableQuantity: { type: Number, required: true },
  company: { type: String, trim: true },
  catalogNumber: { type: String, required: true, unique: true, trim: true },
  dateOfEntry: { type: Date, default: Date.now },
  miscellaneousId: { type: String, unique: true, required: true },
});

MiscellaneousSchema.pre('validate', function(next) {
  if (!this.miscellaneousId) {
    this.miscellaneousId = 'MISC-' + Date.now();
  }
  if (this.availableQuantity === undefined) {
    this.availableQuantity = this.totalQuantity;
  }
  next();
});

module.exports = mongoose.model('Miscellaneous', MiscellaneousSchema); 