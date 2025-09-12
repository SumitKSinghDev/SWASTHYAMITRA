const express = require('express');
const { Symptom, Condition, Conversation } = require('../models/HealthAssistant');
const FAQ = require('../models/FAQ');
const MedicineReminder = require('../models/MedicineReminder');
const { protect } = require('../middleware/auth');

const router = express.Router();

// AI Health Assistant logic
class HealthAssistant {
  constructor() {
    this.initializeData();
  }

  async initializeData() {
    // Initialize FAQ data
    const faqs = [
      {
        question: {
          english: 'What are the hospital timings?',
          hindi: 'अस्पताल के समय क्या हैं?',
          punjabi: 'ਹਸਪਤਾਲ ਦੇ ਸਮੇਂ ਕੀ ਹਨ?'
        },
        answer: {
          english: 'Our hospital is open 24/7 for emergencies. Regular consultation timings are 9 AM to 6 PM, Monday to Saturday.',
          hindi: 'हमारा अस्पताल आपातकालीन स्थितियों के लिए 24/7 खुला रहता है। नियमित परामर्श का समय सोमवार से शनिवार तक सुबह 9 बजे से शाम 6 बजे तक है।',
          punjabi: 'ਸਾਡਾ ਹਸਪਤਾਲ ਜ਼ਰੂਰੀ ਸਥਿਤੀਆਂ ਲਈ 24/7 ਖੁੱਲ੍ਹਾ ਰਹਿੰਦਾ ਹੈ। ਨਿਯਮਿਤ ਸਲਾਹ ਦਾ ਸਮਾਂ ਸੋਮਵਾਰ ਤੋਂ ਸ਼ਨੀਵਾਰ ਤੱਕ ਸਵੇਰੇ 9 ਵਜੇ ਤੋਂ ਸ਼ਾਮ 6 ਵਜੇ ਤੱਕ ਹੈ।'
        },
        category: 'hospital_info',
        keywords: ['timing', 'hours', 'open', 'समय', 'घंटे', 'खुला', 'ਸਮਾਂ', 'ਘੰਟੇ', 'ਖੁੱਲ੍ਹਾ']
      },
      {
        question: {
          english: 'How to create NABHA card?',
          hindi: 'NABHA कार्ड कैसे बनाएं?',
          punjabi: 'NABHA ਕਾਰਡ ਕਿਵੇਂ ਬਣਾਈਏ?'
        },
        answer: {
          english: 'To create NABHA card, register on our platform with your Aadhaar details. Visit the nearest health center or register online.',
          hindi: 'NABHA कार्ड बनाने के लिए, अपने आधार विवरण के साथ हमारे प्लेटफॉर्म पर पंजीकरण करें। निकटतम स्वास्थ्य केंद्र पर जाएं या ऑनलाइन पंजीकरण करें।',
          punjabi: 'NABHA ਕਾਰਡ ਬਣਾਉਣ ਲਈ, ਆਪਣੇ ਆਧਾਰ ਵਿਵਰਣਾਂ ਨਾਲ ਸਾਡੇ ਪਲੇਟਫਾਰਮ ਤੇ ਰਜਿਸਟਰ ਕਰੋ। ਨੇੜਲੇ ਸਿਹਤ ਕੇਂਦਰ ਤੇ ਜਾਓ ਜਾਂ ਔਨਲਾਈਨ ਰਜਿਸਟਰ ਕਰੋ।'
        },
        category: 'nabha_card',
        keywords: ['nabha', 'card', 'create', 'make', 'कार्ड', 'बनाएं', 'ਕਾਰਡ', 'ਬਣਾਈਏ']
      },
      {
        question: {
          english: 'Is medicine available?',
          hindi: 'दवा उपलब्ध है?',
          punjabi: 'ਦਵਾਈ ਉਪਲਬਧ ਹੈ?'
        },
        answer: {
          english: 'Check medicine availability in our pharmacy section. You can also call our pharmacy at +91-XXXX-XXXX for stock inquiry.',
          hindi: 'हमारे फार्मेसी सेक्शन में दवा की उपलब्धता जांचें। स्टॉक पूछताछ के लिए आप हमारी फार्मेसी को +91-XXXX-XXXX पर भी कॉल कर सकते हैं।',
          punjabi: 'ਸਾਡੇ ਫਾਰਮੇਸੀ ਸੈਕਸ਼ਨ ਵਿੱਚ ਦਵਾਈ ਦੀ ਉਪਲਬਧਤਾ ਜਾਂਚੋ। ਸਟਾਕ ਪੁੱਛਗਿੱਛ ਲਈ ਤੁਸੀਂ ਸਾਡੀ ਫਾਰਮੇਸੀ ਨੂੰ +91-XXXX-XXXX ਤੇ ਵੀ ਕਾਲ ਕਰ ਸਕਦੇ ਹੋ।'
        },
        category: 'medicine_availability',
        keywords: ['medicine', 'drug', 'available', 'stock', 'दवा', 'उपलब्ध', 'ਦਵਾਈ', 'ਉਪਲਬਧ']
      }
    ];

    // Initialize symptoms data
    const symptoms = [
      {
        name: 'fever',
        translations: {
          hindi: 'बुखार',
          punjabi: 'ਤਾਪ',
          english: 'Fever'
        },
        category: 'fever',
        questions: [{
          question: {
            english: 'How high is your fever?',
            hindi: 'आपका बुखार कितना है?',
            punjabi: 'ਤੁਹਾਡਾ ਤਾਪ ਕਿੰਨਾ ਹੈ?'
          },
          options: [
            { text: { english: 'Mild (below 100°F)', hindi: 'हल्का (100°F से कम)', punjabi: 'ਹਲਕਾ (100°F ਤੋਂ ਘੱਟ)' }, value: 'mild', nextSymptom: 'fever_duration' },
            { text: { english: 'Moderate (100-102°F)', hindi: 'मध्यम (100-102°F)', punjabi: 'ਮੱਧਮ (100-102°F)' }, value: 'moderate', nextSymptom: 'fever_duration' },
            { text: { english: 'High (above 102°F)', hindi: 'उच्च (102°F से अधिक)', punjabi: 'ਉੱਚ (102°F ਤੋਂ ਵੱਧ)' }, value: 'high', nextSymptom: 'fever_duration' }
          ]
        }]
      },
      {
        name: 'cough',
        translations: {
          hindi: 'खांसी',
          punjabi: 'ਖੰਘ',
          english: 'Cough'
        },
        category: 'respiratory',
        questions: [{
          question: {
            english: 'What type of cough do you have?',
            hindi: 'आपको कैसी खांसी है?',
            punjabi: 'ਤੁਹਾਡੀ ਕਿਹੜੀ ਕਿਸਮ ਦੀ ਖੰਘ ਹੈ?'
          },
          options: [
            { text: { english: 'Dry cough', hindi: 'सूखी खांसी', punjabi: 'ਸੁੱਕੀ ਖੰਘ' }, value: 'dry' },
            { text: { english: 'Wet cough with phlegm', hindi: 'बलगम के साथ गीली खांसी', punjabi: 'ਬਲਗਮ ਨਾਲ ਗਿੱਲੀ ਖੰਘ' }, value: 'wet' },
            { text: { english: 'Persistent cough', hindi: 'लगातार खांसी', punjabi: 'ਲਗਾਤਾਰ ਖੰਘ' }, value: 'persistent' }
          ]
        }]
      },
      {
        name: 'stomach_pain',
        translations: {
          hindi: 'पेट दर्द',
          punjabi: 'ਪੇਟ ਦਰਦ',
          english: 'Stomach Pain'
        },
        category: 'digestive',
        questions: [{
          question: {
            english: 'Where is the pain located?',
            hindi: 'दर्द कहाँ है?',
            punjabi: 'ਦਰਦ ਕਿੱਥੇ ਹੈ?'
          },
          options: [
            { text: { english: 'Upper abdomen', hindi: 'ऊपरी पेट', punjabi: 'ਉੱਪਰਲਾ ਪੇਟ' }, value: 'upper' },
            { text: { english: 'Lower abdomen', hindi: 'निचला पेट', punjabi: 'ਹੇਠਲਾ ਪੇਟ' }, value: 'lower' },
            { text: { english: 'All over stomach', hindi: 'पूरे पेट में', punjabi: 'ਸਾਰੇ ਪੇਟ ਵਿੱਚ' }, value: 'general' }
          ]
        }]
      }
    ];

    // Initialize conditions data
    const conditions = [
      {
        name: 'common_cold',
        translations: {
          hindi: 'सामान्य सर्दी',
          punjabi: 'ਆਮ ਜ਼ੁਕਾਮ',
          english: 'Common Cold'
        },
        symptoms: ['fever', 'cough', 'runny_nose'],
        severity: 'mild',
        guidance: {
          english: 'This may be a common cold. Rest well, drink warm fluids, and take steam inhalation.',
          hindi: 'यह सामान्य सर्दी हो सकती है। अच्छी तरह आराम करें, गर्म तरल पदार्थ पिएं, और भाप लें।',
          punjabi: 'ਇਹ ਆਮ ਜ਼ੁਕਾਮ ਹੋ ਸਕਦਾ ਹੈ। ਚੰਗੀ ਤਰ੍ਹਾਂ ਆਰਾਮ ਕਰੋ, ਗਰਮ ਤਰਲ ਪਦਾਰਥ ਪੀਓ, ਅਤੇ ਭਾਪ ਲਓ।'
        },
        nextSteps: {
          english: 'If symptoms persist for more than 3 days, consult a doctor.',
          hindi: 'यदि लक्षण 3 दिन से अधिक समय तक बने रहें, तो डॉक्टर से सलाह लें।',
          punjabi: 'ਜੇ ਲੱਛਣ 3 ਦਿਨ ਤੋਂ ਵੱਧ ਰਹਿੰਦੇ ਹਨ, ਤਾਂ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਲਓ।'
        },
        requiresDoctor: false
      },
      {
        name: 'high_fever',
        translations: {
          hindi: 'तेज बुखार',
          punjabi: 'ਤੇਜ਼ ਤਾਪ',
          english: 'High Fever'
        },
        symptoms: ['fever'],
        severity: 'severe',
        guidance: {
          english: 'High fever requires immediate attention. Take fever-reducing medicine and cool compresses.',
          hindi: 'तेज बुखार को तुरंत ध्यान देने की आवश्यकता है। बुखार कम करने की दवा लें और ठंडे सेक लगाएं।',
          punjabi: 'ਤੇਜ਼ ਤਾਪ ਨੂੰ ਤੁਰੰਤ ਧਿਆਨ ਦੇਣ ਦੀ ਲੋੜ ਹੈ। ਤਾਪ ਘਟਾਉਣ ਵਾਲੀ ਦਵਾਈ ਲਓ ਅਤੇ ਠੰਡੇ ਸੇਕ ਲਗਾਓ।'
        },
        nextSteps: {
          english: 'Consult a doctor immediately if fever is above 103°F or persists for more than 2 days.',
          hindi: 'यदि बुखार 103°F से अधिक है या 2 दिन से अधिक समय तक बना रहता है, तो तुरंत डॉक्टर से सलाह लें।',
          punjabi: 'ਜੇ ਤਾਪ 103°F ਤੋਂ ਵੱਧ ਹੈ ਜਾਂ 2 ਦਿਨ ਤੋਂ ਵੱਧ ਰਹਿੰਦਾ ਹੈ, ਤਾਂ ਤੁਰੰਤ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਲਓ।'
        },
        requiresDoctor: true,
        emergency: true
      }
    ];

    // Insert data if not exists
    try {
      await FAQ.insertMany(faqs, { ordered: false });
      await Symptom.insertMany(symptoms, { ordered: false });
      await Condition.insertMany(conditions, { ordered: false });
    } catch (error) {
      // Ignore duplicate key errors
      if (error.code !== 11000) {
        console.error('Error initializing health assistant data:', error);
      }
    }
  }

