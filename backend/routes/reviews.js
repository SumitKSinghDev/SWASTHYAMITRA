const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get reviews for a doctor (public)
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      rating,
      sort = 'newest'
    } = req.query;

    const query = { 
      doctor: req.params.doctorId, 
      status: 'approved' 
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'highest':
        sortObj = { rating: -1 };
        break;
      case 'lowest':
        sortObj = { rating: 1 };
        break;
      case 'most_helpful':
        sortObj = { helpfulVotes: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .populate('patient', 'firstName lastName')
      .populate('appointment', 'scheduledDate consultationType')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    // Get doctor's overall rating
    const doctorRating = await Review.getDoctorRating(req.params.doctorId);
    const categoryRatings = await Review.getCategoryRatings(req.params.doctorId);

    res.json({
      success: true,
      data: {
        reviews,
        doctorRating,
        categoryRatings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching doctor reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
});

// Get user's reviews (protected)
router.get('/my-reviews', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ patient: req.user._id })
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'scheduledDate consultationType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ patient: req.user._id });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
});

// Create review (protected)
router.post('/', protect, [
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('appointmentId').isMongoId().withMessage('Valid appointment ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  body('categories.communication').optional().isInt({ min: 1, max: 5 }),
  body('categories.treatment').optional().isInt({ min: 1, max: 5 }),
  body('categories.punctuality').optional().isInt({ min: 1, max: 5 }),
  body('categories.facilities').optional().isInt({ min: 1, max: 5 }),
  body('isAnonymous').optional().isBoolean()
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
      doctorId,
      appointmentId,
      rating,
      title,
      comment,
      categories,
      isAnonymous = false
    } = req.body;

    // Check if appointment exists and belongs to the patient
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user._id,
      doctor: doctorId,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not completed'
      });
    }

    // Check if review already exists for this appointment
    const existingReview = await Review.findOne({
      appointment: appointmentId,
      patient: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this appointment'
      });
    }

    // Create review
    const review = new Review({
      patient: req.user._id,
      doctor: doctorId,
      appointment: appointmentId,
      rating,
      title,
      comment,
      categories,
      isAnonymous
    });

    await review.save();

    // Update doctor's rating
    await updateDoctorRating(doctorId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating review'
    });
  }
});

// Update review (protected)
router.put('/:id', protect, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('title').optional().isLength({ max: 100 }),
  body('comment').optional().isLength({ max: 1000 }),
  body('categories.communication').optional().isInt({ min: 1, max: 5 }),
  body('categories.treatment').optional().isInt({ min: 1, max: 5 }),
  body('categories.punctuality').optional().isInt({ min: 1, max: 5 }),
  body('categories.facilities').optional().isInt({ min: 1, max: 5 })
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

    const review = await Review.findOne({
      _id: req.params.id,
      patient: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update review
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        review[key] = req.body[key];
      }
    });

    review.status = 'pending'; // Reset to pending for re-approval
    await review.save();

    // Update doctor's rating
    await updateDoctorRating(review.doctor);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review'
    });
  }
});

// Delete review (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      patient: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const doctorId = review.doctor;
    await Review.findByIdAndDelete(req.params.id);

    // Update doctor's rating
    await updateDoctorRating(doctorId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
});

// Vote helpful (protected)
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // In a real app, you'd track who voted to prevent multiple votes
    review.helpfulVotes += 1;
    await review.save();

    res.json({
      success: true,
      message: 'Vote recorded',
      data: { helpfulVotes: review.helpfulVotes }
    });

  } catch (error) {
    console.error('Error voting helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while voting'
    });
  }
});

// Report review (protected)
router.post('/:id/report', protect, [
  body('reason').notEmpty().withMessage('Report reason is required')
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

    const { reason } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.reportCount += 1;
    review.isReported = true;
    await review.save();

    res.json({
      success: true,
      message: 'Review reported successfully'
    });

  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reporting review'
    });
  }
});

// Helper function to update doctor's rating
async function updateDoctorRating(doctorId) {
  try {
    const rating = await Review.getDoctorRating(doctorId);
    
    await Doctor.findByIdAndUpdate(doctorId, {
      'rating.average': rating.average,
      'rating.count': rating.count
    });
  } catch (error) {
    console.error('Error updating doctor rating:', error);
  }
}

module.exports = router;
