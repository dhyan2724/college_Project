const express = require('express');
const router = express.Router();
const Instrument = require('../models/Instrument');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// GET all instruments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const instruments = await Instrument.findAll();
    res.json(instruments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single instrument by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) return res.status(404).json({ message: 'Instrument not found' });
    res.json(instrument);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new instrument
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const instrumentData = {
      name: req.body.name,
      type: req.body.type,
      storagePlace: req.body.storagePlace,
      totalQuantity: req.body.totalQuantity,
      company: req.body.company,
    };

    const newInstrument = await Instrument.create(instrumentData);
    // Log activity
    await ActivityLog.create({
      action: 'add',
      itemType: 'instrument',
      itemId: newInstrument.id,
      itemName: newInstrument.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.status(201).json(newInstrument);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH (update) an instrument
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'faculty', 'master_admin'), async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
      return res.status(404).json({ message: 'Instrument not found' });
    }

    // Only allow updating certain fields
    const updatableFields = ['name', 'type', 'storagePlace', 'totalQuantity', 'company'];
    const updateData = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updated = await Instrument.updateById(req.params.id, updateData);
    // Log activity
    await ActivityLog.create({
      action: 'edit',
      itemType: 'instrument',
      itemId: req.params.id,
      itemName: instrument.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json({ success: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an instrument
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'faculty', 'master_admin'), async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) return res.status(404).json({ message: 'Instrument not found' });
    
    await Instrument.deleteById(req.params.id);
    // Log activity
    await ActivityLog.create({
      action: 'delete',
      itemType: 'instrument',
      itemId: req.params.id,
      itemName: instrument.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json({ message: 'Instrument deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 