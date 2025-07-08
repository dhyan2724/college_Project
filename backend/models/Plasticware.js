const mongoose = require('mongoose');

const PlasticwareSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  storagePlace: { type: String, required: true, trim: true },
  totalQuantity: { type: Number, required: true },
  availableQuantity: { type: Number, required: true }, // what's actually available
  company: { type: String, trim: true },
  catalogNumber: { type: String, required: true, unique: true, trim: true }, // Catalog Number
  dateOfEntry: { type: Date, default: Date.now },
  plasticwareId: { type: String, unique: true, required: true }, // Auto-generated
});

PlasticwareSchema.pre('validate', function(next) {
  if (!this.plasticwareId) {
    this.plasticwareId = 'PLASTIC-' + Date.now();
  }
  // Set availableQuantity to totalQuantity if not specified
  if (this.availableQuantity === undefined) {
    this.availableQuantity = this.totalQuantity;
  }
  next();
});

module.exports = mongoose.model('Plasticware', PlasticwareSchema); 