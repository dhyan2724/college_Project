const mongoose = require('mongoose');
const { pool } = require('../config/database');
const User = require('../models/User');
const Chemical = require('../models/Chemical');
const Glassware = require('../models/Glassware');
const Plasticware = require('../models/Plasticware');
const Instrument = require('../models/Instrument');
const Miscellaneous = require('../models/Miscellaneous');
const IssuedItem = require('../models/IssuedItem');
const PendingRequest = require('../models/PendingRequest');
const ActivityLog = require('../models/ActivityLog');
const LabRegister = require('../models/LabRegister');
const FAQ = require('../models/FAQ');

require('dotenv').config();

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lab_inventory';

// MongoDB Models (old)
const MongoUser = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  email: String,
  fullName: String,
  rollNo: String,
  category: String,
  lastLogin: Date
}));

const MongoChemical = mongoose.model('Chemical', new mongoose.Schema({
  name: String,
  type: String,
  storagePlace: String,
  totalWeight: Number,
  availableWeight: Number,
  company: String,
  catalogNumber: String,
  chemicalId: String,
  dateOfEntry: Date
}));

const MongoGlassware = mongoose.model('Glassware', new mongoose.Schema({
  name: String,
  type: String,
  storagePlace: String,
  totalQuantity: Number,
  availableQuantity: Number,
  company: String,
  catalogNumber: String,
  glasswareId: String,
  dateOfEntry: Date
}));

const MongoPlasticware = mongoose.model('Plasticware', new mongoose.Schema({
  name: String,
  type: String,
  storagePlace: String,
  totalQuantity: Number,
  availableQuantity: Number,
  company: String,
  catalogNumber: String,
  plasticwareId: String,
  dateOfEntry: Date
}));

const MongoInstrument = mongoose.model('Instrument', new mongoose.Schema({
  name: String,
  type: String,
  storagePlace: String,
  totalQuantity: Number,
  availableQuantity: Number,
  company: String,
  catalogNumber: String,
  instrumentId: String,
  dateOfEntry: Date
}));

const MongoMiscellaneous = mongoose.model('Miscellaneous', new mongoose.Schema({
  name: String,
  description: String,
  storagePlace: String,
  totalQuantity: Number,
  availableQuantity: Number,
  company: String,
  catalogNumber: String,
  miscellaneousId: String,
  dateOfEntry: Date
}));

const MongoIssuedItem = mongoose.model('IssuedItem', new mongoose.Schema({
  itemType: String,
  itemId: mongoose.Schema.Types.ObjectId,
  issuedTo: mongoose.Schema.Types.ObjectId,
  issuedByUser: mongoose.Schema.Types.ObjectId,
  issuedByName: String,
  issuedByRole: String,
  issuedByRollNo: String,
  facultyInCharge: String,
  quantity: Number,
  totalWeightIssued: Number,
  purpose: String,
  issueDate: Date,
  returnDate: Date,
  status: String,
  notes: String,
  pendingRequestId: mongoose.Schema.Types.ObjectId
}));

const MongoPendingRequest = mongoose.model('PendingRequest', new mongoose.Schema({
  items: [{
    itemType: String,
    itemId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    totalWeightRequested: Number
  }],
  facultyInCharge: mongoose.Schema.Types.ObjectId,
  requestedByUser: mongoose.Schema.Types.ObjectId,
  requestedByName: String,
  requestedByRole: String,
  requestedByRollNo: String,
  requestedByCollegeEmail: String,
  purpose: String,
  desiredIssueTime: Date,
  desiredReturnTime: Date,
  requestDate: Date,
  status: String,
  notes: String
}));

const MongoActivityLog = mongoose.model('ActivityLog', new mongoose.Schema({
  action: String,
  itemType: String,
  itemId: mongoose.Schema.Types.ObjectId,
  itemName: String,
  user: String,
  details: String,
  timestamp: Date
}));

const MongoLabRegister = mongoose.model('LabRegister', new mongoose.Schema({
  registerType: String,
  labType: String,
  date: Date,
  day: String,
  name: String,
  facultyInCharge: String,
  item: String,
  totalWeight: Number,
  purpose: String,
  inTime: String,
  outTime: String
}));

