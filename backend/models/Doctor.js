const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Professional Information
  licenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'general_practice',
      'cardiology',
      'dermatology',
      'pediatrics',
      'gynecology',
      'orthopedics',
      'psychiatry',
      'neurology',
      'oncology',
      'endocrinology',
      'gastroenterology',
      'pulmonology',
      'urology',
      'ophthalmology',
      'ent',
      'emergency_medicine',
      'family_medicine',
      'internal_medicine'
    ]
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    specialization: String
  }],
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  
  // Practice Information
  hospitalAffiliation: [{
    name: String,
    address: String,
    position: String,
    startDate: Date,
    endDate: Date,
    isCurrent: { type: Boolean, default: true }
  }],
  clinicAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  
  // Availability and Scheduling
  workingHours: {
    monday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    thursday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    friday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    saturday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
    sunday: { start: String, end: String, isWorking: { type: Boolean, default: false } }
  },
  consultationDuration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Consultation duration must be at least 15 minutes'],
    max: [120, 'Consultation duration cannot exceed 120 minutes']
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Consultation fee cannot be negative']
  },
  
  // Languages
  languages: [{
    type: String,
    enum: ['punjabi', 'hindi', 'english', 'urdu', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati']
  }],
  
  // Professional Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String, // Document type
    url: String,  // Document URL
    uploadedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Ratings and Reviews
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  totalConsultations: {
    type: Number,
    default: 0
  },
  
  // Emergency Availability
  isEmergencyAvailable: {
    type: Boolean,
    default: false
  },
  emergencyContact: {
    phone: String,
    availableHours: String
  },
  
  // Digital Health Features
  supportsVideoConsultation: {
    type: Boolean,
    default: true
  },
  supportsAudioConsultation: {
    type: Boolean,
    default: true
  },
  supportsChatConsultation: {
    type: Boolean,
    default: true
  },
  
  // Bio and About
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  achievements: [String],
  publications: [{
    title: String,
    journal: String,
    year: Number,
    url: String
  }],
  
  // Availability Status
  isAvailable: {
    type: Boolean,
    default: true
  },
  nextAvailableSlot: Date,
  
  // Consultation Statistics
  monthlyStats: {
    year: Number,
    month: Number,
    totalConsultations: { type: Number, default: 0 },
    videoConsultations: { type: Number, default: 0 },
    audioConsultations: { type: Number, default: 0 },
    chatConsultations: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
doctorSchema.index({ userId: 1 });
doctorSchema.index({ licenseNumber: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ isVerified: 1 });
doctorSchema.index({ isAvailable: 1 });
doctorSchema.index({ 'rating.average': -1 });

// Virtual for full professional name
doctorSchema.virtual('professionalName').get(function() {
  if (this.userId) {
    return `Dr. ${this.userId.firstName} ${this.userId.lastName}`;
  }
  return null;
});

// Method to update rating
doctorSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Method to check availability for a specific time
doctorSchema.methods.isAvailableAt = function(dateTime) {
  if (!this.isAvailable) return false;
  
  const day = dateTime.toLocaleLowerCase();
  const workingDay = this.workingHours[day];
  
  if (!workingDay || !workingDay.isWorking) return false;
  
  const appointmentTime = dateTime.getHours() * 60 + dateTime.getMinutes();
  const startTime = this.parseTime(workingDay.start);
  const endTime = this.parseTime(workingDay.end);
  
  return appointmentTime >= startTime && appointmentTime <= endTime;
};

// Helper method to parse time string
doctorSchema.methods.parseTime = function(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Method to get next available slot
doctorSchema.methods.getNextAvailableSlot = function() {
  if (!this.isAvailable) return null;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    
    const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const workingDay = this.workingHours[dayName];
    
    if (workingDay && workingDay.isWorking) {
      const startTime = this.parseTime(workingDay.start);
      const endTime = this.parseTime(workingDay.end);
      
      // Check available slots in 30-minute intervals
      for (let time = startTime; time < endTime; time += this.consultationDuration) {
        const slotTime = new Date(checkDate);
        slotTime.setHours(Math.floor(time / 60), time % 60, 0, 0);
        
        if (slotTime > now) {
          return slotTime;
        }
      }
    }
  }
  
  return null;
};

module.exports = mongoose.model('Doctor', doctorSchema);
