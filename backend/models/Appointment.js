const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Basic Information
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Participants
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Appointment Details
  scheduledDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Duration must be at least 15 minutes'],
    max: [120, 'Duration cannot exceed 120 minutes']
  },
  
  // Consultation Type
  consultationType: {
    type: String,
    enum: ['video', 'audio', 'chat', 'in_person'],
    required: [true, 'Consultation type is required']
  },
  
  // Status
  status: {
    type: String,
    enum: [
      'scheduled',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
      'rescheduled'
    ],
    default: 'scheduled'
  },
  
  // Reason and Symptoms
  reason: {
    type: String,
    required: [true, 'Appointment reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  symptoms: [{
    symptom: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    duration: String,
    notes: String
  }],
  
  // Medical Information
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bloodSugar: Number,
    notes: String
  },
  
  // Consultation Details
  consultationNotes: {
    type: String,
    maxlength: [2000, 'Consultation notes cannot exceed 2000 characters']
  },
  diagnosis: [{
    condition: String,
    icdCode: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    notes: String
  }],
  
  // Prescription
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpNotes: String,
  
  // Payment Information
  consultationFee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash', 'upi', 'card', 'wallet']
  },
  paymentId: String,
  
  // Communication
  meetingLink: String, // For video consultations
  meetingId: String,
  meetingPassword: String,
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['sms', 'email', 'push', 'whatsapp']
    },
    sentAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    },
    message: String
  }],
  
  // Cancellation/Rescheduling
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  rescheduledTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  // Rating and Feedback
  patientRating: {
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    ratedAt: { type: Date, default: Date.now }
  },
  doctorRating: {
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    ratedAt: { type: Date, default: Date.now }
  },
  
  // Emergency Information
  isEmergency: {
    type: Boolean,
    default: false
  },
  emergencyNotes: String,
  
  // ASHA Worker Information (for offline bookings)
  bookedByAsha: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Additional Notes
  additionalNotes: String,
  
  // Timestamps
  startedAt: Date,
  endedAt: Date,
  actualDuration: Number // in minutes
}, {
  timestamps: true
});

// Indexes
appointmentSchema.index({ appointmentId: 1 });
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ scheduledDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ consultationType: 1 });
appointmentSchema.index({ paymentStatus: 1 });

// Pre-save middleware to generate appointment ID
appointmentSchema.pre('save', function(next) {
  if (!this.appointmentId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.appointmentId = `APT${timestamp}${random}`;
  }
  next();
});

// Virtual for appointment date and time combined
appointmentSchema.virtual('appointmentDateTime').get(function() {
  const [hours, minutes] = this.scheduledTime.split(':');
  const appointmentDate = new Date(this.scheduledDate);
  appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return appointmentDate;
});

// Virtual for appointment status display
appointmentSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'scheduled': 'Scheduled',
    'confirmed': 'Confirmed',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'no_show': 'No Show',
    'rescheduled': 'Rescheduled'
  };
  return statusMap[this.status] || this.status;
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentTime = this.appointmentDateTime;
  const timeDiff = appointmentTime - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return this.status === 'scheduled' && hoursDiff > 2; // Can cancel if more than 2 hours before
};

// Method to check if appointment can be rescheduled
appointmentSchema.methods.canBeRescheduled = function() {
  const now = new Date();
  const appointmentTime = this.appointmentDateTime;
  const timeDiff = appointmentTime - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return this.status === 'scheduled' && hoursDiff > 4; // Can reschedule if more than 4 hours before
};

// Method to mark as completed
appointmentSchema.methods.markCompleted = function(notes, actualDuration) {
  this.status = 'completed';
  this.endedAt = new Date();
  this.consultationNotes = notes;
  this.actualDuration = actualDuration;
  return this.save();
};

// Method to cancel appointment
appointmentSchema.methods.cancelAppointment = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  return this.save();
};

// Static method to get appointments by date range
appointmentSchema.statics.getAppointmentsByDateRange = function(startDate, endDate, doctorId = null) {
  const query = {
    scheduledDate: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (doctorId) {
    query.doctor = doctorId;
  }
  
  return this.find(query)
    .populate('patient', 'firstName lastName phone email nabhaId')
    .populate('doctor', 'firstName lastName specialization')
    .sort({ scheduledDate: 1, scheduledTime: 1 });
};

// Static method to get available time slots for a doctor on a specific date
appointmentSchema.statics.getAvailableSlots = function(doctorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    doctor: doctorId,
    scheduledDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
  }).select('scheduledTime duration');
};

module.exports = mongoose.model('Appointment', appointmentSchema);
