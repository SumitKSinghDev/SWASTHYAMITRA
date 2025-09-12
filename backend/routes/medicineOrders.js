const express = require('express');
const router = express.Router();
const MedicineOrder = require('../models/MedicineOrder');
const Pharmacy = require('../models/Pharmacy');
const Prescription = require('../models/Prescription');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get user's medicine orders (protected)
router.get('/my-orders', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { patient: req.user._id };
    if (status) query.status = status;

    const orders = await MedicineOrder.find(query)
      .populate('pharmacy', 'pharmacyName address contact rating')
      .populate('prescription', 'prescriptionNumber medications')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MedicineOrder.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching medicine orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// Get pharmacy orders (protected - pharmacy role)
router.get('/pharmacy-orders', protect, async (req, res) => {
  try {
    if (req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Pharmacy role required.'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { pharmacy: req.user._id };
    if (status) query.status = status;

    const orders = await MedicineOrder.find(query)
      .populate('patient', 'firstName lastName phone email')
      .populate('prescription', 'prescriptionNumber medications')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MedicineOrder.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pharmacy orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// Get order by ID (protected)
router.get('/:id', protect, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Filter by user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'pharmacy') {
      query.pharmacy = req.user._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const order = await MedicineOrder.findOne(query)
      .populate('patient', 'firstName lastName phone email')
      .populate('pharmacy', 'pharmacyName address contact rating')
      .populate('prescription', 'prescriptionNumber medications doctor');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

// Create medicine order (protected)
router.post('/', protect, [
  body('pharmacyId').isMongoId().withMessage('Valid pharmacy ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.medicine.name').notEmpty().withMessage('Medicine name is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('items.*.unitPrice').isNumeric().withMessage('Valid unit price is required'),
  body('deliveryType').isIn(['pickup', 'home_delivery']).withMessage('Valid delivery type is required'),
  body('deliveryAddress.street').notEmpty().withMessage('Street address is required'),
  body('deliveryAddress.city').notEmpty().withMessage('City is required'),
  body('deliveryAddress.state').notEmpty().withMessage('State is required'),
  body('deliveryAddress.pincode').notEmpty().withMessage('Pincode is required'),
  body('payment.method').isIn(['cash_on_delivery', 'online', 'upi', 'card']).withMessage('Valid payment method is required')
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
      pharmacyId,
      items,
      prescriptionId,
      deliveryAddress,
      deliveryType,
      payment
    } = req.body;

    // Check if pharmacy exists and is active
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy || !pharmacy.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found or inactive'
      });
    }

    // Validate prescription if provided
    if (prescriptionId) {
      const prescription = await Prescription.findOne({
        _id: prescriptionId,
        patient: req.user._id,
        status: 'active'
      });

      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found or not active'
        });
      }
    }

    // Calculate pricing
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const deliveryFee = deliveryType === 'home_delivery' ? (pharmacy.deliveryFee || 0) : 0;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + deliveryFee + tax;

    // Create order
    const order = new MedicineOrder({
      patient: req.user._id,
      pharmacy: pharmacyId,
      items: items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      })),
      prescription: prescriptionId,
      deliveryAddress,
      deliveryType,
      payment: {
        method: payment.method,
        amount: total
      },
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        total
      }
    });

    await order.save();

    // Add initial timeline entry
    await order.addTimelineEntry('pending', 'Order placed successfully', req.user._id);

    res.status(201).json({
      success: true,
      message: 'Medicine order created successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Error creating medicine order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
});

// Update order status (protected - pharmacy role)
router.put('/:id/status', protect, [
  body('status').isIn(['confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled']).withMessage('Valid status is required'),
  body('note').optional().isString()
], async (req, res) => {
  try {
    if (req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Pharmacy role required.'
      });
    }

    const { status, note } = req.body;

    const order = await MedicineOrder.findOne({
      _id: req.params.id,
      pharmacy: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    await order.save();

    // Add timeline entry
    await order.addTimelineEntry(status, note, req.user._id);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

// Cancel order (protected)
router.put('/:id/cancel', protect, [
  body('reason').notEmpty().withMessage('Cancellation reason is required')
], async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await MedicineOrder.findOne({
      _id: req.params.id,
      patient: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason,
      cancelledBy: req.user._id,
      cancelledAt: new Date()
    };

    await order.save();
    await order.addTimelineEntry('cancelled', `Order cancelled: ${reason}`, req.user._id);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
});

// Rate order (protected)
router.post('/:id/rate', protect, [
  body('overall').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('delivery').optional().isInt({ min: 1, max: 5 }),
  body('medicine').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().isString()
], async (req, res) => {
  try {
    const { overall, delivery, medicine, comment } = req.body;

    const order = await MedicineOrder.findOne({
      _id: req.params.id,
      patient: req.user._id,
      status: 'delivered'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not delivered'
      });
    }

    order.rating = {
      overall,
      delivery,
      medicine,
      comment
    };

    await order.save();

    res.json({
      success: true,
      message: 'Order rated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Error rating order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rating order'
    });
  }
});

// Check medicine availability (public)
router.post('/check-availability', async (req, res) => {
  try {
    const { pharmacyId, items } = req.body;

    if (!pharmacyId || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy ID and items are required'
      });
    }

    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    const availability = items.map(item => {
      const medicine = pharmacy.medicines.find(med => 
        med.name.toLowerCase().includes(item.name.toLowerCase()) ||
        med.genericName?.toLowerCase().includes(item.name.toLowerCase())
      );

      return {
        medicineName: item.name,
        available: medicine && medicine.stock >= item.quantity,
        stock: medicine?.stock || 0,
        price: medicine?.price || 0,
        prescriptionRequired: medicine?.prescriptionRequired || false
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

module.exports = router;
