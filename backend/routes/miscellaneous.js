const express = require('express');
const router = express.Router();
const Miscellaneous = require('../models/Miscellaneous');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// GET all miscellaneous items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await Miscellaneous.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single miscellaneous item by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Miscellaneous.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Miscellaneous item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new miscellaneous item
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const item = new Miscellaneous({
    name: req.body.name,
    description: req.body.description,
    storagePlace: req.body.storagePlace,
    totalQuantity: req.body.totalQuantity,
    company: req.body.company,
    catalogNumber: req.body.catalogNumber,
    // dateOfEntry and miscellaneousId are auto-generated
  });

  try {
    const newItem = await item.save();
    await ActivityLog.create({
      action: 'add',
      itemType: 'miscellaneous',
      itemId: newItem._id,
      itemName: newItem.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH (update) a miscellaneous item
router.patch('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const item = await Miscellaneous.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Miscellaneous item not found' });
    }
    const updatableFields = ['name', 'description', 'storagePlace', 'totalQuantity', 'company', 'catalogNumber'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });
    const updatedItem = await item.save();
    await ActivityLog.create({
      action: 'edit',
      itemType: 'miscellaneous',
      itemId: updatedItem._id,
      itemName: updatedItem.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a miscellaneous item
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const item = await Miscellaneous.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Miscellaneous item not found' });
    await Miscellaneous.deleteOne({ _id: req.params.id });
    await ActivityLog.create({
      action: 'delete',
      itemType: 'miscellaneous',
      itemId: item._id,
      itemName: item.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json({ message: 'Miscellaneous item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 