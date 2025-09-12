const mongoose = require('mongoose');

const vaccineBookingSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vaccineCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VaccineCenter',
    required: true
  },
  vaccine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vaccine',
    required: true
  },
  doseNumber: {
    type: Number,
    required: true,
    min: 1
  },
  bookingDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: String,
    endTime: String
  },
  status: {
    type: String,
    enum: ['booked', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'booked'
  },
  bookingReference: {
    type: String,
    required: true,
    unique: true
  },
  patientDetails: {
    name: String,
    phone: String,
    email: String,
    dateOfBirth: Date,
    gender: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    }
  },
  medicalHistory: {
    allergies: [String],
    currentMedications: [String],
    chronicConditions: [String],
    previousVaccinations: [{
      vaccineName: String,
      date: Date,
      doseNumber: Number
    }]
  },
  appointmentDetails: {
    checkInTime: Date,
    checkOutTime: Date,
    administeredBy: String,
    batchNumber: String,
    expiryDate: Date,
    sideEffects: [String],
    notes: String
  },
  notifications: [{
    type: {
      type: String,
      enum: ['booking_confirmation', 'reminder', 'cancellation', 'completion']
    },
    sentAt: Date,
    method: {
      type: String,
      enum: ['sms', 'email', 'push']
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }],
  cancellationReason: String,
  rescheduleCount: {
    type: Number,
    default: 0
  },
  lastRescheduleDate: Date
}, { timestamps: true });

// Index for efficient queries
vaccineBookingSchema.index({ patient: 1, status: 1 });
vaccineBookingSchema.index({ vaccineCenter: 1, bookingDate: 1 });
vaccineBookingSchema.index({ bookingReference: 1 });
vaccineBookingSchema.index({ status: 1, bookingDate: 1 });

// Generate booking reference
vaccineBookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingReference) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingReference = `VB${year}${month}${day}${random}`;
  }
  next();
});

// Virtual for checking if booking can be cancelled
vaccineBookingSchema.virtual('canBeCancelled').get(function() {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  const timeDiff = bookingDateTime - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return this.status === 'booked' && hoursDiff > 2; // Can cancel if more than 2 hours before
});

// Virtual for checking if booking can be rescheduled
vaccineBookingSchema.virtual('canBeRescheduled').get(function() {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  const timeDiff = bookingDateTime - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return this.status === 'booked' && hoursDiff > 24 && this.rescheduleCount < 2; // Can reschedule if more than 24 hours and less than 2 reschedules
});

module.exports = mongoose.model('VaccineBooking', vaccineBookingSchema);
