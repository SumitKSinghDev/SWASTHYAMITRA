const mongoose = require('mongoose');

const vaccineSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  timeSlots: [{
    startTime: String,
    endTime: String,
    availableSlots: {
      type: Number,
      default: 0
    },
    totalSlots: {
      type: Number,
      default: 0
    }
  }]
}, { timestamps: true });

const vaccineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ageGroup: {
    minAge: {
      type: Number,
      required: true
    },
    maxAge: {
      type: Number,
      required: true
    }
  },
  doses: [{
    doseNumber: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    intervalDays: {
      type: Number,
      default: 0
    },
    description: String
  }],
  sideEffects: [String],
  contraindications: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const vaccineCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  centerCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    alternatePhone: String
  },
  timings: {
    openTime: String,
    closeTime: String,
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  availableVaccines: [{
    vaccine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vaccine',
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    stock: {
      type: Number,
      default: 0
    }
  }],
  capacity: {
    dailyCapacity: {
      type: Number,
      default: 100
    },
    slotsPerHour: {
      type: Number,
      default: 10
    }
  },
  slots: [vaccineSlotSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// Index for location-based searches
vaccineCenterSchema.index({ 'address.coordinates': '2dsphere' });

// Index for vaccine availability
vaccineCenterSchema.index({ 'availableVaccines.vaccine': 1, 'availableVaccines.isAvailable': 1 });

const VaccineCenter = mongoose.model('VaccineCenter', vaccineCenterSchema);
const Vaccine = mongoose.model('Vaccine', vaccineSchema);

module.exports = { VaccineCenter, Vaccine };
