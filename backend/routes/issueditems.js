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

// GET all issued items (admin/faculty/master_admin see all, students see their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let issuedItems;
    if (req.user.role === 'student') {
      issuedItems = await IssuedItem.findByIssuedTo(req.user.id);
    } else if (req.user.role === 'faculty' || req.user.role === 'admin' || req.user.role === 'master_admin') {
      issuedItems = await IssuedItem.findAll();
    } else {
      issuedItems = await IssuedItem.findAll();
    }
    res.json(issuedItems);
  } catch (err) {
    console.error('Error fetching issued items:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET a single issued item by ID (admin/faculty or owner)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const issuedItem = await IssuedItem.findById(req.params.id);
    if (!issuedItem) return res.status(404).json({ message: 'Issued item not found' });
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'faculty' &&
      req.user.role !== 'master_admin' &&
      issuedItem.issuedToId !== req.user.id
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
  try {
    console.log('🔍 Creating issued item with data:', req.body);
    console.log('🔍 User making request:', req.user);
    
    // NOTE: PendingRequest handling is omitted for MySQL model parity; add if/when PendingRequest is migrated
    const issuedItemData = {
      itemType: req.body.itemType,
      itemId: req.body.itemId,
      issuedToId: req.body.issuedToId || req.body.issuedTo || req.body.issuedToId,
      issuedByUserId: req.user.id,
      issuedByName: req.user.fullName,
      issuedByRole: req.user.role,
      issuedByRollNo: req.user.rollNo,
      facultyInCharge: req.body.facultyInCharge,
      quantity: req.body.quantity,
      totalWeightIssued: req.body.totalWeightIssued,
      purpose: req.body.purpose,
      notes: req.body.notes,
      pendingRequestId: req.body.pendingRequestId || null
    };

    // Validate issuedToId
    if (!issuedItemData.issuedToId) {
      return res.status(400).json({ message: "issuedToId is required and cannot be null" });
    };

    // Update inventory based on item type
    let inventoryItem;
    const itemId = req.body.itemId;
    const itemType = req.body.itemType;
    
    console.log('🔍 Issuing item:', { itemId, itemType, quantity: req.body.quantity, totalWeightIssued: req.body.totalWeightIssued });
    
    switch (itemType) {
      case 'Chemical':
        inventoryItem = await Chemical.findById(itemId);
        if (inventoryItem) {
          const weightToDeduct = req.body.totalWeightIssued || 0;
          if (Number(inventoryItem.availableWeight) < Number(weightToDeduct)) {
            return res.status(400).json({ 
              message: `Insufficient chemical available. Available: ${inventoryItem.availableWeight}g, Requested: ${weightToDeduct}g` 
            });
          }
          inventoryItem.availableWeight = Number(inventoryItem.availableWeight) - Number(weightToDeduct);
          await Chemical.updateById(inventoryItem.id, { availableWeight: inventoryItem.availableWeight });
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
          inventoryItem.availableQuantity = Number(inventoryItem.availableQuantity) - Number(quantityToDeduct);
          await Glassware.updateById(inventoryItem.id, { availableQuantity: inventoryItem.availableQuantity });
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
          inventoryItem.availableQuantity = Number(inventoryItem.availableQuantity) - Number(quantityToDeduct);
          await Plasticware.updateById(inventoryItem.id, { availableQuantity: inventoryItem.availableQuantity });
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
          inventoryItem.availableQuantity = Number(inventoryItem.availableQuantity) - 1;
          await Instrument.updateById(inventoryItem.id, { availableQuantity: inventoryItem.availableQuantity });
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

    const newIssuedItem = await IssuedItem.create(issuedItemData);
    // If linked to a pending request, mark it as approved
    if (req.body.pendingRequestId) {
      const PendingRequest = require('../models/PendingRequest');
      await PendingRequest.findByIdAndUpdate(req.body.pendingRequestId, { status: 'approved' });
    }
    res.status(201).json(newIssuedItem);
  } catch (err) {
    console.error('❌ Error issuing item:', err);
    res.status(400).json({ message: err.message });
  }
});

// PATCH (update) an issued item (admin/faculty only)
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'faculty', 'master_admin'), async (req, res) => {
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
            inventoryItem.availableWeight = Number(inventoryItem.availableWeight) + Number(weightToRestore);
            await Chemical.updateById(inventoryItem.id, { availableWeight: inventoryItem.availableWeight });
            console.log('✅ Chemical inventory restored. New available weight:', inventoryItem.availableWeight);
          }
          break;
          
        case 'Glassware':
          inventoryItem = await Glassware.findById(itemId);
          console.log('🧪 Found glassware for return:', inventoryItem ? { name: inventoryItem.name, availableQuantity: inventoryItem.availableQuantity } : 'Not found');
          if (inventoryItem) {
            const quantityToRestore = issuedItem.quantity || 1;
            console.log('📦 Quantity to restore:', quantityToRestore);
            inventoryItem.availableQuantity = Number(inventoryItem.availableQuantity) + Number(quantityToRestore);
            await Glassware.updateById(inventoryItem.id, { availableQuantity: inventoryItem.availableQuantity });
            console.log('✅ Glassware inventory restored. New available quantity:', inventoryItem.availableQuantity);
          }
          break;
          
        case 'Plasticware':
          inventoryItem = await Plasticware.findById(itemId);
          console.log('🧪 Found plasticware for return:', inventoryItem ? { name: inventoryItem.name, availableQuantity: inventoryItem.availableQuantity } : 'Not found');
          if (inventoryItem) {
            const quantityToRestore = issuedItem.quantity || 1;
            console.log('📦 Quantity to restore:', quantityToRestore);
            inventoryItem.availableQuantity = Number(inventoryItem.availableQuantity) + Number(quantityToRestore);
            await Plasticware.updateById(inventoryItem.id, { availableQuantity: inventoryItem.availableQuantity });
            console.log('✅ Plasticware inventory restored. New available quantity:', inventoryItem.availableQuantity);
          }
          break;
          
        case 'Instrument':
          inventoryItem = await Instrument.findById(itemId);
          console.log('🧪 Found instrument for return:', inventoryItem ? { name: inventoryItem.name, availableQuantity: inventoryItem.availableQuantity } : 'Not found');
          if (inventoryItem) {
            const quantityToRestore = 1; // Instruments are typically returned one at a time
            console.log('📦 Quantity to restore:', quantityToRestore);
            inventoryItem.availableQuantity = Number(inventoryItem.availableQuantity) + 1;
            await Instrument.updateById(inventoryItem.id, { availableQuantity: inventoryItem.availableQuantity });
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
        itemId: issuedItem.id,
        itemName: inventoryItem ? inventoryItem.name : '',
        user: req.user ? req.user.fullName || req.user.username : 'unknown',
        details: `Returned by: ${studentName}, Processed by: ${req.user ? req.user.fullName || req.user.username : 'unknown'}`
      });
    }

    const updated = await IssuedItem.updateById(req.params.id, issuedItem);
    const latest = await IssuedItem.findById(req.params.id);
    res.json(latest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an issued item (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'master_admin'), async (req, res) => {
  try {
    const issuedItem = await IssuedItem.findById(req.params.id);
    if (!issuedItem) return res.status(404).json({ message: 'Issued item not found' });
    await IssuedItem.deleteById(req.params.id);
    res.json({ message: 'Issued item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 