const express = require('express');
const router = express.Router();
const IssuedItem = require('../models/IssuedItem');
const Chemical = require('../models/Chemical');
const Glassware = require('../models/Glassware');
const Plasticware = require('../models/Plasticware');
const Instrument = require('../models/Instrument');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// GET all issued items (admin/faculty see all, students see their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter.issuedTo = req.user.id;
    }
    // Optionally, add similar logic for phd_scholar, dissertation_student
    const issuedItems = await IssuedItem.find(filter).populate('issuedTo').populate('itemId');
    res.json(issuedItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single issued item by ID (admin/faculty or owner)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const issuedItem = await IssuedItem.findById(req.params.id).populate('issuedTo').populate('itemId');
    if (!issuedItem) return res.status(404).json({ message: 'Issued item not found' });
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'faculty' &&
      (!issuedItem.issuedTo || issuedItem.issuedTo.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(issuedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new issued item (students, phd, dissertation, faculty)
router.post('/', authenticateToken, authorizeRoles('student', 'phd_scholar', 'dissertation_student', 'faculty'), async (req, res) => {
  const issuedItem = new IssuedItem({
    itemType: req.body.itemType,
    itemId: req.body.itemId,
    issuedTo: req.body.issuedTo,
    issuedByUser: req.user.id,
    issuedByName: req.user.fullName,
    issuedByRole: req.user.role,
    issuedByRollNo: req.user.rollNo,
    facultyInCharge: req.body.facultyInCharge,
    quantity: req.body.quantity,
    totalWeightIssued: req.body.totalWeightIssued,
    purpose: req.body.purpose,
    issueDate: new Date(),
    returnDate: req.body.returnDate,
    status: 'issued',
    notes: req.body.notes
  });

  try {
    // Update inventory based on item type
    let inventoryItem;
    const itemId = req.body.itemId;
    const itemType = req.body.itemType;
    
    console.log('🔍 Issuing item:', { itemId, itemType, quantity: req.body.quantity, totalWeightIssued: req.body.totalWeightIssued });
    
    switch (itemType) {
      case 'Chemical':
        inventoryItem = await Chemical.findById(itemId);
        console.log('🧪 Found chemical:', inventoryItem ? { name: inventoryItem.name, availableWeight: inventoryItem.availableWeight } : 'Not found');
        if (inventoryItem) {
          const weightToDeduct = req.body.totalWeightIssued || 0;
          console.log('⚖️ Weight to deduct:', weightToDeduct, 'Available:', inventoryItem.availableWeight);
          if (inventoryItem.availableWeight < weightToDeduct) {
            return res.status(400).json({ 
              message: `Insufficient chemical available. Available: ${inventoryItem.availableWeight}g, Requested: ${weightToDeduct}g` 
            });
          }
          inventoryItem.availableWeight -= weightToDeduct;
          await inventoryItem.save();
          console.log('✅ Chemical inventory updated. New available weight:', inventoryItem.availableWeight);
        }
        break;
        
      case 'Glassware':
        inventoryItem = await Glassware.findById(itemId);
        console.log('🧪 Found glassware:', inventoryItem ? { name: inventoryItem.name, availableQuantity: inventoryItem.availableQuantity } : 'Not found');
        if (inventoryItem) {
          const quantityToDeduct = req.body.quantity || 1;
          console.log('📦 Quantity to deduct:', quantityToDeduct, 'Available:', inventoryItem.availableQuantity);
          if (inventoryItem.availableQuantity < quantityToDeduct) {
            return res.status(400).json({ 
              message: `Insufficient glassware available. Available: ${inventoryItem.availableQuantity}, Requested: ${quantityToDeduct}` 
            });
          }
          inventoryItem.availableQuantity -= quantityToDeduct;
          await inventoryItem.save();
          console.log('✅ Glassware inventory updated. New available quantity:', inventoryItem.availableQuantity);
        }
        break;
        
      case 'Plasticware':
        inventoryItem = await Plasticware.findById(itemId);
        console.log('🧪 Found plasticware:', inventoryItem ? { name: inventoryItem.name, availableQuantity: inventoryItem.availableQuantity } : 'Not found');
        if (inventoryItem) {
          const quantityToDeduct = req.body.quantity || 1;
          console.log('📦 Quantity to deduct:', quantityToDeduct, 'Available:', inventoryItem.availableQuantity);
          if (inventoryItem.availableQuantity < quantityToDeduct) {
            return res.status(400).json({ 
              message: `Insufficient plasticware available. Available: ${inventoryItem.availableQuantity}, Requested: ${quantityToDeduct}` 
            });
          }
          inventoryItem.availableQuantity -= quantityToDeduct;
          await inventoryItem.save();
          console.log('✅ Plasticware inventory updated. New available quantity:', inventoryItem.availableQuantity);
        }
        break;
        
      case 'Instrument':
        inventoryItem = await Instrument.findById(itemId);
        console.log('🧪 Found instrument:', inventoryItem ? { name: inventoryItem.name, availableQuantity: inventoryItem.availableQuantity } : 'Not found');
        if (inventoryItem) {
          const quantityToDeduct = 1; // Instruments are typically issued one at a time
          console.log('📦 Quantity to deduct:', quantityToDeduct, 'Available:', inventoryItem.availableQuantity);
          if (inventoryItem.availableQuantity < quantityToDeduct) {
            return res.status(400).json({ 
              message: `Instrument not available. Available: ${inventoryItem.availableQuantity}, Requested: ${quantityToDeduct}` 
            });
          }
          inventoryItem.availableQuantity -= quantityToDeduct;
          await inventoryItem.save();
          console.log('✅ Instrument inventory updated. New available quantity:', inventoryItem.availableQuantity);
        }
        break;
        
      default:
        console.log('❌ Invalid item type:', itemType);
        return res.status(400).json({ message: 'Invalid item type' });
    }

    if (!inventoryItem) {
      console.log('❌ Inventory item not found for ID:', itemId);
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const newIssuedItem = await issuedItem.save();
    // Fetch student name
    let studentName = '';
    try {
      const studentUser = await User.findById(req.body.issuedTo);
      studentName = studentUser ? studentUser.fullName : req.body.issuedTo;
    } catch (e) { studentName = req.body.issuedTo; }
    // Log activity for approval/issue
    await ActivityLog.create({
      action: 'approve',
      itemType: req.body.itemType,
      itemId: newIssuedItem._id,
      itemName: inventoryItem ? inventoryItem.name : '',
      user: req.user ? req.user.fullName || req.user.username : 'unknown',
      details: `Approved by: ${req.user ? req.user.fullName || req.user.username : 'unknown'}, Student: ${studentName}`
    });
    res.status(201).json(newIssuedItem);
  } catch (err) {
    console.error('❌ Error issuing item:', err);
    res.status(400).json({ message: err.message });
  }
});

// PATCH (update) an issued item (admin/faculty only)
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'faculty'), async (req, res) => {
  try {
    const issuedItem = await IssuedItem.findById(req.params.id);
    if (!issuedItem) return res.status(404).json({ message: 'Issued item not found' });

    const previousStatus = issuedItem.status;
    
    // Only allow updating certain fields
    const updatableFields = ['facultyInCharge', 'quantity', 'totalWeightIssued', 'purpose', 'returnDate', 'status', 'notes'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        issuedItem[field] = req.body[field];
      }
    });

    // If status is being changed to 'returned', restore inventory
    if (req.body.status === 'returned' && previousStatus !== 'returned') {
      console.log('🔄 Marking item as returned:', { itemId: issuedItem.itemId, itemType: issuedItem.itemType });
      let inventoryItem;
      const itemId = issuedItem.itemId;
      const itemType = issuedItem.itemType;
      
      switch (itemType) {
        case 'Chemical':
          inventoryItem = await Chemical.findById(itemId);
          console.log('🧪 Found chemical for return:', inventoryItem ? { name: inventoryItem.name, availableWeight: inventoryItem.availableWeight } : 'Not found');
          if (inventoryItem) {
            const weightToRestore = issuedItem.totalWeightIssued || 0;
            console.log('⚖️ Weight to restore:', weightToRestore);
            inventoryItem.availableWeight += weightToRestore;
            await inventoryItem.save();
            console.log('✅ Chemical inventory restored. New available weight:', inventoryItem.availableWeight);
          }
          break;
          
        case 'Glassware':
          inventoryItem = await Glassware.findById(itemId);
          console.log('🧪 Found glassware for return:', inventoryItem ? { name: inventoryItem.name, availableQuantity: inventoryItem.availableQuantity } : 'Not found');
          if (inventoryItem) {
            const quantityToRestore = issuedItem.quantity || 1;
            console.log('📦 Quantity to restore:', quantityToRestore);
            inventoryItem.availableQuantity += quantityToRestore;
            await inventoryItem.save();
            console.log('✅ Glassware inventory restored. New available quantity:', inventoryItem.availableQuantity);
          }
          break;
          
        case 'Plasticware':
          inventoryItem = await Plasticware.findById(itemId);
          console.log('🧪 Found plasticware for return:', inventoryItem ? { name: inventoryItem.name, availableQuantity: inventoryItem.availableQuantity } : 'Not found');
          if (inventoryItem) {
            const quantityToRestore = issuedItem.quantity || 1;
            console.log('📦 Quantity to restore:', quantityToRestore);
            inventoryItem.availableQuantity += quantityToRestore;
            await inventoryItem.save();
            console.log('✅ Plasticware inventory restored. New available quantity:', inventoryItem.availableQuantity);
          }
          break;
          
        case 'Instrument':
          inventoryItem = await Instrument.findById(itemId);
          console.log('🧪 Found instrument for return:', inventoryItem ? { name: inventoryItem.name, availableQuantity: inventoryItem.availableQuantity } : 'Not found');
          if (inventoryItem) {
            const quantityToRestore = 1; // Instruments are typically returned one at a time
            console.log('📦 Quantity to restore:', quantityToRestore);
            inventoryItem.availableQuantity += quantityToRestore;
            await inventoryItem.save();
            console.log('✅ Instrument inventory restored. New available quantity:', inventoryItem.availableQuantity);
          }
          break;
      }
      // Fetch student name
      let studentName = '';
      try {
        const studentUser = await User.findById(issuedItem.issuedTo);
        studentName = studentUser ? studentUser.fullName : issuedItem.issuedTo;
      } catch (e) { studentName = issuedItem.issuedTo; }
      // Log activity for return
      await ActivityLog.create({
        action: 'return',
        itemType: issuedItem.itemType,
        itemId: issuedItem._id,
        itemName: inventoryItem ? inventoryItem.name : '',
        user: req.user ? req.user.fullName || req.user.username : 'unknown',
        details: `Returned by: ${studentName}, Processed by: ${req.user ? req.user.fullName || req.user.username : 'unknown'}`
      });
    }

    const updatedIssuedItem = await issuedItem.save();
    res.json(updatedIssuedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an issued item (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const issuedItem = await IssuedItem.findById(req.params.id);
    if (!issuedItem) return res.status(404).json({ message: 'Issued item not found' });

    await IssuedItem.deleteOne({ _id: req.params.id });
    res.json({ message: 'Issued item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 