const express = require('express');
const router = express.Router();
const IssuedItem = require('../models/IssuedItem');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET all issued items (admin/faculty only)
router.get('/', authenticateToken, authorizeRoles('admin', 'faculty'), async (req, res) => {
  try {
    const issuedItems = await IssuedItem.find().populate('issuedTo').populate('itemId');
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
    const newIssuedItem = await issuedItem.save();
    res.status(201).json(newIssuedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH (update) an issued item (admin/faculty only)
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'faculty'), async (req, res) => {
  try {
    const issuedItem = await IssuedItem.findById(req.params.id);
    if (!issuedItem) return res.status(404).json({ message: 'Issued item not found' });

    // Only allow updating certain fields
    const updatableFields = ['facultyInCharge', 'quantity', 'totalWeightIssued', 'purpose', 'returnDate', 'status', 'notes'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        issuedItem[field] = req.body[field];
      }
    });

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