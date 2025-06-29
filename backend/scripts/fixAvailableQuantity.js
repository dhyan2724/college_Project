const mongoose = require('mongoose');
const Glassware = require('../models/Glassware');

mongoose.connect('mongodb://localhost:27017/lab_inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixAvailableQuantity() {
  const glasswares = await Glassware.find({});
  for (const glass of glasswares) {
    if (glass.availableQuantity === undefined) {
      glass.availableQuantity = glass.totalQuantity;
      await glass.save();
      console.log(`Fixed: ${glass.name} - availableQuantity set to ${glass.totalQuantity}`);
    }
  }
  mongoose.connection.close();
}

fixAvailableQuantity(); 