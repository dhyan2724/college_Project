const mongoose = require('mongoose');

const LabRegisterSchema = new mongoose.Schema({
  registerType: {
    type: String,
    enum: [
      'ChemicalItemIssued',
      'GlasswareItemIssued',
      'PlasticwareItemIssued',
      'InstrumentUsed',
      'BreakageCharges',
      'DailyEntry',
      'AnimalCultureLab',
      'PlantCultureLab'
    ],
    required: true
  },
  labType: { type: String, enum: ['Common', 'Research'], required: true },
  date: { type: Date, default: Date.now },
  day: { type: String },
  name: { type: String, required: true },
  facultyInCharge: { type: String },
  item: { type: String }, // chemical/glassware/plasticware/instrument/item broke
  totalWeight: { type: Number }, // for chemicals
  purpose: { type: String },
  inTime: { type: String },
  outTime: { type: String },
});

module.exports = mongoose.model('LabRegister', LabRegisterSchema); 