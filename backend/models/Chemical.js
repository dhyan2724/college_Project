const mongoose = require('mongoose');

const ChemicalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Solid', 'Liquid', 'Stain'], required: true },
  storagePlace: { type: String, enum: ['Cupboard', 'Freezer', 'Deep Freezer'], required: true },
  totalWeight: { type: Number, required: true }, // in grams
  availableWeight: { type: Number, required: true }, // in grams - what's actually available
  company: { type: String, trim: true },
  catalogNumber: { type: String, required: true, unique: true, trim: true }, // Catalog Number
  dateOfEntry: { type: Date, default: Date.now },
  chemicalId: { type: String, unique: true, required: true }, // Will be auto-generated
});

// Pre-save hook to auto-generate chemicalId if not present
ChemicalSchema.pre('validate', function(next) {
  if (!this.chemicalId) {
    this.chemicalId = 'CHEM-' + Date.now();
  }
  // Set availableWeight to totalWeight if not specified
  if (this.availableWeight === undefined) {
    this.availableWeight = this.totalWeight;
  }
  next();
});

// Virtual for available quantity (for compatibility with frontend)
ChemicalSchema.virtual('availableQuantity').get(function() {
  return this.availableWeight;
});

// Virtual for weight per unit (for compatibility with frontend)
ChemicalSchema.virtual('weightPerUnit').get(function() {
  return this.totalWeight; // Assuming 1 unit = total weight for chemicals
});

module.exports = mongoose.model('Chemical', ChemicalSchema); 