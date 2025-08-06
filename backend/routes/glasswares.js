const express = require('express');
const router = express.Router();
const Glassware = require('../models/Glassware');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// GET all glasswares
router.get('/', authenticateToken, async (req, res) => {
  try {
    const glasswares = await Glassware.findAll();
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
  try {
    const glasswareData = {
      name: req.body.name,
      type: req.body.type,
      storagePlace: req.body.storagePlace,
      totalQuantity: req.body.totalQuantity,
      company: req.body.company,
      catalogNumber: req.body.catalogNumber,
    };

    const newGlassware = await Glassware.create(glasswareData);
    // Log activity
    await ActivityLog.create({
      action: 'add',
      itemType: 'glassware',
      itemId: newGlassware.id,
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
    const updatableFields = ['name', 'type', 'storagePlace', 'totalQuantity', 'company', 'catalogNumber'];
    const updateData = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedGlassware = await Glassware.updateById(req.params.id, updateData);
    // Log activity
    await ActivityLog.create({
      action: 'edit',
      itemType: 'glassware',
      itemId: req.params.id,
      itemName: glassware.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json({ success: updatedGlassware });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a glassware
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const glassware = await Glassware.findById(req.params.id);
    if (!glassware) return res.status(404).json({ message: 'Glassware not found' });
    
    await Glassware.deleteById(req.params.id);
    // Log activity
    await ActivityLog.create({
      action: 'delete',
      itemType: 'glassware',
      itemId: req.params.id,
      itemName: glassware.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json({ message: 'Glassware deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 