async function migrateUsers() {
  console.log('Migrating users...');
  const users = await MongoUser.find({});
  
  for (const user of users) {
    try {
      await User.create({
        username: user.username,
        password: user.password, // Already hashed
        role: user.role,
        email: user.email,
        fullName: user.fullName,
        rollNo: user.rollNo,
        category: user.category,
        lastLogin: user.lastLogin
      });
    } catch (error) {
      console.error(`Error migrating user ${user.username}:`, error.message);
    }
  }
  console.log(`Migrated ${users.length} users`);
}

async function migrateChemicals() {
  console.log('Migrating chemicals...');
  const chemicals = await MongoChemical.find({});
  
  for (const chemical of chemicals) {
    try {
      await Chemical.create({
        name: chemical.name,
        type: chemical.type,
        storagePlace: chemical.storagePlace,
        totalWeight: chemical.totalWeight,
        availableWeight: chemical.availableWeight,
        company: chemical.company,
        catalogNumber: chemical.catalogNumber,
        chemicalId: chemical.chemicalId,
        dateOfEntry: chemical.dateOfEntry
      });
    } catch (error) {
      console.error(`Error migrating chemical ${chemical.name}:`, error.message);
    }
  }
  console.log(`Migrated ${chemicals.length} chemicals`);
}

async function migrateGlasswares() {
  console.log('Migrating glasswares...');
  const glasswares = await MongoGlassware.find({});
  
  for (const glassware of glasswares) {
    try {
      await Glassware.create({
        name: glassware.name,
        type: glassware.type,
        storagePlace: glassware.storagePlace,
        totalQuantity: glassware.totalQuantity,
        availableQuantity: glassware.availableQuantity,
        company: glassware.company,
        glasswareId: glassware.glasswareId,
        dateOfEntry: glassware.dateOfEntry
      });
    } catch (error) {
      console.error(`Error migrating glassware ${glassware.name}:`, error.message);
    }
  }
  console.log(`Migrated ${glasswares.length} glasswares`);
}

async function migratePlasticwares() {
  console.log('Migrating plasticwares...');
  const plasticwares = await MongoPlasticware.find({});
  
  for (const plasticware of plasticwares) {
    try {
      await Plasticware.create({
        name: plasticware.name,
        type: plasticware.type,
        storagePlace: plasticware.storagePlace,
        totalQuantity: plasticware.totalQuantity,
        availableQuantity: plasticware.availableQuantity,
        company: plasticware.company,
        plasticwareId: plasticware.plasticwareId,
        dateOfEntry: plasticware.dateOfEntry
      });
    } catch (error) {
      console.error(`Error migrating plasticware ${plasticware.name}:`, error.message);
    }
  }
  console.log(`Migrated ${plasticwares.length} plasticwares`);
}

async function migrateInstruments() {
  console.log('Migrating instruments...');
  const instruments = await MongoInstrument.find({});
  
  for (const instrument of instruments) {
    try {
      await Instrument.create({
        name: instrument.name,
        type: instrument.type,
        storagePlace: instrument.storagePlace,
        totalQuantity: instrument.totalQuantity,
        availableQuantity: instrument.availableQuantity,
        company: instrument.company,
        instrumentId: instrument.instrumentId,
        dateOfEntry: instrument.dateOfEntry
      });
    } catch (error) {
      console.error(`Error migrating instrument ${instrument.name}:`, error.message);
    }
  }
  console.log(`Migrated ${instruments.length} instruments`);
}

async function migrateMiscellaneous() {
  console.log('Migrating miscellaneous items...');
  const miscellaneous = await MongoMiscellaneous.find({});
  
  for (const item of miscellaneous) {
    try {
      await Miscellaneous.create({
        name: item.name,
        description: item.description,
        storagePlace: item.storagePlace,
        totalQuantity: item.totalQuantity,
        availableQuantity: item.availableQuantity,
        company: item.company,
        miscellaneousId: item.miscellaneousId,
        dateOfEntry: item.dateOfEntry
      });
    } catch (error) {
      console.error(`Error migrating miscellaneous item ${item.name}:`, error.message);
    }
  }
  console.log(`Migrated ${miscellaneous.length} miscellaneous items`);
}

