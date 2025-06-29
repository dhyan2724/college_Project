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

async function testInventoryUpdate() {
  try {
    console.log('🧪 Testing inventory update functionality...\n');

    // Test 1: Check if we have any inventory items
    const chemicals = await Chemical.find({});
    const glasswares = await Glassware.find({});
    const plasticwares = await Plasticware.find({});
    const instruments = await Instrument.find({});

    console.log('📊 Current inventory:');
    console.log(`- Chemicals: ${chemicals.length}`);
    console.log(`- Glassware: ${glasswares.length}`);
    console.log(`- Plasticware: ${plasticwares.length}`);
    console.log(`- Instruments: ${instruments.length}\n`);

    if (chemicals.length > 0) {
      const chemical = chemicals[0];
      console.log('🧪 Testing chemical inventory update:');
      console.log(`- Name: ${chemical.name}`);
      console.log(`- Current available weight: ${chemical.availableWeight}g`);
      
      // Simulate issuing 5g
      const originalWeight = chemical.availableWeight;
      chemical.availableWeight -= 5;
      await chemical.save();
      console.log(`- After issuing 5g: ${chemical.availableWeight}g`);
      
      // Simulate returning 5g
      chemical.availableWeight += 5;
      await chemical.save();
      console.log(`- After returning 5g: ${chemical.availableWeight}g`);
      console.log(`- Original weight restored: ${chemical.availableWeight === originalWeight ? '✅' : '❌'}\n`);
    }

    if (glasswares.length > 0) {
      const glassware = glasswares[0];
      console.log('🧪 Testing glassware inventory update:');
      console.log(`- Name: ${glassware.name}`);
      console.log(`- Current available quantity: ${glassware.availableQuantity}`);
      
      // Simulate issuing 2 units
      const originalQuantity = glassware.availableQuantity;
      glassware.availableQuantity -= 2;
      await glassware.save();
      console.log(`- After issuing 2 units: ${glassware.availableQuantity}`);
      
      // Simulate returning 2 units
      glassware.availableQuantity += 2;
      await glassware.save();
      console.log(`- After returning 2 units: ${glassware.availableQuantity}`);
      console.log(`- Original quantity restored: ${glassware.availableQuantity === originalQuantity ? '✅' : '❌'}\n`);
    }

    console.log('✅ Inventory update test completed!');

  } catch (error) {
    console.error('❌ Error testing inventory update:', error);
  } finally {
    mongoose.connection.close();
  }
}

testInventoryUpdate(); 