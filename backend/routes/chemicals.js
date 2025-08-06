const express = require('express');
const router = express.Router();
const Chemical = require('../models/Chemical');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

// Get all chemicals
router.get('/', authenticateToken, async (req, res) => {
    try {
        const chemicals = await Chemical.findAll();
        res.json(chemicals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get one chemical
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const chemical = await Chemical.findById(req.params.id);
        if (!chemical) {
            return res.status(404).json({ message: 'Chemical not found' });
        }
        res.json(chemical);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create chemical
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const chemicalData = {
            name: req.body.name,
            type: req.body.type,
            storagePlace: req.body.storagePlace,
            totalWeight: req.body.totalWeight,
            company: req.body.company,
            catalogNumber: req.body.catalogNumber,
        };

        const newChemical = await Chemical.create(chemicalData);
        // Log activity
        await ActivityLog.create({
          action: 'add',
          itemType: 'chemical',
          itemId: newChemical.id,
          itemName: newChemical.name,
          user: req.user ? req.user.username : 'unknown',
        });
        res.status(201).json(newChemical);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update chemical
router.patch('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const chemical = await Chemical.findById(req.params.id);
        if (!chemical) {
            return res.status(404).json({ message: 'Chemical not found' });
        }

        // Only allow updating certain fields
        const updatableFields = ['name', 'type', 'storagePlace', 'totalWeight', 'company', 'catalogNumber'];
        const updateData = {};
        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const updatedChemical = await Chemical.updateById(req.params.id, updateData);
        // Log activity
        await ActivityLog.create({
          action: 'edit',
          itemType: 'chemical',
          itemId: req.params.id,
          itemName: chemical.name,
          user: req.user ? req.user.username : 'unknown',
        });
        res.json({ success: updatedChemical });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete chemical
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const chemical = await Chemical.findById(req.params.id);
        if (!chemical) {
            return res.status(404).json({ message: 'Chemical not found' });
        }

        await Chemical.deleteById(req.params.id);
        // Log activity
        await ActivityLog.create({
          action: 'delete',
          itemType: 'chemical',
          itemId: req.params.id,
          itemName: chemical.name,
          user: req.user ? req.user.username : 'unknown',
        });
        res.json({ message: 'Chemical deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 