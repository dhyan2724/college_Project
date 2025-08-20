const express = require('express');
const router = express.Router();
const Specimen = require('../models/Specimen');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// GET all specimens
router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await Specimen.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single specimen by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Specimen.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Specimen not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new specimen
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const specimenData = {
      name: req.body.name,
      description: req.body.description,
      storagePlace: req.body.storagePlace,
      totalQuantity: req.body.totalQuantity,
      company: req.body.company,
      catalogNumber: req.body.catalogNumber,
    };

    const newItem = await Specimen.create(specimenData);
    await ActivityLog.create({
      action: 'add',
      itemType: 'specimen',
      itemId: newItem.id,
      itemName: newItem.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH (update) a specimen
router.patch('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const item = await Specimen.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Specimen not found' });
    }

    const updatableFields = ['name', 'description', 'storagePlace', 'totalQuantity', 'company', 'catalogNumber'];
    const updateData = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updated = await Specimen.updateById(req.params.id, updateData);
    await ActivityLog.create({
      action: 'edit',
      itemType: 'specimen',
      itemId: req.params.id,
      itemName: item.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json({ success: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a specimen
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const item = await Specimen.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Specimen not found' });
    await Specimen.deleteById(req.params.id);
    await ActivityLog.create({
      action: 'delete',
      itemType: 'specimen',
      itemId: req.params.id,
      itemName: item.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json({ message: 'Specimen deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search specimens
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const items = await Specimen.search(req.params.query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get specimens by storage place
router.get('/storage/:place', authenticateToken, async (req, res) => {
  try {
    const items = await Specimen.findByStoragePlace(req.params.place);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get low stock specimens
router.get('/stock/low', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const items = await Specimen.getLowStock();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;