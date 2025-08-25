const express = require('express');
const router = express.Router();
const Slide = require('../models/Slide');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// GET all slides
router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await Slide.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single slide by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Slide.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Slide not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new slide
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const slideData = {
      name: req.body.name,
      description: req.body.description,
      storagePlace: req.body.storagePlace,
      totalQuantity: req.body.totalQuantity,
      company: req.body.company,
      catalogNumber: req.body.catalogNumber,
    };

    const newItem = await Slide.create(slideData);
    await ActivityLog.create({
      action: 'add',
      itemType: 'slide',
      itemId: newItem.id,
      itemName: newItem.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH (update) a slide
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'faculty', 'master_admin'), async (req, res) => {
  try {
    const item = await Slide.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    const updatableFields = ['name', 'description', 'storagePlace', 'totalQuantity', 'company', 'catalogNumber'];
    const updateData = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updated = await Slide.updateById(req.params.id, updateData);
    await ActivityLog.create({
      action: 'edit',
      itemType: 'slide',
      itemId: req.params.id,
      itemName: item.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json({ success: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a slide
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'faculty', 'master_admin'), async (req, res) => {
  try {
    const item = await Slide.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Slide not found' });
    await Slide.deleteById(req.params.id);
    await ActivityLog.create({
      action: 'delete',
      itemType: 'slide',
      itemId: req.params.id,
      itemName: item.name,
      user: req.user ? req.user.username : 'unknown',
    });
    res.json({ message: 'Slide deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search slides
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const items = await Slide.search(req.params.query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get slides by storage place
router.get('/storage/:place', authenticateToken, async (req, res) => {
  try {
    const items = await Slide.findByStoragePlace(req.params.place);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get low stock slides
router.get('/stock/low', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const items = await Slide.getLowStock();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;