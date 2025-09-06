const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/patients/profile
// @desc    Get patient profile
// @access  Private (Patient only)
router.get('/profile', protect, restrictTo('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('userId', 'firstName lastName email phone nabhaId nabhaQRCode dateOfBirth gender address emergencyContact profileImage');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        patient
      }
    });

  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting patient profile'
    });
  }
});

// @route   PUT /api/patients/profile
// @desc    Update patient profile
// @access  Private (Patient only)
router.put('/profile', protect, restrictTo('patient'), [
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('preferredLanguage').optional().isIn(['punjabi', 'hindi', 'english']),
  body('communicationPreference').optional().isIn(['sms', 'call', 'whatsapp', 'email'])
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

    const allowedUpdates = [
      'bloodGroup', 'allergies', 'medicalHistory', 'currentMedications',
      'emergencyContacts', 'insuranceProvider', 'insuranceNumber', 'policyNumber',
      'preferredLanguage', 'communicationPreference', 'familyHistory',
      'dataSharingConsent', 'marketingConsent'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email phone nabhaId');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        patient
      }
    });

  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating profile'
    });
  }
});

// @route   GET /api/patients/nabha-card
// @desc    Get NABHA card details
// @access  Private (Patient only)
router.get('/nabha-card', protect, restrictTo('patient'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('nabhaId nabhaQRCode firstName lastName phone email');

    if (!user.nabhaId) {
      return res.status(404).json({
        status: 'error',
        message: 'NABHA card not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        nabhaCard: {
          nabhaId: user.nabhaId,
          qrCode: user.nabhaQRCode,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Get NABHA card error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting NABHA card'
    });
  }
});

// @route   GET /api/patients/appointments
// @desc    Get patient appointments
// @access  Private (Patient only)
router.get('/appointments', protect, restrictTo('patient'), async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    
    const query = { patient: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.consultationType = type;
    }

    const appointments = await Appointment.find(query)
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
    console.error('Get appointments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting appointments'
    });
  }
});

// @route   GET /api/patients/prescriptions
// @desc    Get patient prescriptions
// @access  Private (Patient only)
router.get('/prescriptions', protect, restrictTo('patient'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { patient: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
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

// @route   GET /api/patients/health-records
// @desc    Get patient health records
// @access  Private (Patient only)
router.get('/health-records', protect, restrictTo('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .select('medicalHistory currentMedications vitalSigns allergies familyHistory');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        healthRecords: {
          medicalHistory: patient.medicalHistory,
          currentMedications: patient.currentMedications,
          vitalSigns: patient.vitalSigns,
          allergies: patient.allergies,
          familyHistory: patient.familyHistory
        }
      }
    });

  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting health records'
    });
  }
});

// @route   POST /api/patients/vital-signs
// @desc    Add vital signs
// @access  Private (Patient only)
router.post('/vital-signs', protect, restrictTo('patient'), [
  body('type').isIn(['blood_pressure', 'heart_rate', 'temperature', 'weight', 'height', 'blood_sugar']),
  body('value').notEmpty().withMessage('Value is required'),
  body('unit').notEmpty().withMessage('Unit is required')
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

    const { type, value, unit, notes } = req.body;

    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    await patient.addVitalSign({
      type,
      value,
      unit,
      notes,
      recordedBy: req.user._id
    });

    res.status(201).json({
      status: 'success',
      message: 'Vital signs recorded successfully'
    });

  } catch (error) {
    console.error('Add vital signs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error recording vital signs'
    });
  }
});

// @route   GET /api/patients/vital-signs
// @desc    Get latest vital signs
// @access  Private (Patient only)
router.get('/vital-signs', protect, restrictTo('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    const latestVitals = patient.getLatestVitals();

    res.status(200).json({
      status: 'success',
      data: {
        vitalSigns: latestVitals
      }
    });

  } catch (error) {
    console.error('Get vital signs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting vital signs'
    });
  }
});

// @route   GET /api/patients/doctors
// @desc    Get available doctors
// @access  Private (Patient only)
router.get('/doctors', protect, restrictTo('patient'), async (req, res) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query;
    
    const query = { isVerified: true, isAvailable: true };
    
    if (specialization) {
      query.specialization = specialization;
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'firstName lastName email phone profileImage')
      .sort({ 'rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Doctor.countDocuments(query);

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
    console.error('Get doctors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting doctors'
    });
  }
});

// @route   GET /api/patients/doctors/:id
// @desc    Get doctor details
// @access  Private (Patient only)
router.get('/doctors/:id', protect, restrictTo('patient'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.id })
      .populate('userId', 'firstName lastName email phone profileImage');

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        doctor
      }
    });

  } catch (error) {
    console.error('Get doctor details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting doctor details'
    });
  }
});

module.exports = router;
