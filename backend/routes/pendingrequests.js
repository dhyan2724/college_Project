const express = require('express');
const router = express.Router();
const PendingRequest = require('../models/PendingRequest');
const { authenticateToken } = require('../middleware/auth');

// GET all pending requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'faculty') {
      filter.facultyInCharge = req.user.id;
    }
    const pendingRequests = await PendingRequest.find(filter)
      .populate('requestedByUser')
      .populate('facultyInCharge')
      .populate('items.itemId');
    res.json(pendingRequests);
  } catch (err) {
    console.error('Error in GET /pendingrequests:', err); // Log the error to the backend terminal
    res.status(500).json({ message: 'Internal server error', error: err.message, stack: err.stack });
  }
});

// GET a single pending request by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const pendingRequest = await PendingRequest.findById(req.params.id).populate('requestedByUser').populate('itemId');
    if (!pendingRequest) return res.status(404).json({ message: 'Pending request not found' });
    res.json(pendingRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new pending request
router.post('/', authenticateToken, async (req, res) => {
  const pendingRequest = new PendingRequest({
    items: req.body.items, // array of { itemType, itemId, quantity, totalWeightRequested }
    facultyInCharge: req.body.facultyInCharge, // teacher's user id
    requestedByUser: req.user.id,
    requestedByName: req.user.fullName,
    requestedByRole: req.user.role,
    requestedByRollNo: req.user.rollNo,
    requestedByCollegeEmail: req.user.email,
    purpose: req.body.purpose,
    desiredIssueTime: req.body.desiredIssueTime,
    desiredReturnTime: req.body.desiredReturnTime,
    requestDate: new Date(),
    status: 'pending',
    notes: req.body.notes
  });

  try {
    const newPendingRequest = await pendingRequest.save();
    res.status(201).json(newPendingRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH (update) a pending request
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const pendingRequest = await PendingRequest.findById(req.params.id);
    if (!pendingRequest) return res.status(404).json({ message: 'Pending request not found' });

    // Only allow updating status and notes
    if (req.body.status) pendingRequest.status = req.body.status;
    if (req.body.notes) pendingRequest.notes = req.body.notes;

    const updatedPendingRequest = await pendingRequest.save();
    res.json(updatedPendingRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a pending request
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const pendingRequest = await PendingRequest.findById(req.params.id);
    if (!pendingRequest) return res.status(404).json({ message: 'Pending request not found' });

    await PendingRequest.deleteOne({ _id: req.params.id });
    res.json({ message: 'Pending request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 