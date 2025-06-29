const mongoose = require('mongoose');
const Chemical = require('../models/Chemical');

mongoose.connect('mongodb://localhost:27017/lab_inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixAvailableWeight() {
  const chemicals = await Chemical.find({});
  for (const chem of chemicals) {
    // Check for required fields
    if (
      chem.totalWeight === undefined ||
      chem.storagePlace === undefined ||
      chem.type === undefined
    ) {
      console.log(`Skipped: ${chem.name || chem._id} - missing required fields`);
      continue;
    }
    if (chem.availableWeight === undefined) {
      chem.availableWeight = chem.totalWeight;
      await chem.save();
      console.log(`Fixed: ${chem.name} - availableWeight set to ${chem.totalWeight}`);
    }
  }
  mongoose.connection.close();
}

fixAvailableWeight(); 