const express = require('express');
const router = express.Router();
const IssuedItem = require('../models/IssuedItem');
const User = require('../models/User');
const Chemical = require('../models/Chemical');
const ActivityLog = require('../models/ActivityLog');
const LabRegister = require('../models/LabRegister');

// Helper: check if question contains usage-related keywords
const usageKeywords = [
  'usage', 'used', 'who', 'how much', 'quantity', 'amount', 'request', 'approve', 'student', 'faculty'
];
function containsUsageKeyword(question) {
  return usageKeywords.some(keyword => question.toLowerCase().includes(keyword));
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
    // Get all chemical names
    const chemicals = await Chemical.find({}, 'name');
    const chemicalNames = chemicals.map(c => c.name);
    // Find if any chemical name is present in the question
    const foundChemical = chemicalNames.find(name => question.toLowerCase().includes(name.toLowerCase()));
    if (!foundChemical) {
      return res.status(404).json({ error: 'No chemical name found in question.' });
    }

    // 1. IssuedItem data
    const issued = await IssuedItem.find({ itemType: 'Chemical', itemName: new RegExp(`^${foundChemical}$`, 'i') });
    const issuedDetails = await Promise.all(issued.map(async (item) => {
      const user = await User.findById(item.userId);
      return `${user ? user.name : 'Unknown user'} used ${item.itemName} ${item.quantity}${item.unit} [${item.status}]${item.faculty ? ' (faculty: ' + item.faculty + ')' : ''} on ${item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}`;
    }));

    // 2. ActivityLog data
    const activityLogs = await ActivityLog.find({ itemType: /chemical/i, itemName: new RegExp(`^${foundChemical}$`, 'i') });
    const activityDetails = activityLogs.map(log => {
      return `${log.action} Chemical ${log.itemName} by ${log.user || 'unknown'} on ${log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}`;
    });

    // 3. LabRegister data
    const labRegisters = await LabRegister.find({ item: new RegExp(`^${foundChemical}$`, 'i') });
    const labRegisterDetails = labRegisters.map(reg => {
      return `LabRegister: ${reg.name} used ${reg.item} ${reg.totalWeight || ''}g on ${reg.date ? new Date(reg.date).toLocaleString() : ''} (faculty: ${reg.facultyInCharge || 'N/A'})`;
    });

    // Combine all details
    const allDetails = [...issuedDetails, ...activityDetails, ...labRegisterDetails].filter(Boolean);
    if (!allDetails.length) {
      return res.json({ answer: `No usage found for ${foundChemical}.` });
    }
    const answer = allDetails.join('\n');
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Optional: test route for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'FAQ route is working!' });
});

module.exports = router; 