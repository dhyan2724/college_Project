const mongoose = require('mongoose');

const PlasticwareSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  storagePlace: { type: String, required: true, trim: true },
  totalQuantity: { type: Number, required: true },
  company: { type: String, trim: true },
  dateOfEntry: { type: Date, default: Date.now },
  plasticwareId: { type: String, unique: true, required: true }, // Auto-generated
});

PlasticwareSchema.pre('validate', function(next) {
  if (!this.plasticwareId) {
    this.plasticwareId = 'PLASTIC-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Plasticware', PlasticwareSchema); 