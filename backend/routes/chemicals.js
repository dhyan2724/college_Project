const express = require('express');
const router = express.Router();
const Chemical = require('../models/Chemical');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all chemicals
router.get('/', authenticateToken, async (req, res) => {
    try {
        const chemicals = await Chemical.find();
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
    const chemical = new Chemical({
        name: req.body.name,
        type: req.body.type,
        storagePlace: req.body.storagePlace,
        totalWeight: req.body.totalWeight,
        company: req.body.company,
        // dateOfEntry and chemicalId are auto-generated
    });

    try {
        const newChemical = await chemical.save();
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
        const updatableFields = ['name', 'type', 'storagePlace', 'totalWeight', 'company'];
        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                chemical[field] = req.body[field];
            }
        });

        const updatedChemical = await chemical.save();
        res.json(updatedChemical);
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

        await chemical.deleteOne();
        res.json({ message: 'Chemical deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 