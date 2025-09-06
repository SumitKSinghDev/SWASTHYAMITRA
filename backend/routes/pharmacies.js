const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/pharmacies/profile
// @desc    Get pharmacy profile
// @access  Private (Pharmacy only)
router.get('/profile', protect, restrictTo('pharmacy'), async (req, res) => {
  try {
    const pharmacy = await User.findById(req.user._id)
      .select('firstName lastName email phone address profileImage');

    if (!pharmacy) {
      return res.status(404).json({
        status: 'error',
        message: 'Pharmacy profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        pharmacy
      }
    });

  } catch (error) {
    console.error('Get pharmacy profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting pharmacy profile'
    });
  }
});

// @route   PUT /api/pharmacies/profile
// @desc    Update pharmacy profile
// @access  Private (Pharmacy only)
router.put('/profile', protect, restrictTo('pharmacy'), async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address'];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const pharmacy = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        pharmacy
      }
    });

  } catch (error) {
    console.error('Update pharmacy profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating profile'
    });
  }
});

// @route   GET /api/pharmacies/prescriptions
// @desc    Get prescriptions assigned to this pharmacy
// @access  Private (Pharmacy only)
router.get('/prescriptions', protect, restrictTo('pharmacy'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { assignedPharmacy: req.user._id };
    
    if (status) {
      query.fulfillmentStatus = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName phone email nabhaId')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'scheduledDate consultationType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prescription.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        prescriptions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPrescriptions: total
        }
      }
    });

  } catch (error) {
    console.error('Get pharmacy prescriptions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting prescriptions'
    });
  }
});

// @route   GET /api/pharmacies/prescriptions/:id
// @desc    Get specific prescription
// @access  Private (Pharmacy only)
router.get('/prescriptions/:id', protect, restrictTo('pharmacy'), async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      assignedPharmacy: req.user._id
    })
      .populate('patient', 'firstName lastName phone email nabhaId address')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'scheduledDate consultationType');

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found or not assigned to your pharmacy'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        prescription
      }
    });

  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting prescription'
    });
  }
});

// @route   PUT /api/pharmacies/prescriptions/:id/fulfill
// @desc    Mark prescription as fulfilled
// @access  Private (Pharmacy only)
router.put('/prescriptions/:id/fulfill', protect, restrictTo('pharmacy'), [
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { notes } = req.body;

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      assignedPharmacy: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found or not assigned to your pharmacy'
      });
    }

    prescription.fulfillmentStatus = 'fulfilled';
    prescription.fulfillmentDate = new Date();
    prescription.fulfillmentNotes = notes;
    await prescription.save();

    res.status(200).json({
      status: 'success',
      message: 'Prescription marked as fulfilled successfully',
      data: {
        prescription
      }
    });

  } catch (error) {
    console.error('Fulfill prescription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error fulfilling prescription'
    });
  }
});

// @route   POST /api/pharmacies/prescriptions/:id/refill
// @desc    Add refill to prescription
// @access  Private (Pharmacy only)
router.post('/prescriptions/:id/refill', protect, restrictTo('pharmacy'), [
  body('quantity').isNumeric().withMessage('Quantity is required'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { quantity, notes } = req.body;

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      assignedPharmacy: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found or not assigned to your pharmacy'
      });
    }

    await prescription.addRefill(quantity, req.user._id, notes);

    res.status(200).json({
      status: 'success',
      message: 'Refill added successfully',
      data: {
        prescription
      }
    });

  } catch (error) {
    console.error('Add refill error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error adding refill'
    });
  }
});

// @route   GET /api/pharmacies/statistics
// @desc    Get pharmacy statistics
// @access  Private (Pharmacy only)
router.get('/statistics', protect, restrictTo('pharmacy'), async (req, res) => {
  try {
    const totalPrescriptions = await Prescription.countDocuments({ assignedPharmacy: req.user._id });
    const fulfilledPrescriptions = await Prescription.countDocuments({
      assignedPharmacy: req.user._id,
      fulfillmentStatus: 'fulfilled'
    });
    const pendingPrescriptions = await Prescription.countDocuments({
      assignedPharmacy: req.user._id,
      fulfillmentStatus: 'pending'
    });
    
    const prescriptionsThisMonth = await Prescription.countDocuments({
      assignedPharmacy: req.user._id,
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const fulfillmentRate = totalPrescriptions > 0 ? (fulfilledPrescriptions / totalPrescriptions * 100).toFixed(2) : 0;

    res.status(200).json({
      status: 'success',
      data: {
        statistics: {
          totalPrescriptions,
          fulfilledPrescriptions,
          pendingPrescriptions,
          prescriptionsThisMonth,
          fulfillmentRate
        }
      }
    });

  } catch (error) {
    console.error('Get pharmacy statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting statistics'
    });
  }
});

// @route   GET /api/pharmacies/medicines
// @desc    Get medicine stock (placeholder for future implementation)
// @access  Private (Pharmacy only)
router.get('/medicines', protect, restrictTo('pharmacy'), async (req, res) => {
  try {
    // This would typically connect to a medicine inventory system
    // For now, return a placeholder response
    res.status(200).json({
      status: 'success',
      message: 'Medicine inventory system not yet implemented',
      data: {
        medicines: []
      }
    });

  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting medicines'
    });
  }
});

// @route   POST /api/pharmacies/medicines/update-stock
// @desc    Update medicine stock (placeholder for future implementation)
// @access  Private (Pharmacy only)
router.post('/medicines/update-stock', protect, restrictTo('pharmacy'), async (req, res) => {
  try {
    // This would typically update medicine inventory
    // For now, return a placeholder response
    res.status(200).json({
      status: 'success',
      message: 'Medicine inventory system not yet implemented'
    });

  } catch (error) {
    console.error('Update medicine stock error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating medicine stock'
    });
  }
});

module.exports = router;
