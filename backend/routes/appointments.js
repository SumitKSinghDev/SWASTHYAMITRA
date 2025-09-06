const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/appointments
// @desc    Book an appointment
// @access  Private (Patient only)
router.post('/', protect, restrictTo('patient'), [
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format is required'),
  body('consultationType').isIn(['video', 'audio', 'chat', 'in_person']).withMessage('Valid consultation type is required'),
  body('reason').notEmpty().withMessage('Appointment reason is required'),
  body('symptoms').optional().isArray()
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
      doctorId,
      scheduledDate,
      scheduledTime,
      consultationType,
      reason,
      symptoms,
      vitalSigns
    } = req.body;

    // Check if doctor exists and is available
    const doctor = await Doctor.findOne({ userId: doctorId, isAvailable: true, isVerified: true });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found or not available'
      });
    }

    // Check if the requested time slot is available
    const appointmentDateTime = new Date(scheduledDate);
    const [hours, minutes] = scheduledTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Check if doctor is working at this time
    const dayName = appointmentDateTime.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const workingDay = doctor.workingHours[dayName];
    
    if (!workingDay || !workingDay.isWorking) {
      return res.status(400).json({
        status: 'error',
        message: 'Doctor is not working on this day'
      });
    }

    // Check for existing appointment at this time
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      scheduledDate: appointmentDateTime,
      scheduledTime: scheduledTime,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        status: 'error',
        message: 'Time slot is already booked'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      scheduledDate: appointmentDateTime,
      scheduledTime: scheduledTime,
      consultationType,
      reason,
      symptoms,
      vitalSigns,
      consultationFee: doctor.consultationFee,
      duration: doctor.consultationDuration
    });

    await appointment.save();

    // Populate appointment details
    await appointment.populate([
      { path: 'patient', select: 'firstName lastName phone email nabhaId' },
      { path: 'doctor', select: 'firstName lastName specialization' }
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Appointment booked successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error booking appointment'
    });
  }
});

// @route   GET /api/appointments
// @desc    Get appointments (filtered by user role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, type, date, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin can see all appointments
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.consultationType = type;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone email nabhaId')
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

// @route   GET /api/appointments/:id
// @desc    Get specific appointment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const appointment = await Appointment.findOne(query)
      .populate('patient', 'firstName lastName phone email nabhaId')
      .populate('doctor', 'firstName lastName specialization')
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

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private
router.put('/:id/cancel', protect, [
  body('reason').optional().isString()
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

    let query = { _id: req.params.id };
    
    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    // Check if appointment can be cancelled
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        status: 'error',
        message: 'Appointment cannot be cancelled. Please contact support.'
      });
    }

    await appointment.cancelAppointment(req.body.reason, req.user._id);

    res.status(200).json({
      status: 'success',
      message: 'Appointment cancelled successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error cancelling appointment'
    });
  }
});

// @route   PUT /api/appointments/:id/reschedule
// @desc    Reschedule appointment
// @access  Private
router.put('/:id/reschedule', protect, [
  body('newDate').isISO8601().withMessage('Valid new date is required'),
  body('newTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid new time format is required')
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

    let query = { _id: req.params.id };
    
    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    // Check if appointment can be rescheduled
    if (!appointment.canBeRescheduled()) {
      return res.status(400).json({
        status: 'error',
        message: 'Appointment cannot be rescheduled. Please contact support.'
      });
    }

    const { newDate, newTime } = req.body;
    const newAppointmentDateTime = new Date(newDate);
    const [hours, minutes] = newTime.split(':');
    newAppointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Check if new time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      scheduledDate: newAppointmentDateTime,
      scheduledTime: newTime,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
      _id: { $ne: appointment._id }
    });

    if (existingAppointment) {
      return res.status(400).json({
        status: 'error',
        message: 'New time slot is already booked'
      });
    }

    // Update appointment
    appointment.scheduledDate = newAppointmentDateTime;
    appointment.scheduledTime = newTime;
    appointment.status = 'rescheduled';
    await appointment.save();

    res.status(200).json({
      status: 'success',
      message: 'Appointment rescheduled successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error rescheduling appointment'
    });
  }
});

// @route   GET /api/appointments/doctors/:doctorId/available-slots
// @desc    Get available time slots for a doctor on a specific date
// @access  Private
router.get('/doctors/:doctorId/available-slots', protect, async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        status: 'error',
        message: 'Date is required'
      });
    }

    const doctor = await Doctor.findOne({ userId: req.params.doctorId, isAvailable: true });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found or not available'
      });
    }

    const availableSlots = await Appointment.getAvailableSlots(req.params.doctorId, new Date(date));
    
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
        },
        consultationFee: doctor.consultationFee,
        duration: doctor.consultationDuration
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

module.exports = router;
