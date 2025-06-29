const mongoose = require('mongoose');
const Chemical = require('../models/Chemical');
const Glassware = require('../models/Glassware');
const Plasticware = require('../models/Plasticware');
const Instrument = require('../models/Instrument');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lab_inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateInventoryFields() {
  try {
    console.log('Starting inventory field updates...');

    // Update Chemicals
    const chemicals = await Chemical.find({});
    console.log(`Found ${chemicals.length} chemicals to update`);
    
    for (const chemical of chemicals) {
      if (chemical.availableWeight === undefined) {
        chemical.availableWeight = chemical.totalWeight;
        await chemical.save();
        console.log(`Updated chemical: ${chemical.name} - Available weight: ${chemical.availableWeight}g`);
      }
    }

    // Update Glassware
    const glasswares = await Glassware.find({});
    console.log(`Found ${glasswares.length} glassware items to update`);
    
    for (const glassware of glasswares) {
      if (glassware.availableQuantity === undefined) {
        glassware.availableQuantity = glassware.totalQuantity;
        await glassware.save();
        console.log(`Updated glassware: ${glassware.name} - Available quantity: ${glassware.availableQuantity}`);
      }
    }

    // Update Plasticware
    const plasticwares = await Plasticware.find({});
    console.log(`Found ${plasticwares.length} plasticware items to update`);
    
    for (const plasticware of plasticwares) {
      if (plasticware.availableQuantity === undefined) {
        plasticware.availableQuantity = plasticware.totalQuantity;
        await plasticware.save();
        console.log(`Updated plasticware: ${plasticware.name} - Available quantity: ${plasticware.availableQuantity}`);
      }
    }

    // Update Instruments
    const instruments = await Instrument.find({});
    console.log(`Found ${instruments.length} instruments to update`);
    
    for (const instrument of instruments) {
      if (instrument.availableQuantity === undefined) {
        instrument.availableQuantity = instrument.totalQuantity;
        await instrument.save();
        console.log(`Updated instrument: ${instrument.name} - Available quantity: ${instrument.availableQuantity}`);
      }
    }

    console.log('Inventory field updates completed successfully!');
  } catch (error) {
    console.error('Error updating inventory fields:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateInventoryFields(); 