  detectLanguage(text) {
    // Simple language detection based on character sets
    const hindiRegex = /[\u0900-\u097F]/;
    const punjabiRegex = /[\u0A00-\u0A7F]/;
    
    if (hindiRegex.test(text)) return 'hindi';
    if (punjabiRegex.test(text)) return 'punjabi';
    return 'english';
  }

  generateGreeting(language) {
    const greetings = {
      english: "Hello! I'm your AI Health Assistant. I'll help you understand your symptoms and guide you. What symptoms are you experiencing?",
      hindi: "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूं। मैं आपके लक्षणों को समझने और आपका मार्गदर्शन करने में मदद करूंगा। आपको क्या लक्षण अनुभव हो रहे हैं?",
      punjabi: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਸਿਹਤ ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਨੂੰ ਸਮਝਣ ਅਤੇ ਤੁਹਾਡਾ ਮਾਰਗਦਰਸ਼ਨ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ। ਤੁਹਾਨੂੰ ਕੀ ਲੱਛਣ ਮਹਿਸੂਸ ਹੋ ਰਹੇ ਹਨ?"
    };
    return greetings[language] || greetings.english;
  }

  generateSMSResponse(condition, language) {
    const responses = {
      common_cold: {
        english: "May be common cold. Rest, drink warm fluids. If persists >3 days, see doctor.",
        hindi: "सामान्य सर्दी हो सकती है। आराम करें, गर्म पेय पिएं। 3 दिन से अधिक रहने पर डॉक्टर से मिलें।",
        punjabi: "ਆਮ ਜ਼ੁਕਾਮ ਹੋ ਸਕਦਾ ਹੈ। ਆਰਾਮ ਕਰੋ, ਗਰਮ ਪੀਣ ਪੀਓ। 3 ਦਿਨ ਤੋਂ ਵੱਧ ਰਹਿਣ ਤੇ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ।"
      },
      high_fever: {
        english: "HIGH FEVER! Take fever medicine, cool compress. See doctor immediately if >103°F.",
        hindi: "तेज बुखार! बुखार की दवा लें, ठंडा सेक लगाएं। 103°F से अधिक होने पर तुरंत डॉक्टर से मिलें।",
        punjabi: "ਤੇਜ਼ ਤਾਪ! ਤਾਪ ਦੀ ਦਵਾਈ ਲਓ, ਠੰਡਾ ਸੇਕ ਲਗਾਓ। 103°F ਤੋਂ ਵੱਧ ਹੋਣ ਤੇ ਤੁਰੰਤ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ।"
      }
    };
    return responses[condition]?.[language] || responses[condition]?.english || "Please consult a doctor for proper diagnosis.";
  }

