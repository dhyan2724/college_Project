const mongoose = require('mongoose');

const GlasswareSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  storagePlace: { type: String, required: true, trim: true },
  totalQuantity: { type: Number, required: true },
  company: { type: String, trim: true },
  dateOfEntry: { type: Date, default: Date.now },
  glasswareId: { type: String, unique: true, required: true }, // Auto-generated
});

GlasswareSchema.pre('validate', function(next) {
  if (!this.glasswareId) {
    this.glasswareId = 'GLASS-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Glassware', GlasswareSchema); 