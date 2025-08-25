const express = require('express');
const router = express.Router();
const PendingRequest = require('../models/PendingRequest');
const { authenticateToken } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Chemical = require('../models/Chemical');
const Glassware = require('../models/Glassware');
const Plasticware = require('../models/Plasticware');
const Instrument = require('../models/Instrument');
const Miscellaneous = require('../models/Miscellaneous');

// GET all pending requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching pending requests for user:', req.user);
    let pendingRequests;
    if (req.user.role === 'faculty') {
      console.log('🔍 User is faculty, fetching requests assigned to them');
      pendingRequests = await PendingRequest.findByFacultyInCharge(req.user.id);
      console.log('🔍 Found pending requests for faculty:', pendingRequests);
    } else {
      console.log('🔍 User is not faculty, fetching all requests');
      pendingRequests = await PendingRequest.findWithUserDetails();
      console.log('🔍 Found all pending requests:', pendingRequests);
    }
    res.json(pendingRequests);
  } catch (err) {
    console.error('Error in GET /pendingrequests:', err); // Log the error to the backend terminal
    res.status(500).json({ message: 'Internal server error', error: err.message, stack: err.stack });
  }
});

// GET a single pending request by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const pendingRequest = await PendingRequest.findById(req.params.id);
    if (!pendingRequest) return res.status(404).json({ message: 'Pending request not found' });
    res.json(pendingRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new pending request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const pendingRequestData = {
      facultyInChargeId: req.body.facultyInCharge, // teacher's user id
      requestedByUserId: req.user.id,
      requestedByName: req.user.fullName,
      requestedByRole: req.user.role,
      requestedByRollNo: req.user.rollNo,
      requestedByCollegeEmail: req.user.email,
      purpose: req.body.purpose,
      desiredIssueTime: req.body.desiredIssueTime,
      desiredReturnTime: req.body.desiredReturnTime,
      notes: req.body.notes
    };

    const newPendingRequest = await PendingRequest.create(pendingRequestData);
    
    // Add items to the request
    if (req.body.items && req.body.items.length > 0) {
      await PendingRequest.addItems(newPendingRequest.id, req.body.items);
    }
    
    // Log activity for request
    await ActivityLog.create({
      action: 'request',
      itemType: 'pendingRequest',
      itemId: newPendingRequest.id,
      itemName: req.body.items && req.body.items.length > 0 ? req.body.items.map(i => i.itemType).join(', ') : '',
      user: req.user ? req.user.fullName || req.user.username : 'unknown',
      details: `Purpose: ${req.body.purpose}`
    });

    // Send email notification to faculty
    try {
      const emailUtils = require('../utils/emailUtils');
      if (emailUtils.isEmailServiceConfigured()) {
        // Get faculty information
        const faculty = await User.findById(req.body.facultyInCharge);
        if (faculty && faculty.email) {
          let itemsWithDetails = [];
          if (Array.isArray(req.body.items) && req.body.items.length > 0) {
            itemsWithDetails = await Promise.all(
              req.body.items.map(async (item) => {
                let itemDetails = null;
                switch (item.itemType) {
                  case 'Chemical':
                    itemDetails = await Chemical.findById(item.itemId);
                    break;
                  case 'Glassware':
                    itemDetails = await Glassware.findById(item.itemId);
                    break;
                  case 'Plasticware':
                    itemDetails = await Plasticware.findById(item.itemId);
                    break;
                  case 'Instrument':
                    itemDetails = await Instrument.findById(item.itemId);
                    break;
                  case 'Miscellaneous':
                    itemDetails = await Miscellaneous.findById(item.itemId);
                    break;
                }
                return {
                  name: itemDetails ? itemDetails.name : 'Unknown Item',
                  itemType: item.itemType,
                  quantity: item.quantity,
                  totalWeightRequested: item.totalWeightRequested
                };
              })
            );
          } else {
            console.warn('No items array found in pending request, sending notification without item details.');
          }
          // Create portal link (adjust the URL based on your frontend URL)
          const portalLink = `http://localhost:3000/teacher?requestId=${newPendingRequest.id}`;
          // Send email notification
          await emailUtils.sendFacultyRequestNotification(
            faculty.email,
            faculty.fullName,
            req.user.fullName,
            req.user.rollNo,
            itemsWithDetails,
            req.body.purpose,
            req.body.desiredIssueTime,
            req.body.desiredReturnTime,
            req.body.notes,
            portalLink
          );
          console.log('Faculty notification email sent successfully');
        } else {
          console.log('Faculty not found or no email configured');
        }
      } else {
        console.log('Email service not configured. Skipping faculty notification email.');
      }
    } catch (emailError) {
      console.error('Error sending faculty notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json(newPendingRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH (update) a pending request
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Updating pending request:', req.params.id, 'with data:', req.body);
    console.log('🔍 User making update:', req.user);
    
    const pendingRequest = await PendingRequest.findById(req.params.id);
    if (!pendingRequest) return res.status(404).json({ message: 'Pending request not found' });

    console.log('🔍 Found pending request:', pendingRequest);

    // Only allow updating status and notes
    const updateData = {};
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.notes) updateData.notes = req.body.notes;

    console.log('🔍 Update data:', updateData);

    const updatedPendingRequest = await PendingRequest.updateById(req.params.id, updateData);
    console.log('🔍 Update result:', updatedPendingRequest);
    
    res.json({ success: updatedPendingRequest });
  } catch (err) {
    console.error('🔍 Error updating pending request:', err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE a pending request
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const pendingRequest = await PendingRequest.findById(req.params.id);
    if (!pendingRequest) return res.status(404).json({ message: 'Pending request not found' });

    await PendingRequest.deleteById(req.params.id);
    res.json({ message: 'Pending request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 