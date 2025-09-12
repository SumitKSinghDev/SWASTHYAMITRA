const mongoose = require('mongoose');

const medicineReminderSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicineName: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['once_daily', 'twice_daily', 'thrice_daily', 'before_meals', 'after_meals', 'as_needed'],
    required: true
  },
  timing: {
    morning: { time: String, enabled: Boolean },
    afternoon: { time: String, enabled: Boolean },
    evening: { time: String, enabled: Boolean },
    night: { time: String, enabled: Boolean }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  reminderType: {
    type: String,
    enum: ['sms', 'voice_call', 'push_notification'],
    default: 'sms'
  },
  language: {
    type: String,
    enum: ['english', 'hindi', 'punjabi'],
    default: 'hindi'
  },
  lastReminderSent: Date,
  nextReminderTime: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Method to get next reminder time
medicineReminderSchema.methods.getNextReminderTime = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Default times for reminders
  const defaultTimes = {
    morning: '09:00',
    afternoon: '14:00',
    evening: '18:00',
    night: '21:00'
  };

  // Find next enabled reminder time
  for (const [period, config] of Object.entries(this.timing)) {
    if (config.enabled) {
      const reminderTime = new Date(today);
      const [hours, minutes] = (config.time || defaultTimes[period]).split(':');
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // If time hasn't passed today, return today's time
      if (reminderTime > now) {
        return reminderTime;
      }
    }
  }
  
  // If all times passed today, return next day's first enabled time
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  for (const [period, config] of Object.entries(this.timing)) {
    if (config.enabled) {
      const [hours, minutes] = (config.time || defaultTimes[period]).split(':');
      tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return tomorrow;
    }
  }
  
  return null;
};

// Method to generate reminder message
medicineReminderSchema.methods.generateReminderMessage = function() {
  const messages = {
    english: {
      once_daily: `Take your medicine: ${this.medicineName} (${this.dosage})`,
      twice_daily: `Time for your medicine: ${this.medicineName} (${this.dosage})`,
      thrice_daily: `Medicine reminder: ${this.medicineName} (${this.dosage})`,
      before_meals: `Take ${this.medicineName} (${this.dosage}) before your meal`,
      after_meals: `Take ${this.medicineName} (${this.dosage}) after your meal`,
      as_needed: `You can take ${this.medicineName} (${this.dosage}) if needed`
    },
    hindi: {
      once_daily: `अपनी दवा लें: ${this.medicineName} (${this.dosage})`,
      twice_daily: `दवा का समय: ${this.medicineName} (${this.dosage})`,
      thrice_daily: `दवा की याददाश्त: ${this.medicineName} (${this.dosage})`,
      before_meals: `भोजन से पहले ${this.medicineName} (${this.dosage}) लें`,
      after_meals: `भोजन के बाद ${this.medicineName} (${this.dosage}) लें`,
      as_needed: `आवश्यकता होने पर ${this.medicineName} (${this.dosage}) ले सकते हैं`
    },
    punjabi: {
      once_daily: `ਆਪਣੀ ਦਵਾਈ ਲਓ: ${this.medicineName} (${this.dosage})`,
      twice_daily: `ਦਵਾਈ ਦਾ ਸਮਾਂ: ${this.medicineName} (${this.dosage})`,
      thrice_daily: `ਦਵਾਈ ਦੀ ਯਾਦ: ${this.medicineName} (${this.dosage})`,
      before_meals: `ਖਾਣਾ ਤੋਂ ਪਹਿਲਾਂ ${this.medicineName} (${this.dosage}) ਲਓ`,
      after_meals: `ਖਾਣਾ ਤੋਂ ਬਾਅਦ ${this.medicineName} (${this.dosage}) ਲਓ`,
      as_needed: `ਲੋੜ ਹੋਣ ਤੇ ${this.medicineName} (${this.dosage}) ਲੈ ਸਕਦੇ ਹੋ`
    }
  };
  
  return messages[this.language]?.[this.frequency] || messages.english[this.frequency];
};

const MedicineReminder = mongoose.model('MedicineReminder', medicineReminderSchema);

module.exports = MedicineReminder;
