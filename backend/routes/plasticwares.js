const express = require('express');
const router = express.Router();
const Plasticware = require('../models/Plasticware');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// GET all plasticwares
router.get('/', authenticateToken, async (req, res) => {
  try {
    const plasticwares = await Plasticware.find();
    res.json(plasticwares);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single plasticware by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const plasticware = await Plasticware.findById(req.params.id);
    if (!plasticware) return res.status(404).json({ message: 'Plasticware not found' });
    res.json(plasticware);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new plasticware
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const plasticware = new Plasticware({
    name: req.body.name,
    type: req.body.type,
    storagePlace: req.body.storagePlace,
    totalQuantity: req.body.totalQuantity,
    company: req.body.company,
    catalogNumber: req.body.catalogNumber, // <-- add this
    // dateOfEntry and plasticwareId are auto-generated
  });

  try {
    const newPlasticware = await plasticware.save();
    // Log activity
    await ActivityLog.create({
      action: 'add',
      itemType: 'plasticware',
      itemId: newPlasticware._id,
      itemName: newPlasticware.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.status(201).json(newPlasticware);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH (update) a plasticware
router.patch('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const plasticware = await Plasticware.findById(req.params.id);
    if (!plasticware) {
      return res.status(404).json({ message: 'Plasticware not found' });
    }

    // Only allow updating certain fields
    const updatableFields = ['name', 'type', 'storagePlace', 'totalQuantity', 'company', 'catalogNumber']; // <-- add catalogNumber
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        plasticware[field] = req.body[field];
      }
    });

    const updatedPlasticware = await plasticware.save();
    // Log activity
    await ActivityLog.create({
      action: 'edit',
      itemType: 'plasticware',
      itemId: updatedPlasticware._id,
      itemName: updatedPlasticware.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json(updatedPlasticware);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a plasticware
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const plasticware = await Plasticware.findById(req.params.id);
    if (!plasticware) return res.status(404).json({ message: 'Plasticware not found' });
    
    await Plasticware.deleteOne({ _id: req.params.id });
    // Log activity
    await ActivityLog.create({
      action: 'delete',
      itemType: 'plasticware',
      itemId: plasticware._id,
      itemName: plasticware.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json({ message: 'Plasticware deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 