  async assessSymptoms(symptoms, language) {
    try {
      const conditions = await Condition.find({});
      let bestMatch = null;
      let maxScore = 0;

      for (const condition of conditions) {
        const matchingSymptoms = condition.symptoms.filter(symptom => 
          symptoms.some(userSymptom => 
            userSymptom.toLowerCase().includes(symptom.toLowerCase()) ||
            symptom.toLowerCase().includes(userSymptom.toLowerCase())
          )
        );
        
        const score = matchingSymptoms.length / condition.symptoms.length;
        if (score > maxScore) {
          maxScore = score;
          bestMatch = condition;
        }
      }

      return {
        condition: bestMatch,
        confidence: maxScore,
        requiresDoctor: bestMatch?.requiresDoctor || false,
        emergency: bestMatch?.emergency || false
      };
    } catch (error) {
      console.error('Error assessing symptoms:', error);
      return null;
    }
  }

  async checkFAQ(message, language) {
    try {
      const faqs = await FAQ.find({ isActive: true });
      const lowerMessage = message.toLowerCase();
      
      for (const faq of faqs) {
        // Check keywords
        const hasKeyword = faq.keywords.some(keyword => 
          lowerMessage.includes(keyword.toLowerCase())
        );
        
        if (hasKeyword) {
          return {
            question: faq.question[language] || faq.question.english,
            answer: faq.answer[language] || faq.answer.english,
            category: faq.category
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking FAQ:', error);
      return null;
    }
  }

  generateVoiceMenu(language) {
    const menus = {
      english: {
        greeting: "Hello! Press 1 for symptom checker, Press 2 for FAQ, Press 3 for medicine reminders, Press 0 to speak to operator.",
        symptom_checker: "Please describe your symptoms. You can say things like fever, cough, headache, or stomach pain.",
        faq: "What would you like to know? You can ask about hospital timings, NABHA card, or medicine availability.",
        medicine_reminder: "Press 1 to set medicine reminder, Press 2 to check existing reminders, Press 3 to cancel reminder."
      },
      hindi: {
        greeting: "नमस्ते! लक्षण जांच के लिए 1 दबाएं, सामान्य प्रश्नों के लिए 2 दबाएं, दवा याददाश्त के लिए 3 दबाएं, ऑपरेटर से बात करने के लिए 0 दबाएं।",
        symptom_checker: "कृपया अपने लक्षण बताएं। आप बुखार, खांसी, सिरदर्द, या पेट दर्द जैसी चीजें कह सकते हैं।",
        faq: "आप क्या जानना चाहते हैं? आप अस्पताल के समय, NABHA कार्ड, या दवा की उपलब्धता के बारे में पूछ सकते हैं।",
        medicine_reminder: "दवा याददाश्त सेट करने के लिए 1 दबाएं, मौजूदा याददाश्त जांचने के लिए 2 दबाएं, याददाश्त रद्द करने के लिए 3 दबाएं।"
      },
      punjabi: {
        greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਲੱਛਣ ਜਾਂਚ ਲਈ 1 ਦਬਾਓ, ਆਮ ਸਵਾਲਾਂ ਲਈ 2 ਦਬਾਓ, ਦਵਾਈ ਯਾਦ ਲਈ 3 ਦਬਾਓ, ਓਪਰੇਟਰ ਨਾਲ ਬਾਤ ਕਰਨ ਲਈ 0 ਦਬਾਓ।",
        symptom_checker: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ। ਤੁਸੀਂ ਤਾਪ, ਖੰਘ, ਸਿਰ ਦਰਦ, ਜਾਂ ਪੇਟ ਦਰਦ ਵਰਗੀਆਂ ਚੀਜ਼ਾਂ ਕਹਿ ਸਕਦੇ ਹੋ।",
        faq: "ਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ? ਤੁਸੀਂ ਹਸਪਤਾਲ ਦੇ ਸਮੇਂ, NABHA ਕਾਰਡ, ਜਾਂ ਦਵਾਈ ਦੀ ਉਪਲਬਧਤਾ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।",
        medicine_reminder: "ਦਵਾਈ ਯਾਦ ਸੈੱਟ ਕਰਨ ਲਈ 1 ਦਬਾਓ, ਮੌਜੂਦਾ ਯਾਦ ਜਾਂਚਣ ਲਈ 2 ਦਬਾਓ, ਯਾਦ ਰੱਦ ਕਰਨ ਲਈ 3 ਦਬਾਓ।"
      }
    };
    
    return menus[language] || menus.english;
  }
}

const assistant = new HealthAssistant();

// Routes
router.post('/conversation/start', async (req, res) => {
  try {
    const { language, userId } = req.body;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation = new Conversation({
      sessionId,
      userId,
      language: language || 'english',
      messages: [{
        type: 'assistant',
        content: {
          english: assistant.generateGreeting('english'),
          hindi: assistant.generateGreeting('hindi'),
          punjabi: assistant.generateGreeting('punjabi')
        }
      }]
    });

    await conversation.save();

    res.json({
      success: true,
      sessionId,
      message: conversation.messages[0].content[language || 'english']
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start conversation'
    });
  }
});

router.post('/conversation/message', async (req, res) => {
  try {
    const { sessionId, message, language } = req.body;
    
    const conversation = await Conversation.findOne({ sessionId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Detect language from user message
    const detectedLanguage = assistant.detectLanguage(message);
    const responseLanguage = language || detectedLanguage;

    // Add user message
    conversation.messages.push({
      type: 'user',
      content: {
        [responseLanguage]: message
      }
    });

    // Check if it's an FAQ question first
    const faqResult = await assistant.checkFAQ(message, responseLanguage);
    
    let response = {
      english: "I understand you're not feeling well. Please describe your symptoms in more detail.",
      hindi: "मैं समझ गया कि आप ठीक नहीं महसूस कर रहे हैं। कृपया अपने लक्षणों का विस्तार से वर्णन करें।",
      punjabi: "ਮੈਂ ਸਮਝ ਗਿਆ ਕਿ ਤੁਸੀਂ ਠੀਕ ਨਹੀਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਿਸਤਾਰ ਨਾਲ ਵਰਣਨ ਕਰੋ।"
    };

    if (faqResult) {
      // Handle FAQ response
      response = {
        english: faqResult.answer,
        hindi: faqResult.answer,
        punjabi: faqResult.answer
      };

      conversation.messages.push({
        type: 'assistant',
        content: response,
        category: 'faq'
      });

      await conversation.save();

      return res.json({
        success: true,
        message: response[responseLanguage],
        type: 'faq',
        category: faqResult.category
      });
    }

    // Extract symptoms from message (simple keyword matching)
    const symptomKeywords = {
      fever: ['fever', 'temperature', 'hot', 'बुखार', 'ताप', 'ਤਾਪ'],
      cough: ['cough', 'coughing', 'खांसी', 'ਖੰਘ'],
      headache: ['headache', 'head pain', 'सिरदर्द', 'ਸਿਰ ਦਰਦ'],
      stomach_pain: ['stomach', 'belly', 'abdominal', 'पेट', 'ਪੇਟ'],
      cold: ['cold', 'runny nose', 'sneezing', 'सर्दी', 'ਜ਼ੁਕਾਮ']
    };

    const detectedSymptoms = [];
    Object.keys(symptomKeywords).forEach(symptom => {
      if (symptomKeywords[symptom].some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      )) {
        detectedSymptoms.push(symptom);
      }
    });

    // Assess symptoms
    const assessment = await assistant.assessSymptoms(detectedSymptoms, responseLanguage);

    if (assessment && assessment.condition) {
      response = {
        english: assessment.condition.guidance.english,
        hindi: assessment.condition.guidance.hindi,
        punjabi: assessment.condition.guidance.punjabi
      };

      // Add next steps
      const nextSteps = {
        english: assessment.condition.nextSteps.english,
        hindi: assessment.condition.nextSteps.hindi,
        punjabi: assessment.condition.nextSteps.punjabi
      };

      // Add assistant response
      conversation.messages.push({
        type: 'assistant',
        content: response,
        symptoms: detectedSymptoms,
        suggestedCondition: assessment.condition.name,
        confidence: assessment.confidence
      });

      // Add next steps message
      conversation.messages.push({
        type: 'assistant',
        content: nextSteps
      });

      conversation.symptoms = detectedSymptoms;
      conversation.suggestedConditions = [assessment.condition.name];
      conversation.currentStep = 'guidance';
    } else {
      // Add assistant response asking for more details
      conversation.messages.push({
        type: 'assistant',
        content: response
      });
    }

    await conversation.save();

    res.json({
      success: true,
      message: response[responseLanguage],
      nextSteps: assessment?.condition?.nextSteps?.[responseLanguage],
      requiresDoctor: assessment?.requiresDoctor || false,
      emergency: assessment?.emergency || false,
      smsResponse: assessment?.condition ? 
        assistant.generateSMSResponse(assessment.condition.name, responseLanguage) : null
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

router.get('/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = await Conversation.findOne({ sessionId });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
});

router.get('/symptoms', async (req, res) => {
  try {
    const symptoms = await Symptom.find({});
    res.json({
      success: true,
      symptoms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch symptoms'
    });
  }
});

router.get('/conditions', async (req, res) => {
  try {
    const conditions = await Condition.find({});
    res.json({
      success: true,
      conditions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conditions'
    });
  }
});

// FAQ routes
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true });
    res.json({
      success: true,
      faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQs'
    });
  }
});

// Medicine reminder routes
router.post('/medicine-reminders', protect, async (req, res) => {
  try {
    const reminderData = {
      ...req.body,
      patient: req.user.id,
      createdBy: req.user.id
    };

    const reminder = new MedicineReminder(reminderData);
    reminder.nextReminderTime = reminder.getNextReminderTime();
    
    await reminder.save();

    res.json({
      success: true,
      reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create medicine reminder'
    });
  }
});

router.get('/medicine-reminders', protect, async (req, res) => {
  try {
    const reminders = await MedicineReminder.find({ 
      patient: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicine reminders'
    });
  }
});

router.put('/medicine-reminders/:id', protect, async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id },
      { ...req.body, nextReminderTime: new Date().getNextReminderTime() },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.json({
      success: true,
      reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update medicine reminder'
    });
  }
});

router.delete('/medicine-reminders/:id', protect, async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id },
      { isActive: false },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete medicine reminder'
    });
  }
});

// Voice menu endpoint
router.get('/voice-menu/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const menu = assistant.generateVoiceMenu(language);
    
    res.json({
      success: true,
      menu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate voice menu'
    });
  }
});

module.exports = router;
