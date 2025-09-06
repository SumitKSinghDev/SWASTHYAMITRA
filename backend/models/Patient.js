const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Medical Information
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [{
    allergen: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    notes: String
  }],
  medicalHistory: [{
    condition: String,
    diagnosisDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic']
    },
    notes: String
  }],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Emergency Information
  emergencyContacts: [{
    name: String,
    phone: String,
    relation: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Insurance Information
  insuranceProvider: String,
  insuranceNumber: String,
  policyNumber: String,
  
  // Preferences
  preferredLanguage: {
    type: String,
    enum: ['punjabi', 'hindi', 'english'],
    default: 'punjabi'
  },
  communicationPreference: {
    type: String,
    enum: ['sms', 'call', 'whatsapp', 'email'],
    default: 'sms'
  },
  
  // Health Metrics
  vitalSigns: [{
    type: {
      type: String,
      enum: ['blood_pressure', 'heart_rate', 'temperature', 'weight', 'height', 'blood_sugar']
    },
    value: String,
    unit: String,
    recordedAt: { type: Date, default: Date.now },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Family History
  familyHistory: [{
    relation: String,
    condition: String,
    ageOfOnset: Number,
    notes: String
  }],
  
  // Consent and Privacy
  dataSharingConsent: {
    type: Boolean,
    default: false
  },
  marketingConsent: {
    type: Boolean,
    default: false
  },
  
  // ASHA Worker Information (for offline registered patients)
  registeredByAsha: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isOfflineRegistered: {
    type: Boolean,
    default: false
  },
  
  // Health Status
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  
  // Last Health Check
  lastHealthCheck: Date,
  nextScheduledCheck: Date
}, {
  timestamps: true
});

// Indexes
patientSchema.index({ userId: 1 });
patientSchema.index({ 'emergencyContacts.phone': 1 });
patientSchema.index({ registeredByAsha: 1 });

// Virtual for age calculation
patientSchema.virtual('age').get(function() {
  if (this.userId && this.userId.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.userId.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

// Method to add vital signs
patientSchema.methods.addVitalSign = function(vitalData) {
  this.vitalSigns.push({
    ...vitalData,
    recordedAt: new Date()
  });
  return this.save();
};

// Method to get latest vital signs
patientSchema.methods.getLatestVitals = function() {
  const latestVitals = {};
  this.vitalSigns.forEach(vital => {
    if (!latestVitals[vital.type] || vital.recordedAt > latestVitals[vital.type].recordedAt) {
      latestVitals[vital.type] = vital;
    }
  });
  return latestVitals;
};

module.exports = mongoose.model('Patient', patientSchema);
