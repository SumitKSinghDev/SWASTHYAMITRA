const express = require('express');
const router = express.Router();
const Pharmacy = require('../models/Pharmacy');
const { protect, restrictTo } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all pharmacies (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      state,
      service,
      search,
      sort = 'rating',
      order = 'desc'
    } = req.query;

    const query = { isActive: true, isVerified: true };

    // Filter by location
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');

    // Filter by service
    if (service) query.services = service;

    // Search in pharmacy name or medicines
    if (search) {
      query.$or = [
        { pharmacyName: new RegExp(search, 'i') },
        { 'medicines.name': new RegExp(search, 'i') },
        { 'medicines.genericName': new RegExp(search, 'i') }
      ];
    }

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const pharmacies = await Pharmacy.find(query)
      .populate('userId', 'firstName lastName email phone')
      .select('-medicines')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pharmacy.countDocuments(query);

    res.json({
      success: true,
      data: {
        pharmacies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPharmacies: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pharmacies'
    });
  }
});

// Get pharmacy by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone')
      .select('-medicines');

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    res.json({
      success: true,
      data: { pharmacy }
    });
  } catch (error) {
    console.error('Error fetching pharmacy:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pharmacy'
    });
  }
});

// Get pharmacy medicines
router.get('/:id/medicines', async (req, res) => {
  try {
    const { search, category, prescriptionRequired, inStock } = req.query;

    const pharmacy = await Pharmacy.findById(req.params.id).select('medicines');
    
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    let medicines = pharmacy.medicines;

    // Apply filters
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      medicines = medicines.filter(med => 
        med.name.match(searchRegex) || 
        med.genericName?.match(searchRegex)
      );
    }

    if (category) {
      medicines = medicines.filter(med => med.category === category);
    }

    if (prescriptionRequired !== undefined) {
      medicines = medicines.filter(med => med.prescriptionRequired === (prescriptionRequired === 'true'));
    }

    if (inStock === 'true') {
      medicines = medicines.filter(med => med.stock > 0);
    }

    res.json({
      success: true,
      data: { medicines }
    });
  } catch (error) {
    console.error('Error fetching pharmacy medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching medicines'
    });
  }
});

// Check medicine availability across pharmacies
router.post('/check-availability', async (req, res) => {
  try {
    const { medicines, location } = req.body;

    if (!medicines || !Array.isArray(medicines)) {
      return res.status(400).json({
        success: false,
        message: 'Medicines array is required'
      });
    }

    const query = { isActive: true, isVerified: true };

    // If location provided, find nearby pharmacies
    if (location && location.latitude && location.longitude) {
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          $maxDistance: 10000 // 10km radius
        }
      };
    }

    const pharmacies = await Pharmacy.find(query)
      .populate('userId', 'firstName lastName')
      .select('pharmacyName address contact medicines rating deliveryFee minimumOrderAmount');

    const availability = medicines.map(medicine => {
      const availableAt = [];
      
      pharmacies.forEach(pharmacy => {
        const foundMedicine = pharmacy.medicines.find(med => 
          med.name.toLowerCase().includes(medicine.name.toLowerCase()) ||
          med.genericName?.toLowerCase().includes(medicine.name.toLowerCase())
        );

        if (foundMedicine && foundMedicine.stock > 0) {
          availableAt.push({
            pharmacyId: pharmacy._id,
            pharmacyName: pharmacy.pharmacyName,
            medicine: foundMedicine,
            address: pharmacy.address,
            contact: pharmacy.contact,
            rating: pharmacy.rating,
            deliveryFee: pharmacy.deliveryFee,
            minimumOrderAmount: pharmacy.minimumOrderAmount
          });
        }
      });

      return {
        medicineName: medicine.name,
        available: availableAt.length > 0,
        availableAt,
        totalPharmacies: availableAt.length
      };
    });

    res.json({
      success: true,
      data: { availability }
    });
  } catch (error) {
    console.error('Error checking medicine availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking availability'
    });
  }
});

// Create pharmacy profile (protected - pharmacy role only)
router.post('/', protect, restrictTo('pharmacy'), [
  body('pharmacyName').notEmpty().withMessage('Pharmacy name is required'),
  body('licenseNumber').notEmpty().withMessage('License number is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.pincode').notEmpty().withMessage('Pincode is required'),
  body('contact.phone').notEmpty().withMessage('Phone number is required')
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

    // Check if pharmacy already exists for this user
    const existingPharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (existingPharmacy) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy profile already exists for this user'
      });
    }

    const pharmacyData = {
      ...req.body,
      userId: req.user.id
    };

    const pharmacy = new Pharmacy(pharmacyData);
    await pharmacy.save();

    res.status(201).json({
      success: true,
      message: 'Pharmacy profile created successfully',
      data: { pharmacy }
    });
  } catch (error) {
    console.error('Error creating pharmacy:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating pharmacy'
    });
  }
});

// Update pharmacy profile (protected - pharmacy role only)
router.put('/', protect, restrictTo('pharmacy'), async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy profile not found'
      });
    }

    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
      pharmacy._id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Pharmacy profile updated successfully',
      data: { pharmacy: updatedPharmacy }
    });
  } catch (error) {
    console.error('Error updating pharmacy:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating pharmacy'
    });
  }
});

// Add medicine to pharmacy (protected - pharmacy role only)
router.post('/medicines', protect, restrictTo('pharmacy'), [
  body('name').notEmpty().withMessage('Medicine name is required'),
  body('dosage').notEmpty().withMessage('Dosage is required'),
  body('form').isIn(['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drops', 'powder']).withMessage('Invalid form'),
  body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('stock').isNumeric().withMessage('Stock must be a number'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required')
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

    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy profile not found'
      });
    }

    pharmacy.medicines.push(req.body);
    await pharmacy.save();

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      data: { medicine: pharmacy.medicines[pharmacy.medicines.length - 1] }
    });
  } catch (error) {
    console.error('Error adding medicine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding medicine'
    });
  }
});

// Update medicine stock (protected - pharmacy role only)
router.put('/medicines/:medicineId', protect, restrictTo('pharmacy'), [
  body('stock').isNumeric().withMessage('Stock must be a number'),
  body('price').optional().isNumeric().withMessage('Price must be a number')
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

    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy profile not found'
      });
    }

    const medicine = pharmacy.medicines.id(req.params.medicineId);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    medicine.stock = req.body.stock;
    if (req.body.price !== undefined) {
      medicine.price = req.body.price;
    }

    await pharmacy.save();

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: { medicine }
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating medicine'
    });
  }
});

module.exports = router;