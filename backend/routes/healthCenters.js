const express = require('express');
const router = express.Router();
const HealthCenter = require('../models/HealthCenter');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all health centers (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      latitude,
      longitude,
      maxDistance = 10000,
      type,
      service,
      city,
      state,
      search,
      sort = 'distance'
    } = req.query;

    let query = { isActive: true, isVerified: true };

    // Location-based search
    if (latitude && longitude) {
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      };
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by service
    if (service) {
      query.services = service;
    }

    // Filter by location
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');

    // Search in name
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    let sortObj = {};
    if (sort === 'distance' && latitude && longitude) {
      // Distance sorting is handled by the $near query
      sortObj = { _id: 1 };
    } else if (sort === 'rating') {
      sortObj = { 'rating.average': -1 };
    } else if (sort === 'name') {
      sortObj = { name: 1 };
    } else {
      sortObj = { createdAt: -1 };
    }

    const centers = await HealthCenter.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HealthCenter.countDocuments(query);

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
    console.error('Error fetching health centers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching health centers'
    });
  }
});

// Get nearby health centers (public)
router.get('/nearby', async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      maxDistance = 10000,
      limit = 10,
      type,
      service
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    let query = {
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isActive: true,
      isVerified: true
    };

    if (type) query.type = type;
    if (service) query.services = service;

    const centers = await HealthCenter.find(query)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { centers }
    });
  } catch (error) {
    console.error('Error fetching nearby health centers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby health centers'
    });
  }
});

// Get health center by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const center = await HealthCenter.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Health center not found'
      });
    }

    res.json({
      success: true,
      data: { center }
    });
  } catch (error) {
    console.error('Error fetching health center:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching health center'
    });
  }
});

// Get health center types (public)
router.get('/types/list', async (req, res) => {
  try {
    const types = [
      { value: 'primary_health_center', label: 'Primary Health Center' },
      { value: 'community_health_center', label: 'Community Health Center' },
      { value: 'sub_center', label: 'Sub Center' },
      { value: 'asha_center', label: 'ASHA Center' },
      { value: 'mini_health_center', label: 'Mini Health Center' }
    ];

    res.json({
      success: true,
      data: { types }
    });
  } catch (error) {
    console.error('Error fetching health center types:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching health center types'
    });
  }
});

// Get available services (public)
router.get('/services/list', async (req, res) => {
  try {
    const services = [
      { value: 'general_consultation', label: 'General Consultation' },
      { value: 'maternal_health', label: 'Maternal Health' },
      { value: 'child_health', label: 'Child Health' },
      { value: 'immunization', label: 'Immunization' },
      { value: 'family_planning', label: 'Family Planning' },
      { value: 'emergency_care', label: 'Emergency Care' },
      { value: 'laboratory_tests', label: 'Laboratory Tests' },
      { value: 'pharmacy', label: 'Pharmacy' },
      { value: 'telemedicine', label: 'Telemedicine' },
      { value: 'health_education', label: 'Health Education' },
      { value: 'nutrition_counseling', label: 'Nutrition Counseling' },
      { value: 'mental_health', label: 'Mental Health' }
    ];

    res.json({
      success: true,
      data: { services }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services'
    });
  }
});

// Create health center (protected - admin only)
router.post('/', protect, [
  body('name').notEmpty().withMessage('Center name is required'),
  body('centerCode').notEmpty().withMessage('Center code is required'),
  body('type').isIn(['primary_health_center', 'community_health_center', 'sub_center', 'asha_center', 'mini_health_center']).withMessage('Valid center type is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.pincode').notEmpty().withMessage('Pincode is required'),
  body('address.coordinates.latitude').isNumeric().withMessage('Valid latitude is required'),
  body('address.coordinates.longitude').isNumeric().withMessage('Valid longitude is required'),
  body('contact.phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const healthCenter = new HealthCenter(req.body);
    await healthCenter.save();

    res.status(201).json({
      success: true,
      message: 'Health center created successfully',
      data: { healthCenter }
    });
  } catch (error) {
    console.error('Error creating health center:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating health center'
    });
  }
});

// Update health center (protected - admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const healthCenter = await HealthCenter.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!healthCenter) {
      return res.status(404).json({
        success: false,
        message: 'Health center not found'
      });
    }

    res.json({
      success: true,
      message: 'Health center updated successfully',
      data: { healthCenter }
    });
  } catch (error) {
    console.error('Error updating health center:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating health center'
    });
  }
});

// Delete health center (protected - admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const healthCenter = await HealthCenter.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!healthCenter) {
      return res.status(404).json({
        success: false,
        message: 'Health center not found'
      });
    }

    res.json({
      success: true,
      message: 'Health center deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting health center:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting health center'
    });
  }
});

module.exports = router;
