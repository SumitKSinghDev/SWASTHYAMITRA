const mongoose = require('mongoose');

const healthCenterSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['primary_health_center', 'community_health_center', 'sub_center', 'asha_center', 'mini_health_center'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
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
    enum: [
      'general_consultation',
      'maternal_health',
      'child_health',
      'immunization',
      'family_planning',
      'emergency_care',
      'laboratory_tests',
      'pharmacy',
      'telemedicine',
      'health_education',
      'nutrition_counseling',
      'mental_health'
    ]
  }],
  staff: {
    doctors: {
      type: Number,
      default: 0
    },
    nurses: {
      type: Number,
      default: 0
    },
    asha_workers: {
      type: Number,
      default: 0
    },
    other_staff: {
      type: Number,
      default: 0
    }
  },
  facilities: {
    hasPharmacy: {
      type: Boolean,
      default: false
    },
    hasLaboratory: {
      type: Boolean,
      default: false
    },
    hasEmergency: {
      type: Boolean,
      default: false
    },
    hasTelemedicine: {
      type: Boolean,
      default: false
    },
    hasAmbulance: {
      type: Boolean,
      default: false
    },
    hasWheelchairAccess: {
      type: Boolean,
      default: false
    },
    hasParking: {
      type: Boolean,
      default: false
    }
  },
  capacity: {
    dailyPatients: {
      type: Number,
      default: 50
    },
    emergencyCapacity: {
      type: Number,
      default: 5
    }
  },
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
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for location-based searches
healthCenterSchema.index({ 'address.coordinates': '2dsphere' });

// Index for service searches
healthCenterSchema.index({ services: 1, isActive: 1 });

// Index for type searches
healthCenterSchema.index({ type: 1, isActive: 1 });

// Static method to find nearby centers
healthCenterSchema.statics.findNearby = function(latitude, longitude, maxDistance = 10000, limit = 20) {
  return this.find({
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  }).limit(limit);
};

// Virtual for distance calculation (will be populated by aggregation)
healthCenterSchema.virtual('distance').get(function() {
  return this._distance;
});

module.exports = mongoose.model('HealthCenter', healthCenterSchema);
