const express = require('express');
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/prescriptions
// @desc    Get prescriptions (filtered by user role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role === 'pharmacy') {
      query.assignedPharmacy = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin can see all prescriptions
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName phone email nabhaId')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'scheduledDate consultationType')
      .populate('assignedPharmacy', 'firstName lastName')
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
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting prescriptions'
    });
  }
});

// @route   GET /api/prescriptions/:id
// @desc    Get specific prescription
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role === 'pharmacy') {
      query.assignedPharmacy = req.user._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const prescription = await Prescription.findOne(query)
      .populate('patient', 'firstName lastName phone email nabhaId')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'scheduledDate consultationType')
      .populate('assignedPharmacy', 'firstName lastName');

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found'
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

// @route   PUT /api/prescriptions/:id/assign-pharmacy
// @desc    Assign prescription to pharmacy
// @access  Private (Doctor/Admin only)
router.put('/:id/assign-pharmacy', protect, restrictTo('doctor', 'admin'), [
  body('pharmacyId').isMongoId().withMessage('Valid pharmacy ID is required'),
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

    const { pharmacyId, notes } = req.body;

    let query = { _id: req.params.id };
    
    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const prescription = await Prescription.findOne(query);

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found'
      });
    }

    prescription.assignedPharmacy = pharmacyId;
    prescription.pharmacyNotes = notes;
    await prescription.save();

    res.status(200).json({
      status: 'success',
      message: 'Prescription assigned to pharmacy successfully',
      data: {
        prescription
      }
    });

  } catch (error) {
    console.error('Assign pharmacy error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error assigning pharmacy'
    });
  }
});

// @route   PUT /api/prescriptions/:id/fulfill
// @desc    Mark prescription as fulfilled
// @access  Private (Pharmacy only)
router.put('/:id/fulfill', protect, restrictTo('pharmacy'), [
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

// @route   POST /api/prescriptions/:id/refill
// @desc    Add refill to prescription
// @access  Private (Pharmacy only)
router.post('/:id/refill', protect, restrictTo('pharmacy'), [
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

// @route   GET /api/prescriptions/:id/validate
// @desc    Validate prescription
// @access  Private
router.get('/:id/validate', protect, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role === 'pharmacy') {
      query.assignedPharmacy = req.user._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const prescription = await Prescription.findOne(query);

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found'
      });
    }

    const validation = prescription.validatePrescription();

    res.status(200).json({
      status: 'success',
      data: {
        validation
      }
    });

  } catch (error) {
    console.error('Validate prescription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error validating prescription'
    });
  }
});

// @route   PUT /api/prescriptions/:id/status
// @desc    Update prescription status
// @access  Private (Doctor/Admin only)
router.put('/:id/status', protect, restrictTo('doctor', 'admin'), [
  body('status').isIn(['active', 'completed', 'cancelled', 'modified']).withMessage('Valid status is required')
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

    const { status } = req.body;

    let query = { _id: req.params.id };
    
    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const prescription = await Prescription.findOneAndUpdate(
      query,
      { status },
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Prescription status updated successfully',
      data: {
        prescription
      }
    });

  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating prescription status'
    });
  }
});

module.exports = router;
