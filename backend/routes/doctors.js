const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/doctors/profile
// @desc    Get doctor profile
// @access  Private (Doctor only)
router.get('/profile', protect, restrictTo('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'firstName lastName email phone profileImage');

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        doctor
      }
    });

  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting doctor profile'
    });
  }
});

// @route   PUT /api/doctors/profile
// @desc    Update doctor profile
// @access  Private (Doctor only)
router.put('/profile', protect, restrictTo('doctor'), [
  body('specialization').optional().isIn([
    'general_practice', 'cardiology', 'dermatology', 'pediatrics', 'gynecology',
    'orthopedics', 'psychiatry', 'neurology', 'oncology', 'endocrinology',
    'gastroenterology', 'pulmonology', 'urology', 'ophthalmology', 'ent',
    'emergency_medicine', 'family_medicine', 'internal_medicine'
  ]),
  body('consultationFee').optional().isNumeric().withMessage('Consultation fee must be a number'),
  body('experience').optional().isNumeric().withMessage('Experience must be a number')
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
      'specialization', 'qualifications', 'experience', 'hospitalAffiliation',
      'clinicAddress', 'workingHours', 'consultationDuration', 'consultationFee',
      'languages', 'bio', 'achievements', 'publications', 'isEmergencyAvailable',
      'emergencyContact', 'supportsVideoConsultation', 'supportsAudioConsultation',
      'supportsChatConsultation'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email phone profileImage');

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        doctor
      }
    });

  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating profile'
    });
  }
});

// @route   GET /api/doctors/appointments
// @desc    Get doctor appointments
// @access  Private (Doctor only)
router.get('/appointments', protect, restrictTo('doctor'), async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    const query = { doctor: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone email nabhaId')
      .populate('prescription', 'prescriptionId medications')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
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

// @route   GET /api/doctors/appointments/:id
// @desc    Get specific appointment
// @access  Private (Doctor only)
router.get('/appointments/:id', protect, restrictTo('doctor'), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user._id
    })
      .populate('patient', 'firstName lastName phone email nabhaId')
      .populate('prescription', 'prescriptionId medications diagnosis');

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting appointment'
    });
  }
});

// @route   PUT /api/doctors/appointments/:id/status
// @desc    Update appointment status
// @access  Private (Doctor only)
router.put('/appointments/:id/status', protect, restrictTo('doctor'), [
  body('status').isIn(['confirmed', 'in_progress', 'completed', 'cancelled']),
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

    const { status, notes } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    appointment.status = status;
    if (notes) {
      appointment.consultationNotes = notes;
    }

    if (status === 'in_progress') {
      appointment.startedAt = new Date();
    } else if (status === 'completed') {
      appointment.endedAt = new Date();
      if (appointment.startedAt) {
        appointment.actualDuration = Math.round((appointment.endedAt - appointment.startedAt) / (1000 * 60));
      }
    }

    await appointment.save();

    res.status(200).json({
      status: 'success',
      message: 'Appointment status updated successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating appointment status'
    });
  }
});

// @route   GET /api/doctors/patients/:nabhaId
// @desc    Get patient by NABHA ID
// @access  Private (Doctor only)
router.get('/patients/:nabhaId', protect, restrictTo('doctor'), async (req, res) => {
  try {
    const user = await User.findOne({ nabhaId: req.params.nabhaId });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    const patient = await Patient.findOne({ userId: user._id })
      .populate('userId', 'firstName lastName email phone nabhaId dateOfBirth gender address');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    // Get patient's appointment history with this doctor
    const appointmentHistory = await Appointment.find({
      patient: user._id,
      doctor: req.user._id
    })
      .populate('prescription', 'prescriptionId medications diagnosis')
      .sort({ scheduledDate: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        patient,
        appointmentHistory
      }
    });

  } catch (error) {
    console.error('Get patient by NABHA ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting patient information'
    });
  }
});

// @route   POST /api/doctors/prescriptions
// @desc    Create prescription
// @access  Private (Doctor only)
router.post('/prescriptions', protect, restrictTo('doctor'), [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('appointmentId').isMongoId().withMessage('Valid appointment ID is required'),
  body('medications').isArray({ min: 1 }).withMessage('At least one medication is required'),
  body('medications.*.name').notEmpty().withMessage('Medication name is required'),
  body('medications.*.dosage').notEmpty().withMessage('Dosage is required'),
  body('medications.*.frequency').notEmpty().withMessage('Frequency is required'),
  body('medications.*.duration').notEmpty().withMessage('Duration is required')
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
      appointmentId,
      medications,
      diagnosis,
      generalInstructions,
      lifestyleModifications,
      followUpRequired,
      followUpDate,
      followUpInstructions,
      labTests,
      imagingTests
    } = req.body;

    // Verify appointment belongs to this doctor and patient
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: req.user._id,
      patient: patientId
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found or does not belong to you'
      });
    }

    // Create prescription
    const prescription = new Prescription({
      patient: patientId,
      doctor: req.user._id,
      appointment: appointmentId,
      medications,
      diagnosis,
      generalInstructions,
      lifestyleModifications,
      followUpRequired,
      followUpDate,
      followUpInstructions,
      labTests,
      imagingTests,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await prescription.save();

    // Minimal pharmacy sync log (placeholder for future integration)
    console.log('[PharmacySync] New prescription created', {
      prescriptionId: prescription._id.toString(),
      patientId: patientId.toString(),
      doctorId: req.user._id.toString(),
      medications: medications.map(m => m.name)
    });

    // Update appointment with prescription
    appointment.prescription = prescription._id;
    await appointment.save();

    res.status(201).json({
      status: 'success',
      message: 'Prescription created successfully',
      data: {
        prescription
      }
    });

  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error creating prescription'
    });
  }
});

