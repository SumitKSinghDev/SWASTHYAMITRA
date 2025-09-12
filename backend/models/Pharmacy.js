const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  dosage: {
    type: String,
    required: true
  },
  form: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drops', 'powder'],
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  prescriptionRequired: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['antibiotic', 'painkiller', 'vitamin', 'antacid', 'cough_syrup', 'diabetes', 'blood_pressure', 'other'],
    default: 'other'
  },
  sideEffects: [String],
  contraindications: [String]
}, { timestamps: true });

const pharmacySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  pharmacyName: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
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
  services: [{
    type: String,
    enum: ['home_delivery', 'pickup', 'online_consultation', 'medicine_advice']
  }],
  deliveryRadius: {
    type: Number,
    default: 10 // in kilometers
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  minimumOrderAmount: {
    type: Number,
    default: 0
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
  },
  medicines: [medicineSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for location-based searches
pharmacySchema.index({ 'address.coordinates': '2dsphere' });

// Index for medicine search
pharmacySchema.index({ 'medicines.name': 'text', 'medicines.genericName': 'text' });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
