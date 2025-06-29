const express = require('express');
const router = express.Router();
const Glassware = require('../models/Glassware');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// GET all glasswares
router.get('/', authenticateToken, async (req, res) => {
  try {
    const glasswares = await Glassware.find();
    res.json(glasswares);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single glassware by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const glassware = await Glassware.findById(req.params.id);
    if (!glassware) return res.status(404).json({ message: 'Glassware not found' });
    res.json(glassware);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new glassware
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const glassware = new Glassware({
    name: req.body.name,
    type: req.body.type,
    storagePlace: req.body.storagePlace,
    totalQuantity: req.body.totalQuantity,
    company: req.body.company,
    // dateOfEntry and glasswareId are auto-generated
  });

  try {
    const newGlassware = await glassware.save();
    // Log activity
    await ActivityLog.create({
      action: 'add',
      itemType: 'glassware',
      itemId: newGlassware._id,
      itemName: newGlassware.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.status(201).json(newGlassware);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH (update) a glassware
router.patch('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const glassware = await Glassware.findById(req.params.id);
    if (!glassware) {
      return res.status(404).json({ message: 'Glassware not found' });
    }

    // Only allow updating certain fields
    const updatableFields = ['name', 'type', 'storagePlace', 'totalQuantity', 'company'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        glassware[field] = req.body[field];
      }
    });

    const updatedGlassware = await glassware.save();
    // Log activity
    await ActivityLog.create({
      action: 'edit',
      itemType: 'glassware',
      itemId: updatedGlassware._id,
      itemName: updatedGlassware.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json(updatedGlassware);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a glassware
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const glassware = await Glassware.findById(req.params.id);
    if (!glassware) return res.status(404).json({ message: 'Glassware not found' });
    
    await Glassware.deleteOne({ _id: req.params.id });
    // Log activity
    await ActivityLog.create({
      action: 'delete',
      itemType: 'glassware',
      itemId: glassware._id,
      itemName: glassware.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json({ message: 'Glassware deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 