const express = require('express');
const router = express.Router();
const LabRegister = require('../models/LabRegister');
const { authenticateToken } = require('../middleware/auth');

// GET all lab registers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const labRegisters = await LabRegister.find().populate('registeredByUser');
    res.json(labRegisters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single lab register by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const labRegister = await LabRegister.findById(req.params.id).populate('registeredByUser');
    if (!labRegister) return res.status(404).json({ message: 'Lab register not found' });
    res.json(labRegister);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new lab register
router.post('/', authenticateToken, async (req, res) => {
  const labRegister = new LabRegister({
    bookName: req.body.bookName,
    author: req.body.author,
    publisher: req.body.publisher,
    year: req.body.year,
    isbn: req.body.isbn,
    registeredByUser: req.user.id,
    registeredByName: req.user.fullName,
    registeredByRollNo: req.user.rollNo,
    registeredByCollegeEmail: req.user.email,
    registrationDate: new Date()
  });

  try {
    const newLabRegister = await labRegister.save();
    res.status(201).json(newLabRegister);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH (update) a lab register
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const labRegister = await LabRegister.findById(req.params.id);
    if (!labRegister) return res.status(404).json({ message: 'Lab register not found' });

    // Only allow updating certain fields
    if (req.body.bookName) labRegister.bookName = req.body.bookName;
    if (req.body.author) labRegister.author = req.body.author;
    if (req.body.publisher) labRegister.publisher = req.body.publisher;
    if (req.body.year) labRegister.year = req.body.year;
    if (req.body.isbn) labRegister.isbn = req.body.isbn;

    const updatedLabRegister = await labRegister.save();
    res.json(updatedLabRegister);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a lab register
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const labRegister = await LabRegister.findById(req.params.id);
    if (!labRegister) return res.status(404).json({ message: 'Lab register not found' });

    await LabRegister.deleteOne({ id: req.params.id });
    res.json({ message: 'Lab register deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 