const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', protect, restrictTo('admin'), async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get appointment statistics
    const totalAppointments = await Appointment.countDocuments();
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const appointmentsThisMonth = await Appointment.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Get prescription statistics
    const totalPrescriptions = await Prescription.countDocuments();
    const prescriptionsByStatus = await Prescription.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get NABHA card statistics
    const usersWithNabha = await User.countDocuments({ nabhaId: { $exists: true, $ne: null } });
    const nabhaByRole = await User.aggregate([
      { $match: { nabhaId: { $exists: true, $ne: null } } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName role createdAt');

    const recentAppointments = await Appointment.find()
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('scheduledDate status consultationType');

    res.status(200).json({
      status: 'success',
      data: {
        dashboard: {
          users: {
            total: totalUsers,
            byRole: usersByRole,
            withNabha: usersWithNabha,
            nabhaByRole: nabhaByRole
          },
          appointments: {
            total: totalAppointments,
            thisMonth: appointmentsThisMonth,
            byStatus: appointmentsByStatus
          },
          prescriptions: {
            total: totalPrescriptions,
            byStatus: prescriptionsByStatus
          },
          recentActivity: {
            users: recentUsers,
            appointments: recentAppointments
          }
        }
      }
    });

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting dashboard data'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin only)
router.get('/users', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.isActive = status === 'active';
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { nabhaId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting users'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get specific user details
// @access  Private (Admin only)
router.get('/users/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get role-specific data
    let roleData = null;
    if (user.role === 'patient') {
      roleData = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      roleData = await Doctor.findOne({ userId: user._id });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
        roleData
      }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting user details'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (active/inactive)
// @access  Private (Admin only)
router.put('/users/:id/status', protect, restrictTo('admin'), [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
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

    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating user status'
    });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify user account
// @access  Private (Admin only)
router.put('/users/:id/verify', protect, restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User verified successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error verifying user'
    });
  }
});

// @route   GET /api/admin/appointments
// @desc    Get all appointments with filters
// @access  Private (Admin only)
router.get('/appointments', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { status, type, date, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.consultationType = type;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone email nabhaId')
      .populate('doctor', 'firstName lastName specialization')
      .populate('prescription', 'prescriptionId medications')
      .sort({ scheduledDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAppointments: total
        }
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting appointments'
    });
  }
});

// @route   GET /api/admin/prescriptions
// @desc    Get all prescriptions with filters
// @access  Private (Admin only)
router.get('/prescriptions', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName phone email nabhaId')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'scheduledDate consultationType')
      .populate('assignedPharmacy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prescription.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        prescriptions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPrescriptions: total
        }
      }
    });

  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error getting prescriptions'
    });
  }
});

// @route   GET /api/admin/reports
// @desc    Generate system reports
// @access  Private (Admin only)
router.get('/reports', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();

    let report = {};

    switch (type) {
      case 'appointments':
        report = await generateAppointmentReport(start, end);
        break;
      case 'prescriptions':
        report = await generatePrescriptionReport(start, end);
        break;
      case 'users':
        report = await generateUserReport(start, end);
        break;
      default:
        report = await generateSystemReport(start, end);
    }

    res.status(200).json({
      status: 'success',
      data: {
        report: {
          type: type || 'system',
          period: { start, end },
          data: report
        }
      }
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error generating report'
    });
  }
});

// Helper functions for reports
async function generateAppointmentReport(startDate, endDate) {
  const appointments = await Appointment.find({
    scheduledDate: { $gte: startDate, $lte: endDate }
  }).populate('patient', 'role').populate('doctor', 'specialization');

  const totalAppointments = appointments.length;
  const byStatus = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});

  const byType = appointments.reduce((acc, apt) => {
    acc[apt.consultationType] = (acc[apt.consultationType] || 0) + 1;
    return acc;
  }, {});

  const bySpecialization = appointments.reduce((acc, apt) => {
    const spec = apt.doctor?.specialization || 'unknown';
    acc[spec] = (acc[spec] || 0) + 1;
    return acc;
  }, {});

  return {
    totalAppointments,
    byStatus,
    byType,
    bySpecialization
  };
}

async function generatePrescriptionReport(startDate, endDate) {
  const prescriptions = await Prescription.find({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const totalPrescriptions = prescriptions.length;
  const byStatus = prescriptions.reduce((acc, pres) => {
    acc[pres.status] = (acc[pres.status] || 0) + 1;
    return acc;
  }, {});

  const byFulfillmentStatus = prescriptions.reduce((acc, pres) => {
    acc[pres.fulfillmentStatus] = (acc[pres.fulfillmentStatus] || 0) + 1;
    return acc;
  }, {});

  return {
    totalPrescriptions,
    byStatus,
    byFulfillmentStatus
  };
}

async function generateUserReport(startDate, endDate) {
  const users = await User.find({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const totalUsers = users.length;
  const byRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const withNabha = users.filter(user => user.nabhaId).length;

  return {
    totalUsers,
    byRole,
    withNabha,
    withoutNabha: totalUsers - withNabha
  };
}

async function generateSystemReport(startDate, endDate) {
  const [appointments, prescriptions, users] = await Promise.all([
    generateAppointmentReport(startDate, endDate),
    generatePrescriptionReport(startDate, endDate),
    generateUserReport(startDate, endDate)
  ]);

  return {
    appointments,
    prescriptions,
    users
  };
}

module.exports = router;