async function migrateActivityLogs() {
  console.log('Migrating activity logs...');
  const activityLogs = await MongoActivityLog.find({});
  
  for (const log of activityLogs) {
    try {
      await ActivityLog.create({
        action: log.action,
        itemType: log.itemType,
        itemId: log.itemId ? log.itemId.toString() : null,
        itemName: log.itemName,
        user: log.user,
        details: log.details,
        timestamp: log.timestamp
      });
    } catch (error) {
      console.error(`Error migrating activity log:`, error.message);
    }
  }
  console.log(`Migrated ${activityLogs.length} activity logs`);
}

async function migrateLabRegisters() {
  console.log('Migrating lab registers...');
  const labRegisters = await MongoLabRegister.find({});
  
  for (const register of labRegisters) {
    try {
      await LabRegister.create({
        registerType: register.registerType,
        labType: register.labType,
        date: register.date,
        day: register.day,
        name: register.name,
        facultyInCharge: register.facultyInCharge,
        item: register.item,
        totalWeight: register.totalWeight,
        purpose: register.purpose,
        inTime: register.inTime,
        outTime: register.outTime
      });
    } catch (error) {
      console.error(`Error migrating lab register:`, error.message);
    }
  }
  console.log(`Migrated ${labRegisters.length} lab register entries`);
}

async function migratePendingRequests() {
  console.log('Migrating pending requests...');
  const pendingRequests = await MongoPendingRequest.find({});
  
  for (const request of pendingRequests) {
    try {
      // Create the pending request
      const newRequest = await PendingRequest.create({
        facultyInChargeId: request.facultyInCharge ? request.facultyInCharge.toString() : null,
        requestedByUserId: request.requestedByUser ? request.requestedByUser.toString() : null,
        requestedByName: request.requestedByName,
        requestedByRole: request.requestedByRole,
        requestedByRollNo: request.requestedByRollNo,
        requestedByCollegeEmail: request.requestedByCollegeEmail,
        purpose: request.purpose,
        desiredIssueTime: request.desiredIssueTime,
        desiredReturnTime: request.desiredReturnTime,
        notes: request.notes,
        status: request.status
      });

      // Add items to the request
      if (request.items && request.items.length > 0) {
        await PendingRequest.addItems(newRequest.id, request.items.map(item => ({
          itemType: item.itemType,
          itemId: item.itemId ? item.itemId.toString() : null,
          quantity: item.quantity,
          totalWeightRequested: item.totalWeightRequested
        })));
      }
    } catch (error) {
      console.error(`Error migrating pending request:`, error.message);
    }
  }
  console.log(`Migrated ${pendingRequests.length} pending requests`);
}

async function migrateIssuedItems() {
  console.log('Migrating issued items...');
  const issuedItems = await MongoIssuedItem.find({});
  
  for (const item of issuedItems) {
    try {
      await IssuedItem.create({
        itemType: item.itemType,
        itemId: item.itemId ? item.itemId.toString() : null,
        issuedToId: item.issuedTo ? item.issuedTo.toString() : null,
        issuedByUserId: item.issuedByUser ? item.issuedByUser.toString() : null,
        issuedByName: item.issuedByName,
        issuedByRole: item.issuedByRole,
        issuedByRollNo: item.issuedByRollNo,
        facultyInCharge: item.facultyInCharge,
        quantity: item.quantity,
        totalWeightIssued: item.totalWeightIssued,
        purpose: item.purpose,
        issueDate: item.issueDate,
        returnDate: item.returnDate,
        status: item.status,
        notes: item.notes,
        pendingRequestId: item.pendingRequestId ? item.pendingRequestId.toString() : null
      });
    } catch (error) {
      console.error(`Error migrating issued item:`, error.message);
    }
  }
  console.log(`Migrated ${issuedItems.length} issued items`);
}

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Test MySQL connection
    await pool.getConnection();
    console.log('Connected to MySQL');

    // Run migrations
    await migrateUsers();
    await migrateChemicals();
    await migrateGlasswares();
    await migratePlasticwares();
    await migrateInstruments();
    await migrateMiscellaneous();
    await migrateActivityLogs();
    await migrateLabRegisters();
    await migratePendingRequests();
    await migrateIssuedItems();

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 