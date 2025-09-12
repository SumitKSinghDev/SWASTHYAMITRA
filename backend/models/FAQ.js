const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    english: String,
    hindi: String,
    punjabi: String
  },
  answer: {
    english: String,
    hindi: String,
    punjabi: String
  },
  category: {
    type: String,
    enum: ['hospital_info', 'nabha_card', 'medicine_availability', 'appointment_booking', 'emergency', 'general'],
    required: true
  },
  keywords: [String], // For better matching
  priority: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
