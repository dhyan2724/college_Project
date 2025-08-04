const express = require('express');
const router = express.Router();
const IssuedItem = require('../models/IssuedItem');
const User = require('../models/User');
const Chemical = require('../models/Chemical');
const Glassware = require('../models/Glassware');
const Plasticware = require('../models/Plasticware');
const Instrument = require('../models/Instrument');
const ActivityLog = require('../models/ActivityLog');
const LabRegister = require('../models/LabRegister');

// Helper: check if question contains usage-related keywords
const usageKeywords = [
  'usage', 'used', 'who', 'how much', 'quantity', 'amount', 'request', 'approve', 'student', 'faculty', 'item', 'chemical', 'glassware', 'plasticware', 'instrument'
];
function containsUsageKeyword(question) {
  return usageKeywords.some(keyword => question.toLowerCase().includes(keyword));
}

// Helper: get item name by type and id
async function getItemName(itemType, itemId) {
  try {
    let item;
    switch (itemType) {
      case 'Chemical':
        item = await Chemical.findById(itemId);
        break;
      case 'Glassware':
        item = await Glassware.findById(itemId);
        break;
      case 'Plasticware':
        item = await Plasticware.findById(itemId);
        break;
      case 'Instrument':
        item = await Instrument.findById(itemId);
        break;
      default:
        return 'Unknown Item';
    }
    return item ? item.name : 'Unknown Item';
  } catch (error) {
    console.error('Error getting item name:', error);
    return 'Unknown Item';
  }
}

// POST /api/faq
router.post('/', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  if (!containsUsageKeyword(question)) {
    return res.status(400).json({ error: 'Please ask a usage-related question.' });
  }

  try {
    // Get all item names from different collections
    const chemicals = await Chemical.find({}, 'name');
    const glasswares = await Glassware.find({}, 'name');
    const plasticwares = await Plasticware.find({}, 'name');
    const instruments = await Instrument.find({}, 'name');
    
    const allItems = [
      ...chemicals.map(c => ({ name: c.name, type: 'Chemical' })),
      ...glasswares.map(g => ({ name: g.name, type: 'Glassware' })),
      ...plasticwares.map(p => ({ name: p.name, type: 'Plasticware' })),
      ...instruments.map(i => ({ name: i.name, type: 'Instrument' }))
    ];

    // Find if any item name is present in the question
    const foundItem = allItems.find(item => 
      question.toLowerCase().includes(item.name.toLowerCase())
    );

    if (!foundItem) {
      return res.status(404).json({ error: 'No item name found in question. Please specify an item name.' });
    }

    // Get all issued items for this specific item
    const issuedItems = await IssuedItem.find({ 
      itemType: foundItem.type 
    }).populate('issuedTo', 'fullName rollNo email').populate('issuedByUser', 'fullName role');

    // Get the actual item details
    let itemDetails;
    switch (foundItem.type) {
      case 'Chemical':
        itemDetails = await Chemical.findOne({ name: foundItem.name });
        break;
      case 'Glassware':
        itemDetails = await Glassware.findOne({ name: foundItem.name });
        break;
      case 'Plasticware':
        itemDetails = await Plasticware.findOne({ name: foundItem.name });
        break;
      case 'Instrument':
        itemDetails = await Instrument.findOne({ name: foundItem.name });
        break;
    }

    // Filter issued items that match the specific item
    const matchingIssuedItems = [];
    for (const issuedItem of issuedItems) {
      const itemName = await getItemName(issuedItem.itemType, issuedItem.itemId);
      if (itemName.toLowerCase() === foundItem.name.toLowerCase()) {
        matchingIssuedItems.push(issuedItem);
      }
    }

    if (!matchingIssuedItems.length) {
      return res.json({ 
        answer: `No usage found for ${foundItem.name} (${foundItem.type}).`,
        itemType: foundItem.type,
        itemName: foundItem.name
      });
    }

    // Format the response data
    const usageData = matchingIssuedItems.map(item => ({
      itemName: foundItem.name,
      itemType: foundItem.type,
      usedBy: item.issuedTo ? item.issuedTo.fullName : 'Unknown User',
      userRollNo: item.issuedTo ? item.issuedTo.rollNo : 'N/A',
      approvedBy: item.issuedByUser ? item.issuedByUser.fullName : 'Unknown Approver',
      approverRole: item.issuedByUser ? item.issuedByUser.role : 'N/A',
      quantity: item.itemType === 'Chemical' ? `${item.totalWeightIssued}g` : item.quantity,
      issueDate: new Date(item.issueDate).toLocaleString(),
      status: item.status,
      purpose: item.purpose || 'N/A'
    }));

    // Create formatted answer
    const formattedAnswer = usageData.map(data => 
      `${data.usedBy} (${data.userRollNo}) used ${data.itemName} - Quantity: ${data.quantity} - Approved by: ${data.approvedBy} (${data.approverRole}) - Date: ${data.issueDate} - Status: ${data.status} - Purpose: ${data.purpose}`
    ).join('\n');

    res.json({ 
      answer: formattedAnswer,
      usageData: usageData,
      itemType: foundItem.type,
      itemName: foundItem.name,
      totalUsage: usageData.length
    });

  } catch (err) {
    console.error('FAQ Error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Optional: test route for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'FAQ route is working!' });
});

module.exports = router; 