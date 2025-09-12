const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicine: {
    name: {
      type: String,
      required: true
    },
    genericName: String,
    dosage: String,
    form: String,
    manufacturer: String,
    prescriptionRequired: {
      type: Boolean,
      default: true
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }
});

const deliveryAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  landmark: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  }
});

const medicineOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  items: [orderItemSchema],
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  deliveryAddress: deliveryAddressSchema,
  deliveryType: {
    type: String,
    enum: ['pickup', 'home_delivery'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  payment: {
    method: {
      type: String,
      enum: ['cash_on_delivery', 'online', 'upi', 'card'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    amount: {
      type: Number,
      required: true
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  delivery: {
    scheduledDate: Date,
    actualDeliveryDate: Date,
    deliveryPerson: {
      name: String,
      phone: String
    },
    trackingNumber: String,
    notes: String
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundAmount: Number
  },
  rating: {
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    delivery: {
      type: Number,
      min: 1,
      max: 5
    },
    medicine: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for efficient queries
medicineOrderSchema.index({ patient: 1, status: 1, createdAt: -1 });
medicineOrderSchema.index({ pharmacy: 1, status: 1, createdAt: -1 });
medicineOrderSchema.index({ orderNumber: 1 });
medicineOrderSchema.index({ 'deliveryAddress.pincode': 1 });

// Generate order number
medicineOrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `MO${year}${month}${day}${random}`;
  }
  next();
});

// Add status to timeline
medicineOrderSchema.methods.addTimelineEntry = function(status, note, updatedBy) {
  this.timeline.push({
    status,
    note,
    updatedBy
  });
  return this.save();
};

// Calculate total price
medicineOrderSchema.methods.calculateTotal = function() {
  this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.pricing.total = this.pricing.subtotal + this.pricing.deliveryFee + this.pricing.tax - this.pricing.discount;
  return this.pricing.total;
};

// Virtual for order age
medicineOrderSchema.virtual('ageInHours').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  return Math.floor(diff / (1000 * 60 * 60));
});

// Virtual for estimated delivery time
medicineOrderSchema.virtual('estimatedDeliveryTime').get(function() {
  if (this.deliveryType === 'pickup') {
    return '30-60 minutes';
  }
  return '2-4 hours';
});

module.exports = mongoose.model('MedicineOrder', medicineOrderSchema);
