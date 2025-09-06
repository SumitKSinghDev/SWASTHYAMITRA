const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/asha-workers/profile
// @desc    Get ASHA worker profile
// @access  Private (ASHA Worker only)
router.get('/profile', protect, restrictTo('asha_worker'), async (req, res) => {
  try {
    const ashaWorker = await User.findById(req.user._id)
      .select('firstName lastName email phone address emergencyContact profileImage');

    if (!ashaWorker) {
      return res.status(404).json({
        status: 'error',
        message: 'ASHA worker profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ashaWorker
      }
    });

  } catch (error) {
    console.error('Get ASHA worker profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting ASHA worker profile'
    });
  }
});

// @route   PUT /api/asha-workers/profile
// @desc    Update ASHA worker profile
// @access  Private (ASHA Worker only)
router.put('/profile', protect, restrictTo('asha_worker'), async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'emergencyContact'];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const ashaWorker = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        ashaWorker
      }
    });

  } catch (error) {
    console.error('Update ASHA worker profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating profile'
    });
  }
});

// @route   POST /api/asha-workers/register-patient
// @desc    Register a non-digital patient
// @access  Private (ASHA Worker only)
router.post('/register-patient', protect, restrictTo('asha_worker'), [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit phone number is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('address').optional().isObject().withMessage('Address must be an object')
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

    const { firstName, lastName, phone, dateOfBirth, gender, address, emergencyContact } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ phone }, { email: `${phone}@offline.local` }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Patient already exists with this phone number',
        existingUser: {
          nabhaId: existingUser.nabhaId,
          name: `${existingUser.firstName} ${existingUser.lastName}`
        }
      });
    }

    // Create offline user account
    const user = new User({
      firstName,
      lastName,
      email: `${phone}@offline.local`, // Temporary email for offline users
      phone,
      password: 'offline_user_' + Date.now(), // Temporary password
      role: 'patient',
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      isVerified: false // Will be verified when they get NABHA card
    });

    // Generate NABHA ID
    user.nabhaId = user.generateNabhaId();
    await user.save();

    // Create patient profile
    const patient = new Patient({
      userId: user._id,
      preferredLanguage: 'punjabi',
      communicationPreference: 'sms',
      registeredByAsha: req.user._id,
      isOfflineRegistered: true
    });
    await patient.save();

    res.status(201).json({
      status: 'success',
      message: 'Patient registered successfully',
      data: {
        patient: {
          id: user._id,
          nabhaId: user.nabhaId,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          isOfflineRegistered: true
        }
      }
    });

  } catch (error) {
    console.error('Register offline patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error registering patient'
    });
  }
});

// @route   GET /api/asha-workers/patients
// @desc    Get patients registered by this ASHA worker
// @access  Private (ASHA Worker only)
router.get('/patients', protect, restrictTo('asha_worker'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const patients = await Patient.find({ registeredByAsha: req.user._id })
      .populate('userId', 'firstName lastName phone email nabhaId dateOfBirth gender address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Patient.countDocuments({ registeredByAsha: req.user._id });

    res.status(200).json({
      status: 'success',
      data: {
        patients,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPatients: total
        }
      }
    });

  } catch (error) {
    console.error('Get ASHA worker patients error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting patients'
    });
  }
});

// @route   POST /api/asha-workers/book-appointment
// @desc    Book appointment for offline patient
// @access  Private (ASHA Worker only)
router.post('/book-appointment', protect, restrictTo('asha_worker'), [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format is required'),
  body('consultationType').isIn(['video', 'audio', 'chat', 'in_person']).withMessage('Valid consultation type is required'),
  body('reason').notEmpty().withMessage('Appointment reason is required')
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

    const {
      patientId,
      doctorId,
      scheduledDate,
      scheduledTime,
      consultationType,
      reason,
      symptoms
    } = req.body;

    // Verify patient was registered by this ASHA worker
    const patient = await Patient.findOne({
      userId: patientId,
      registeredByAsha: req.user._id
    });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found or not registered by you'
      });
    }

    // Check if doctor exists and is available
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      consultationType,
      reason,
      symptoms,
      bookedByAsha: req.user._id,
      consultationFee: 0 // Free for ASHA worker bookings
    });

    await appointment.save();

    // Populate appointment details
    await appointment.populate([
      { path: 'patient', select: 'firstName lastName phone nabhaId' },
      { path: 'doctor', select: 'firstName lastName specialization' }
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Appointment booked successfully for offline patient',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Book appointment for offline patient error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error booking appointment'
    });
  }
});

// @route   GET /api/asha-workers/appointments
// @desc    Get appointments booked by this ASHA worker
// @access  Private (ASHA Worker only)
router.get('/appointments', protect, restrictTo('asha_worker'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { bookedByAsha: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone nabhaId')
      .populate('doctor', 'firstName lastName specialization')
      .populate('prescription', 'prescriptionId medications')
      .sort({ scheduledDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAppointments: total
        }
      }
    });

  } catch (error) {
    console.error('Get ASHA worker appointments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting appointments'
    });
  }
});

// @route   GET /api/asha-workers/statistics
// @desc    Get ASHA worker statistics
// @access  Private (ASHA Worker only)
router.get('/statistics', protect, restrictTo('asha_worker'), async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ registeredByAsha: req.user._id });
    const totalAppointments = await Appointment.countDocuments({ bookedByAsha: req.user._id });
    
    const appointmentsThisMonth = await Appointment.countDocuments({
      bookedByAsha: req.user._id,
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const completedAppointments = await Appointment.countDocuments({
      bookedByAsha: req.user._id,
      status: 'completed'
    });

    res.status(200).json({
      status: 'success',
      data: {
        statistics: {
          totalPatients,
          totalAppointments,
          appointmentsThisMonth,
          completedAppointments,
          completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(2) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get ASHA worker statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting statistics'
    });
  }
});

// @route   GET /api/asha-workers/doctors
// @desc    Get available doctors for booking
// @access  Private (ASHA Worker only)
router.get('/doctors', protect, restrictTo('asha_worker'), async (req, res) => {
  try {
    const { specialization, page = 1, limit = 10 } = req.query;
    
    const query = { role: 'doctor', isActive: true };
    
    if (specialization) {
      const doctorQuery = { specialization };
      const doctors = await User.aggregate([
        { $match: query },
        { $lookup: { from: 'doctors', localField: '_id', foreignField: 'userId', as: 'doctorProfile' } },
        { $match: { 'doctorProfile.specialization': specialization } },
        { $project: { firstName: 1, lastName: 1, email: 1, phone: 1, specialization: '$doctorProfile.specialization' } }
      ]);
      
      return res.status(200).json({
        status: 'success',
        data: {
          doctors,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(doctors.length / limit),
            totalDoctors: doctors.length
          }
        }
      });
    }

    const doctors = await User.find(query)
      .populate('doctorProfile', 'specialization experience rating')
      .select('firstName lastName email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        doctors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalDoctors: total
        }
      }
    });

  } catch (error) {
    console.error('Get doctors for ASHA worker error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting doctors'
    });
  }
});

module.exports = router;