// @route   GET /api/doctors/prescriptions
// @desc    Get doctor prescriptions
// @access  Private (Doctor only)
router.get('/prescriptions', protect, restrictTo('doctor'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { doctor: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName nabhaId phone')
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
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting prescriptions'
    });
  }
});

// @route   GET /api/doctors/available-slots
// @desc    Get available time slots for a date
// @access  Private (Doctor only)
router.get('/available-slots', protect, restrictTo('doctor'), async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        status: 'error',
        message: 'Date is required'
      });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor profile not found'
      });
    }

    const availableSlots = await Appointment.getAvailableSlots(req.user._id, new Date(date));
    
    // Generate all possible slots for the day
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const workingDay = doctor.workingHours[dayName];
    
    if (!workingDay || !workingDay.isWorking) {
      return res.status(200).json({
        status: 'success',
        data: {
          availableSlots: [],
          message: 'No working hours for this day'
        }
      });
    }

    const slots = [];
    const startTime = doctor.parseTime(workingDay.start);
    const endTime = doctor.parseTime(workingDay.end);
    const duration = doctor.consultationDuration;

    for (let time = startTime; time < endTime; time += duration) {
      const slotTime = new Date(date);
      slotTime.setHours(Math.floor(time / 60), time % 60, 0, 0);
      
      const timeString = `${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`;
      
      // Check if slot is already booked
      const isBooked = availableSlots.some(apt => apt.scheduledTime === timeString);
      
      if (!isBooked && slotTime > new Date()) {
        slots.push({
          time: timeString,
          available: true
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        availableSlots: slots,
        workingHours: {
          start: workingDay.start,
          end: workingDay.end
        }
      }
    });

  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting available slots'
    });
  }
});

// @route   PUT /api/doctors/availability
// @desc    Update doctor availability
// @access  Private (Doctor only)
router.put('/availability', protect, restrictTo('doctor'), async (req, res) => {
  try {
    const { isAvailable, workingHours, consultationDuration } = req.body;

    const updates = {};
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    if (workingHours) updates.workingHours = workingHours;
    if (consultationDuration) updates.consultationDuration = consultationDuration;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Availability updated successfully',
      data: {
        doctor
      }
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating availability'
    });
  }
});

// List doctors with filters
// @route   GET /api/doctors
// @desc    Public list of doctors with filters & pagination
// @access  Public
router.get(
  '/',
  [
    query('specialization').optional().isString(),
    query('q').optional().isString(),
    query('isVerified').optional().isBoolean().toBoolean(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('sort').optional().isIn(['rating', 'experience', 'fee']).withMessage('Invalid sort field'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Invalid order')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const {
        specialization,
        q,
        isVerified,
        page = 1,
        limit = 10,
        sort = 'rating',
        order = 'desc',
      } = req.query;

      const filter = {};
      if (specialization) filter.specialization = specialization;
      if (typeof isVerified === 'boolean') filter.isVerified = isVerified;

      // Text search across doctor bio and linked user name
      const userMatch = {};
      if (q) {
        userMatch.$or = [
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
        ];
      }

      // Sorting
      const sortMap = {
        rating: { 'rating.average': order === 'asc' ? 1 : -1 },
        experience: { experience: order === 'asc' ? 1 : -1 },
        fee: { consultationFee: order === 'asc' ? 1 : -1 },
      };
      const sortBy = sortMap[sort] || sortMap.rating;

      // Query with population and optional name search
      let queryBuilder = Doctor.find(filter)
        .populate({ path: 'userId', select: 'firstName lastName profileImage city' })
        .sort(sortBy)
        .limit(limit)
        .skip((page - 1) * limit);

      // If searching by user name, we need to first find matching users
      if (q) {
        const matchedUsers = await User.find(userMatch).select('_id');
        filter.userId = { $in: matchedUsers.map((u) => u._id) };
        queryBuilder = Doctor.find(filter)
          .populate({ path: 'userId', select: 'firstName lastName profileImage city' })
          .sort(sortBy)
          .limit(limit)
          .skip((page - 1) * limit);
      }

      const [doctors, total] = await Promise.all([
        queryBuilder.exec(),
        Doctor.countDocuments(filter),
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          doctors,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
          },
        },
      });
    } catch (error) {
      console.error('List doctors error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error listing doctors',
      });
    }
  }
);

module.exports = router;
