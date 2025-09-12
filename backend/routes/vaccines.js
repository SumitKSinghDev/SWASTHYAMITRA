const express = require('express');
const router = express.Router();
const { VaccineCenter, Vaccine } = require('../models/VaccineCenter');
const VaccineBooking = require('../models/VaccineBooking');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all vaccines (public)
router.get('/vaccines', async (req, res) => {
  try {
    const vaccines = await Vaccine.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { vaccines }
    });
  } catch (error) {
    console.error('Error fetching vaccines:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vaccines'
    });
  }
});

// Get vaccine centers (public)
router.get('/centers', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      state,
      vaccineId,
      search,
      sort = 'rating',
      order = 'desc'
    } = req.query;

    const query = { isActive: true, isVerified: true };

    // Filter by location
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');

    // Filter by vaccine availability
    if (vaccineId) {
      query['availableVaccines.vaccine'] = vaccineId;
      query['availableVaccines.isAvailable'] = true;
    }

    // Search in center name
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const centers = await VaccineCenter.find(query)
      .populate('availableVaccines.vaccine')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VaccineCenter.countDocuments(query);

    res.json({
      success: true,
      data: {
        centers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCenters: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vaccine centers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vaccine centers'
    });
  }
});

// Get center by ID (public)
router.get('/centers/:id', async (req, res) => {
  try {
    const center = await VaccineCenter.findById(req.params.id)
      .populate('availableVaccines.vaccine');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Vaccine center not found'
      });
    }

    res.json({
      success: true,
      data: { center }
    });
  } catch (error) {
    console.error('Error fetching vaccine center:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vaccine center'
    });
  }
});

// Get available slots for a center and date
router.get('/centers/:id/slots', async (req, res) => {
  try {
    const { date, vaccineId } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const center = await VaccineCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Vaccine center not found'
      });
    }

    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book slots for past dates'
      });
    }

    // Find existing slots for the date
    let existingSlots = center.slots.find(slot => 
      slot.date.toDateString() === requestedDate.toDateString()
    );

    // If no slots exist for this date, create them
    if (!existingSlots) {
      const workingDays = center.timings.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      if (!workingDays.includes(dayName)) {
        return res.json({
          success: true,
          data: {
            slots: [],
            message: 'Center is closed on this day'
          }
        });
      }

      // Generate time slots for the day
      const timeSlots = [];
      const openTime = center.timings.openTime || '09:00';
      const closeTime = center.timings.closeTime || '17:00';
      const slotsPerHour = center.capacity.slotsPerHour || 10;

      const [openHour, openMin] = openTime.split(':').map(Number);
      const [closeHour, closeMin] = closeTime.split(':').map(Number);

      for (let hour = openHour; hour < closeHour; hour++) {
        for (let slot = 0; slot < slotsPerHour; slot++) {
          const startTime = `${hour.toString().padStart(2, '0')}:${(slot * (60 / slotsPerHour)).toString().padStart(2, '0')}`;
          const endTime = `${hour.toString().padStart(2, '0')}:${((slot + 1) * (60 / slotsPerHour)).toString().padStart(2, '0')}`;
          
          timeSlots.push({
            startTime,
            endTime,
            availableSlots: center.capacity.slotsPerHour,
            totalSlots: center.capacity.slotsPerHour
          });
        }
      }

      existingSlots = {
        date: requestedDate,
        timeSlots
      };

      center.slots.push(existingSlots);
      await center.save();
    }

    // Filter slots by vaccine availability if specified
    let availableSlots = existingSlots.timeSlots;

    if (vaccineId) {
      // Check if the center has this vaccine available
      const hasVaccine = center.availableVaccines.some(av => 
        av.vaccine.toString() === vaccineId && av.isAvailable && av.stock > 0
      );

      if (!hasVaccine) {
        return res.json({
          success: true,
          data: {
            slots: [],
            message: 'Vaccine not available at this center'
          }
        });
      }
    }

    res.json({
      success: true,
      data: {
        slots: availableSlots,
        center: {
          name: center.name,
          address: center.address,
          contact: center.contact
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vaccine slots:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vaccine slots'
    });
  }
});

