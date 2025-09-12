const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  translations: {
    hindi: String,
    punjabi: String,
    english: String
  },
  category: {
    type: String,
    enum: ['fever', 'respiratory', 'digestive', 'skin', 'pain', 'general'],
    required: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    default: 'mild'
  },
  questions: [{
    question: {
      english: String,
      hindi: String,
      punjabi: String
    },
    options: [{
      text: {
        english: String,
        hindi: String,
        punjabi: String
      },
      value: String,
      nextSymptom: String
    }]
  }]
});

const conditionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  translations: {
    hindi: String,
    punjabi: String,
    english: String
  },
  symptoms: [String],
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'emergency'],
    required: true
  },
  guidance: {
    english: String,
    hindi: String,
    punjabi: String
  },
  nextSteps: {
    english: String,
    hindi: String,
    punjabi: String
  },
  emergency: {
    type: Boolean,
    default: false
  },
  requiresDoctor: {
    type: Boolean,
    default: true
  }
});

const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  language: {
    type: String,
    enum: ['english', 'hindi', 'punjabi'],
    default: 'english'
  },
  messages: [{
    type: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      english: String,
      hindi: String,
      punjabi: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    symptoms: [String],
    suggestedCondition: String,
    confidence: Number
  }],
  currentStep: {
    type: String,
    enum: ['greeting', 'symptom_assessment', 'guidance', 'next_steps', 'completed'],
    default: 'greeting'
  },
  symptoms: [String],
  suggestedConditions: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Symptom = mongoose.model('Symptom', symptomSchema);
const Condition = mongoose.model('Condition', conditionSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Symptom, Condition, Conversation };
