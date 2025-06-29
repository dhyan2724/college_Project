const mongoose = require('mongoose');
const PendingRequest = require('../models/PendingRequest');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lab_inventory';

const typeMap = {
  chemical: 'Chemical',
  glassware: 'Glassware',
  plasticware: 'Plasticware',
  instrument: 'Instrument'
};

async function fixItemTypes() {
  await mongoose.connect(MONGO_URI);

  const requests = await PendingRequest.find({});
  let updatedCount = 0;

  for (const req of requests) {
    let changed = false;
    for (const item of req.items) {
      if (typeMap[item.itemType]) {
        item.itemType = typeMap[item.itemType];
        changed = true;
      }
    }
    if (changed) {
      await req.save();
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} pending requests.`);
  await mongoose.disconnect();
}

fixItemTypes().catch(err => {
  console.error(err);
  process.exit(1);
}); 