// Book vaccine appointment (protected)
router.post('/book', protect, [
  body('centerId').isMongoId().withMessage('Valid center ID is required'),
  body('vaccineId').isMongoId().withMessage('Valid vaccine ID is required'),
  body('doseNumber').isInt({ min: 1 }).withMessage('Valid dose number is required'),
  body('bookingDate').isISO8601().withMessage('Valid booking date is required'),
  body('timeSlot').isObject().withMessage('Time slot is required'),
  body('patientDetails.name').notEmpty().withMessage('Patient name is required'),
  body('patientDetails.phone').notEmpty().withMessage('Patient phone is required'),
  body('patientDetails.dateOfBirth').isISO8601().withMessage('Valid date of birth is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      centerId,
      vaccineId,
      doseNumber,
      bookingDate,
      timeSlot,
      patientDetails,
      medicalHistory = {}
    } = req.body;

    // Check if center exists and is active
    const center = await VaccineCenter.findById(centerId);
    if (!center || !center.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Vaccine center not found or inactive'
      });
    }

    // Check if vaccine is available at this center
    const vaccineAvailability = center.availableVaccines.find(av => 
      av.vaccine.toString() === vaccineId && av.isAvailable
    );

    if (!vaccineAvailability) {
      return res.status(400).json({
        success: false,
        message: 'Vaccine not available at this center'
      });
    }

    // Check if slot is available
    const bookingDateTime = new Date(bookingDate);
    const existingSlots = center.slots.find(slot => 
      slot.date.toDateString() === bookingDateTime.toDateString()
    );

    if (!existingSlots) {
      return res.status(400).json({
        success: false,
        message: 'No slots available for this date'
      });
    }

    const timeSlotData = existingSlots.timeSlots.find(ts => 
      ts.startTime === timeSlot.startTime && ts.endTime === timeSlot.endTime
    );

    if (!timeSlotData || timeSlotData.availableSlots <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is not available'
      });
    }

    // Check for existing bookings
    const existingBooking = await VaccineBooking.findOne({
      patient: req.user._id,
      vaccine: vaccineId,
      doseNumber,
      status: { $in: ['booked', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a booking for this vaccine dose'
      });
    }

    // Create booking
    const booking = new VaccineBooking({
      patient: req.user._id,
      vaccineCenter: centerId,
      vaccine: vaccineId,
      doseNumber,
      bookingDate: bookingDateTime,
      timeSlot,
      patientDetails: {
        ...patientDetails,
        name: patientDetails.name || `${req.user.firstName} ${req.user.lastName}`,
        phone: patientDetails.phone || req.user.phone,
        email: patientDetails.email || req.user.email,
        dateOfBirth: patientDetails.dateOfBirth || req.user.dateOfBirth,
        gender: patientDetails.gender || req.user.gender,
        address: patientDetails.address || req.user.address
      },
      medicalHistory
    });

    await booking.save();

    // Update available slots
    timeSlotData.availableSlots -= 1;
    await center.save();

    res.status(201).json({
      success: true,
      message: 'Vaccine appointment booked successfully',
      data: {
        booking: {
          _id: booking._id,
          bookingReference: booking.bookingReference,
          bookingDate: booking.bookingDate,
          timeSlot: booking.timeSlot,
          status: booking.status,
          center: {
            name: center.name,
            address: center.address,
            contact: center.contact
          }
        }
      }
    });

  } catch (error) {
    console.error('Error booking vaccine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking vaccine'
    });
  }
});

// Get user's vaccine bookings (protected)
router.get('/bookings', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { patient: req.user._id };
    if (status) query.status = status;

    const bookings = await VaccineBooking.find(query)
      .populate('vaccineCenter', 'name address contact')
      .populate('vaccine', 'name description')
      .sort({ bookingDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VaccineBooking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vaccine bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vaccine bookings'
    });
  }
});

// Cancel vaccine booking (protected)
router.put('/bookings/:id/cancel', protect, [
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await VaccineBooking.findOne({
      _id: req.params.id,
      patient: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.canBeCancelled) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled (less than 2 hours before appointment)'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    await booking.save();

    // Update available slots
    const center = await VaccineCenter.findById(booking.vaccineCenter);
    if (center) {
      const existingSlots = center.slots.find(slot => 
        slot.date.toDateString() === booking.bookingDate.toDateString()
      );

      if (existingSlots) {
        const timeSlotData = existingSlots.timeSlots.find(ts => 
          ts.startTime === booking.timeSlot.startTime && ts.endTime === booking.timeSlot.endTime
        );

        if (timeSlotData) {
          timeSlotData.availableSlots += 1;
          await center.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Error cancelling vaccine booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking'
    });
  }
});

module.exports = router;
