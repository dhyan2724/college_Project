const mongoose = require('mongoose');

const ChemicalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Solid', 'Liquid', 'Stain'], required: true },
  storagePlace: { type: String, enum: ['Cupboard', 'Freezer', 'Deep Freezer'], required: true },
  totalWeight: { type: Number, required: true }, // in grams
  company: { type: String, trim: true },
  dateOfEntry: { type: Date, default: Date.now },
  chemicalId: { type: String, unique: true, required: true }, // Will be auto-generated
});

// Pre-save hook to auto-generate chemicalId if not present
ChemicalSchema.pre('validate', function(next) {
  if (!this.chemicalId) {
    this.chemicalId = 'CHEM-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Chemical', ChemicalSchema); 