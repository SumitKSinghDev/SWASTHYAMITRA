const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Patient = require('../models/Patient');
const QRCode = require('qrcode');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/nabha-cards/:nabhaId
// @desc    Get NABHA card by ID
// @access  Private
router.get('/:nabhaId', protect, async (req, res) => {
  try {
    const { nabhaId } = req.params;

    const user = await User.findOne({ nabhaId }).select('nabhaId nabhaQRCode firstName lastName phone email dateOfBirth gender address');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'NABHA card not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'patient' && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        nabhaCard: {
          nabhaId: user.nabhaId,
          qrCode: user.nabhaQRCode,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address
        }
      }
    });

  } catch (error) {
    console.error('Get NABHA card error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting NABHA card'
    });
  }
});

// @route   POST /api/nabha-cards/generate
// @desc    Generate new NABHA card for existing user
// @access  Private (Admin/ASHA Worker only)
router.post('/generate', protect, restrictTo('admin', 'asha_worker'), [
  body('userId').isMongoId().withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user already has a NABHA ID
    if (user.nabhaId) {
      return res.status(400).json({
        status: 'error',
        message: 'User already has a NABHA card',
        nabhaId: user.nabhaId
      });
    }

    // Generate NABHA ID
    user.nabhaId = user.generateNabhaId();
    
    // Generate QR code
    const qrData = {
      nabhaId: user.nabhaId,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      email: user.email,
      generatedAt: new Date().toISOString()
    };
    
    user.nabhaQRCode = await QRCode.toDataURL(JSON.stringify(qrData));
    await user.save();

    // Create patient profile if it doesn't exist
    let patient = await Patient.findOne({ userId: user._id });
    if (!patient) {
      patient = new Patient({
        userId: user._id,
        preferredLanguage: 'punjabi',
        communicationPreference: 'sms',
        registeredByAsha: req.user.role === 'asha_worker' ? req.user._id : undefined,
        isOfflineRegistered: req.user.role === 'asha_worker'
      });
      await patient.save();
    }

    res.status(201).json({
      status: 'success',
      message: 'NABHA card generated successfully',
      data: {
        nabhaCard: {
          nabhaId: user.nabhaId,
          qrCode: user.nabhaQRCode,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Generate NABHA card error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error generating NABHA card'
    });
  }
});

// @route   POST /api/nabha-cards/regenerate-qr
// @desc    Regenerate QR code for existing NABHA card
// @access  Private (Patient/Admin only)
router.post('/regenerate-qr', protect, restrictTo('patient', 'admin'), async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? req.body.userId : req.user._id;

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.nabhaId) {
      return res.status(400).json({
        status: 'error',
        message: 'User does not have a NABHA card'
      });
    }

    // Generate new QR code
    const qrData = {
      nabhaId: user.nabhaId,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      email: user.email,
      regeneratedAt: new Date().toISOString()
    };
    
    user.nabhaQRCode = await QRCode.toDataURL(JSON.stringify(qrData));
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'QR code regenerated successfully',
      data: {
        nabhaCard: {
          nabhaId: user.nabhaId,
          qrCode: user.nabhaQRCode,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Regenerate QR code error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error regenerating QR code'
    });
  }
});

// @route   GET /api/nabha-cards/search
// @desc    Search for NABHA card by phone/email
// @access  Private (Admin/ASHA Worker only)
router.get('/search', protect, restrictTo('admin', 'asha_worker'), async (req, res) => {
  try {
    const { phone, email, nabhaId } = req.query;

    if (!phone && !email && !nabhaId) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone, email, or NABHA ID is required for search'
      });
    }

    const query = {};
    if (phone) query.phone = phone;
    if (email) query.email = email;
    if (nabhaId) query.nabhaId = nabhaId;

    const user = await User.findOne(query).select('nabhaId firstName lastName phone email dateOfBirth gender');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with the provided information'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          nabhaId: user.nabhaId,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          hasNabhaCard: !!user.nabhaId
        }
      }
    });

  } catch (error) {
    console.error('Search NABHA card error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error searching for NABHA card'
    });
  }
});

// @route   GET /api/nabha-cards/verify/:nabhaId
// @desc    Verify NABHA card validity
// @access  Public
router.get('/verify/:nabhaId', async (req, res) => {
  try {
    const { nabhaId } = req.params;

    const user = await User.findOne({ nabhaId }).select('nabhaId firstName lastName phone email isActive');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'NABHA card not found',
        valid: false
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'NABHA card is inactive',
        valid: false
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'NABHA card is valid',
      data: {
        valid: true,
        nabhaId: user.nabhaId,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Verify NABHA card error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error verifying NABHA card'
    });
  }
});

// @route   GET /api/nabha-cards/statistics
// @desc    Get NABHA card statistics
// @access  Private (Admin only)
router.get('/statistics', protect, restrictTo('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersWithNabha = await User.countDocuments({ nabhaId: { $exists: true, $ne: null } });
    const usersWithoutNabha = totalUsers - usersWithNabha;

    const recentNabhaCards = await User.find({
      nabhaId: { $exists: true, $ne: null },
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).countDocuments();

    const nabhaByRole = await User.aggregate([
      { $match: { nabhaId: { $exists: true, $ne: null } } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        statistics: {
          totalUsers,
          usersWithNabha,
          usersWithoutNabha,
          recentNabhaCards,
          nabhaByRole
        }
      }
    });

  } catch (error) {
    console.error('Get NABHA statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting NABHA statistics'
    });
  }
});

module.exports = router;
