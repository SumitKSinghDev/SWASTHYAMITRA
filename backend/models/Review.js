const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  categories: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    treatment: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    facilities: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for efficient queries
reviewSchema.index({ doctor: 1, status: 1, createdAt: -1 });
reviewSchema.index({ patient: 1, appointment: 1 });
reviewSchema.index({ rating: 1, status: 1 });

// Virtual for overall rating
reviewSchema.virtual('overallRating').get(function() {
  if (!this.categories) return this.rating;
  
  const categories = Object.values(this.categories).filter(val => val !== undefined);
  if (categories.length === 0) return this.rating;
  
  const sum = categories.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / categories.length) * 10) / 10;
});

// Static method to get doctor's average rating
reviewSchema.statics.getDoctorRating = async function(doctorId) {
  const result = await this.aggregate([
    { $match: { doctor: doctorId, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      average: 0,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const data = result[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  data.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    average: Math.round(data.averageRating * 10) / 10,
    count: data.totalReviews,
    distribution
  };
};

// Static method to get category ratings
reviewSchema.statics.getCategoryRatings = async function(doctorId) {
  const result = await this.aggregate([
    { $match: { doctor: doctorId, status: 'approved' } },
    {
      $group: {
        _id: null,
        communication: { $avg: '$categories.communication' },
        treatment: { $avg: '$categories.treatment' },
        punctuality: { $avg: '$categories.punctuality' },
        facilities: { $avg: '$categories.facilities' }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      communication: 0,
      treatment: 0,
      punctuality: 0,
      facilities: 0
    };
  }

  const data = result[0];
  return {
    communication: Math.round((data.communication || 0) * 10) / 10,
    treatment: Math.round((data.treatment || 0) * 10) / 10,
    punctuality: Math.round((data.punctuality || 0) * 10) / 10,
    facilities: Math.round((data.facilities || 0) * 10) / 10
  };
};

module.exports = mongoose.model('Review', reviewSchema);
