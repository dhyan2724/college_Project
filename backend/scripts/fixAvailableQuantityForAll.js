const mongoose = require('mongoose');
const Instrument = require('../models/Instrument');
const Plasticware = require('../models/Plasticware');

mongoose.connect('mongodb://localhost:27017/lab_inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixAvailableQuantity() {
  // Instruments
  const instruments = await Instrument.find({});
  for (const inst of instruments) {
    if (inst.availableQuantity === undefined) {
      inst.availableQuantity = inst.totalQuantity;
      await inst.save();
      console.log(`Fixed Instrument: ${inst.name} - availableQuantity set to ${inst.totalQuantity}`);
    }
  }
  // Plasticware
  const plasticwares = await Plasticware.find({});
  for (const plastic of plasticwares) {
    if (plastic.availableQuantity === undefined) {
      plastic.availableQuantity = plastic.totalQuantity;
      await plastic.save();
      console.log(`Fixed Plasticware: ${plastic.name} - availableQuantity set to ${plastic.totalQuantity}`);
    }
  }
  mongoose.connection.close();
}

fixAvailableQuantity(); 