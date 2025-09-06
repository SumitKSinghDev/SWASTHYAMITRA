const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  // Basic Information
  prescriptionId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Participants
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
  
  // Prescription Details
  diagnosis: [{
    condition: String,
    icdCode: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    notes: String
  }],
  
  // Medications
  medications: [{
    name: {
      type: String,
      required: [true, 'Medication name is required']
    },
    genericName: String,
    dosage: {
      type: String,
      required: [true, 'Dosage is required']
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required']
    },
    duration: {
      type: String,
      required: [true, 'Duration is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required']
    },
    unit: {
      type: String,
      enum: ['tablets', 'capsules', 'ml', 'mg', 'g', 'drops', 'puffs', 'patches'],
      default: 'tablets'
    },
    instructions: {
      type: String,
      maxlength: [500, 'Instructions cannot exceed 500 characters']
    },
    beforeAfterMeal: {
      type: String,
      enum: ['before_meal', 'after_meal', 'with_meal', 'empty_stomach', 'as_needed']
    },
    sideEffects: [String],
    contraindications: [String],
    isGeneric: {
      type: Boolean,
      default: false
    },
    alternativeMedications: [String]
  }],
  
  // Additional Instructions
  generalInstructions: {
    type: String,
    maxlength: [1000, 'General instructions cannot exceed 1000 characters']
  },
  lifestyleModifications: [{
    category: {
      type: String,
      enum: ['diet', 'exercise', 'sleep', 'stress', 'smoking', 'alcohol', 'other']
    },
    instruction: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }],
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpInstructions: String,
  followUpTests: [{
    testName: String,
    instructions: String,
    urgency: {
      type: String,
      enum: ['urgent', 'routine', 'optional'],
      default: 'routine'
    }
  }],
  
  // Lab Tests
  labTests: [{
    testName: String,
    instructions: String,
    urgency: {
      type: String,
      enum: ['urgent', 'routine', 'optional'],
      default: 'routine'
    },
    fastingRequired: {
      type: Boolean,
      default: false
    },
    specialInstructions: String
  }],
  
  // Imaging Tests
  imagingTests: [{
    testName: String,
    bodyPart: String,
    instructions: String,
    urgency: {
      type: String,
      enum: ['urgent', 'routine', 'optional'],
      default: 'routine'
    },
    specialInstructions: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'modified'],
    default: 'active'
  },
  
  // Validity
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: [true, 'Prescription validity period is required']
  },
  
  // Pharmacy Information
  assignedPharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pharmacyNotes: String,
  
  // Fulfillment Status
  fulfillmentStatus: {
    type: String,
    enum: ['pending', 'partially_fulfilled', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  fulfillmentDate: Date,
  fulfillmentNotes: String,
  
  // Refills
  refillsAllowed: {
    type: Number,
    default: 0,
    min: [0, 'Refills cannot be negative']
  },
  refillsUsed: {
    type: Number,
    default: 0,
    min: [0, 'Refills used cannot be negative']
  },
  refillHistory: [{
    refillDate: { type: Date, default: Date.now },
    quantity: Number,
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Digital Signature
  digitalSignature: {
    doctorSignature: String, // Base64 encoded signature
    signedAt: Date,
    signatureHash: String
  },
  
  // Prescription Notes
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Emergency Information
  emergencyContact: {
    phone: String,
    instructions: String
  },
  
  // Patient Allergies (for reference)
  patientAllergies: [String],
  
  // Drug Interactions
  drugInteractions: [{
    medication1: String,
    medication2: String,
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'contraindicated']
    },
    description: String,
    recommendation: String
  }],
  
  // Compliance Tracking
  complianceTracking: {
    isEnabled: { type: Boolean, default: false },
    reminderFrequency: {
      type: String,
      enum: ['daily', 'twice_daily', 'weekly'],
      default: 'daily'
    },
    reminderMethod: {
      type: String,
      enum: ['sms', 'push', 'email', 'call'],
      default: 'sms'
    }
  }
}, {
  timestamps: true
});

// Indexes
prescriptionSchema.index({ prescriptionId: 1 });
prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });
prescriptionSchema.index({ appointment: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ validUntil: 1 });
prescriptionSchema.index({ assignedPharmacy: 1 });

// Pre-save middleware to generate prescription ID
prescriptionSchema.pre('save', function(next) {
  if (!this.prescriptionId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.prescriptionId = `RX${timestamp}${random}`;
  }
  next();
});

// Virtual for prescription validity status
prescriptionSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.validFrom <= now && this.validUntil >= now && this.status === 'active';
});

// Virtual for remaining refills
prescriptionSchema.virtual('remainingRefills').get(function() {
  return Math.max(0, this.refillsAllowed - this.refillsUsed);
});

// Method to add refill
prescriptionSchema.methods.addRefill = function(quantity, pharmacy, notes) {
  if (this.remainingRefills <= 0) {
    throw new Error('No refills remaining for this prescription');
  }
  
  this.refillHistory.push({
    refillDate: new Date(),
    quantity,
    pharmacy,
    notes
  });
  
  this.refillsUsed += 1;
  return this.save();
};

// Method to check drug interactions
prescriptionSchema.methods.checkDrugInteractions = function() {
  const medicationNames = this.medications.map(med => med.name.toLowerCase());
  const interactions = [];
  
  for (let i = 0; i < medicationNames.length; i++) {
    for (let j = i + 1; j < medicationNames.length; j++) {
      // This would typically check against a drug interaction database
      // For now, we'll add a placeholder
      if (medicationNames[i] && medicationNames[j]) {
        interactions.push({
          medication1: medicationNames[i],
          medication2: medicationNames[j],
          severity: 'minor',
          description: 'Potential interaction detected',
          recommendation: 'Consult with pharmacist'
        });
      }
    }
  }
  
  this.drugInteractions = interactions;
  return this.save();
};

// Method to validate prescription
prescriptionSchema.methods.validatePrescription = function() {
  const errors = [];
  
  // Check if prescription is expired
  if (!this.isValid) {
    errors.push('Prescription has expired');
  }
  
  // Check if all required fields are present
  if (!this.medications || this.medications.length === 0) {
    errors.push('At least one medication is required');
  }
  
  // Check medication details
  this.medications.forEach((med, index) => {
    if (!med.name || !med.dosage || !med.frequency || !med.duration) {
      errors.push(`Medication ${index + 1} is missing required information`);
    }
  });
  
  // Check if patient has allergies to prescribed medications
  if (this.patientAllergies && this.patientAllergies.length > 0) {
    this.medications.forEach(med => {
      if (this.patientAllergies.some(allergy => 
        med.name.toLowerCase().includes(allergy.toLowerCase())
      )) {
        errors.push(`Patient may be allergic to ${med.name}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Static method to get prescriptions by patient
prescriptionSchema.statics.getPrescriptionsByPatient = function(patientId, status = 'active') {
  return this.find({ patient: patientId, status })
    .populate('doctor', 'firstName lastName specialization')
    .populate('appointment', 'scheduledDate consultationType')
    .populate('assignedPharmacy', 'firstName lastName')
    .sort({ createdAt: -1 });
};

// Static method to get prescriptions by doctor
prescriptionSchema.statics.getPrescriptionsByDoctor = function(doctorId, status = 'active') {
  return this.find({ doctor: doctorId, status })
    .populate('patient', 'firstName lastName nabhaId phone')
    .populate('appointment', 'scheduledDate consultationType')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Prescription', prescriptionSchema);
