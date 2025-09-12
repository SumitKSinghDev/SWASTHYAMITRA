import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { setLanguage } from '../../store/slices/uiSlice';
import axios from 'axios';
import SMSService from '../../components/HealthAssistant/SMSService';
import { 
  Mic, 
  MicOff, 
  Send, 
  MessageCircle, 
  Phone, 
  Calendar, 
  QrCode, 
  AlertTriangle,
  CheckCircle,
  Globe,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff
} from 'lucide-react';

const HealthAssistant = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { language } = useSelector((state) => state.ui);
  const { t } = useTranslation();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [smsResponse, setSmsResponse] = useState('');
  const [currentMode, setCurrentMode] = useState('greeting'); // greeting, symptom_checker, faq, medicine_reminder
  const [voiceMenuActive, setVoiceMenuActive] = useState(false);
  const [medicineReminders, setMedicineReminders] = useState([]);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
  ];

  // Sync language state with Redux
  useEffect(() => {
    if (language && language !== selectedLanguage) {
      setSelectedLanguage(language);
    }
  }, [language]); // Removed selectedLanguage from dependencies

  // Ensure selectedLanguage is always valid - only run once on mount
  useEffect(() => {
    if (!selectedLanguage || !commonSymptoms[selectedLanguage]) {
      setSelectedLanguage('en');
    }
  }, []); // Empty dependency array - only run on mount

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    dispatch(setLanguage(newLanguage));
  };

  const commonSymptoms = {
    en: [
      { id: 'fever', name: 'Fever', icon: '🌡️' },
      { id: 'cough', name: 'Cough', icon: '🤧' },
      { id: 'headache', name: 'Headache', icon: '🤕' },
      { id: 'stomach_pain', name: 'Stomach Pain', icon: '🤢' },
      { id: 'cold', name: 'Cold', icon: '😷' },
      { id: 'fatigue', name: 'Fatigue', icon: '😴' }
    ],
    hi: [
      { id: 'fever', name: 'बुखार', icon: '🌡️' },
      { id: 'cough', name: 'खांसी', icon: '🤧' },
      { id: 'headache', name: 'सिरदर्द', icon: '🤕' },
      { id: 'stomach_pain', name: 'पेट दर्द', icon: '🤢' },
      { id: 'cold', name: 'सर्दी', icon: '😷' },
      { id: 'fatigue', name: 'थकान', icon: '😴' }
    ],
    pa: [
      { id: 'fever', name: 'ਤਾਪ', icon: '🌡️' },
      { id: 'cough', name: 'ਖੰਘ', icon: '🤧' },
      { id: 'headache', name: 'ਸਿਰ ਦਰਦ', icon: '🤕' },
      { id: 'stomach_pain', name: 'ਪੇਟ ਦਰਦ', icon: '🤢' },
      { id: 'cold', name: 'ਜ਼ੁਕਾਮ', icon: '😷' },
      { id: 'fatigue', name: 'ਥਕਾਵਟ', icon: '😴' }
    ]
  };

  const offlineResponses = {
    en: {
      fever: "High fever? Take fever medicine, cool compress. See doctor if >103°F or persists >2 days.",
      cough: "Persistent cough? Drink warm fluids, avoid cold. See doctor if lasts >1 week.",
      headache: "Severe headache? Rest in dark room, avoid screens. See doctor if severe or sudden.",
      stomach_pain: "Stomach pain? Avoid spicy food, drink water. See doctor if severe or persistent.",
      cold: "Common cold? Rest, warm fluids, steam. See doctor if symptoms worsen or persist >1 week.",
      emergency: "EMERGENCY! Call ambulance immediately. Go to nearest hospital."
    },
    hi: {
      fever: "तेज बुखार? बुखार की दवा लें, ठंडा सेक। 103°F से अधिक या 2 दिन से अधिक रहने पर डॉक्टर से मिलें।",
      cough: "लगातार खांसी? गर्म तरल पिएं, ठंड से बचें। 1 सप्ताह से अधिक रहने पर डॉक्टर से मिलें।",
      headache: "गंभीर सिरदर्द? अंधेरे कमरे में आराम करें, स्क्रीन से बचें। गंभीर या अचानक होने पर डॉक्टर से मिलें।",
      stomach_pain: "पेट दर्द? मसालेदार भोजन से बचें, पानी पिएं। गंभीर या लगातार रहने पर डॉक्टर से मिलें।",
      cold: "सामान्य सर्दी? आराम करें, गर्म तरल पिएं, भाप लें। लक्षण बिगड़ने या 1 सप्ताह से अधिक रहने पर डॉक्टर से मिलें।",
      emergency: "आपातकाल! तुरंत एम्बुलेंस बुलाएं। निकटतम अस्पताल जाएं।"
    },
    pa: {
      fever: "ਤੇਜ਼ ਤਾਪ? ਤਾਪ ਦੀ ਦਵਾਈ ਲਓ, ਠੰਡਾ ਸੇਕ। 103°F ਤੋਂ ਵੱਧ ਜਾਂ 2 ਦਿਨ ਤੋਂ ਵੱਧ ਰਹਿਣ ਤੇ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ।",
      cough: "ਲਗਾਤਾਰ ਖੰਘ? ਗਰਮ ਤਰਲ ਪੀਓ, ਠੰਡ ਤੋਂ ਬਚੋ। 1 ਹਫ਼ਤੇ ਤੋਂ ਵੱਧ ਰਹਿਣ ਤੇ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ।",
      headache: "ਗੰਭੀਰ ਸਿਰ ਦਰਦ? ਹਨੇਰੇ ਕਮਰੇ ਵਿੱਚ ਆਰਾਮ ਕਰੋ, ਸਕ੍ਰੀਨ ਤੋਂ ਬਚੋ। ਗੰਭੀਰ ਜਾਂ ਅਚਾਨਕ ਹੋਣ ਤੇ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ।",
      stomach_pain: "ਪੇਟ ਦਰਦ? ਮਸਾਲੇਦਾਰ ਭੋਜਨ ਤੋਂ ਬਚੋ, ਪਾਣੀ ਪੀਓ। ਗੰਭੀਰ ਜਾਂ ਲਗਾਤਾਰ ਰਹਿਣ ਤੇ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ।",
      cold: "ਆਮ ਜ਼ੁਕਾਮ? ਆਰਾਮ ਕਰੋ, ਗਰਮ ਤਰਲ ਪੀਓ, ਭਾਪ ਲਓ। ਲੱਛਣ ਬਿਗੜਣ ਜਾਂ 1 ਹਫ਼ਤੇ ਤੋਂ ਵੱਧ ਰਹਿਣ ਤੇ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ।",
      emergency: "ਜ਼ਰੂਰੀ! ਤੁਰੰਤ ਐਂਬੂਲੈਂਸ ਬੁਲਾਓ। ਨੇੜਲੇ ਹਸਪਤਾਲ ਜਾਓ।"
    }
  };

  // Initialize speech recognition and synthesis - only run once
  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Empty dependency array - only run once

  // Update speech recognition language when selectedLanguage changes
  useEffect(() => {
    if (recognitionRef.current) {
      const currentLanguage = selectedLanguage || 'en';
      recognitionRef.current.lang = currentLanguage === 'hi' ? 'hi-IN' : 
                                   currentLanguage === 'pa' ? 'pa-IN' : 'en-US';
    }
  }, [selectedLanguage]);

  // Start conversation only once on mount
  useEffect(() => {
    startConversation();
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = async () => {
    // Prevent multiple simultaneous calls
    if (isLoading) {
      console.log('startConversation: Already loading, skipping...');
      return;
    }
    
    console.log('startConversation: Starting conversation...');
    try {
      setIsLoading(true);
      
      // Try to get welcome message from API
      try {
        const response = await axios.post(`${API_BASE}/health-assistant/conversation/start`, {
          language: selectedLanguage,
          userId: isAuthenticated ? user?._id : null
        });

        if (response.data.success) {
          setSessionId(response.data.sessionId);
          const initialMessage = {
            id: Date.now(),
            type: 'assistant',
            content: response.data.message,
            timestamp: new Date(),
            showVoiceMenu: true
          };
          console.log('startConversation: Setting initial message from API:', initialMessage);
          setMessages([initialMessage]);
          
          // Load medicine reminders if authenticated
          if (isAuthenticated) {
            await loadMedicineReminders();
          }
          return;
        }
      } catch (apiError) {
        console.log('API not available, using offline mode:', apiError.message);
      }
      
      // Fallback: Show welcome message even if API fails
      console.log('startConversation: Using fallback welcome message...');
      const welcomeMessages = {
        en: "Hello! I'm your AI Health Assistant. I'm here to help you with health-related questions, symptom checking, and general health guidance. How can I assist you today?",
        hi: "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूं। मैं यहां आपकी स्वास्थ्य संबंधी प्रश्नों, लक्षण जांच और सामान्य स्वास्थ्य मार्गदर्शन में मदद के लिए हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
        pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਸਿਹਤ ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਇੱਥੇ ਤੁਹਾਡੇ ਸਿਹਤ ਸੰਬੰਧੀ ਸਵਾਲਾਂ, ਲੱਛਣ ਜਾਂਚ ਅਤੇ ਆਮ ਸਿਹਤ ਮਾਰਗਦਰਸ਼ਨ ਵਿੱਚ ਮਦਦ ਲਈ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਸਹਾਇਤਾ ਕਰ ਸਕਦਾ ਹਾਂ?"
      };
      
      const initialMessage = {
        id: Date.now(),
        type: 'assistant',
        content: welcomeMessages[selectedLanguage] || welcomeMessages.en,
        timestamp: new Date(),
        showVoiceMenu: true,
        isOffline: true
      };
      console.log('startConversation: Setting fallback initial message:', initialMessage);
      setMessages([initialMessage]);
      
      // Load medicine reminders if authenticated
      if (isAuthenticated) {
        try {
          await loadMedicineReminders();
        } catch (error) {
          console.log('Could not load medicine reminders:', error.message);
        }
      }
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      // Even if everything fails, show a basic welcome message
      const fallbackMessage = {
        id: Date.now(),
        type: 'assistant',
        content: "Hello! I'm your AI Health Assistant. I'm currently in offline mode but can still help with basic health guidance. How can I assist you?",
        timestamp: new Date(),
        showVoiceMenu: true,
        isOffline: true
      };
      console.log('startConversation: Setting final fallback message:', fallbackMessage);
      setMessages([fallbackMessage]);
    } finally {
      console.log('startConversation: Finished, setting loading to false');
      setIsLoading(false);
    }
  };

  const loadMedicineReminders = async () => {
    try {
      const response = await axios.get(`${API_BASE}/health-assistant/medicine-reminders`);
      if (response.data.success) {
        setMedicineReminders(response.data.reminders);
      }
    } catch (error) {
      console.error('Error loading medicine reminders:', error);
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return; // Prevent multiple simultaneous calls

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Try API first if sessionId exists
      if (sessionId) {
        try {
          const response = await axios.post(`${API_BASE}/health-assistant/conversation/message`, {
            sessionId,
            message,
            language: selectedLanguage
          });

          if (response.data.success) {
            const assistantMessage = {
              id: Date.now() + 1,
              type: 'assistant',
              content: response.data.message,
              timestamp: new Date(),
              requiresDoctor: response.data.requiresDoctor,
              emergency: response.data.emergency,
              nextSteps: response.data.nextSteps,
              smsResponse: response.data.smsResponse
            };

            setMessages(prev => [...prev, assistantMessage]);
            
            // Show SMS option if offline response available
            if (response.data.smsResponse) {
              setSmsResponse(response.data.smsResponse);
              setShowSMSModal(true);
            }
            
            // Speak the response
            speakText(response.data.message);
            return;
          }
        } catch (apiError) {
          console.log('API not available, using offline response:', apiError.message);
        }
      }
      
      // Fallback to offline response
      const offlineResponse = getOfflineResponse(message);
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: offlineResponse,
        timestamp: new Date(),
        isOffline: true
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Show SMS option for offline response
      setSmsResponse(offlineResponse);
      setShowSMSModal(true);
      
      speakText(offlineResponse);
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Final fallback response
      const currentLanguage = selectedLanguage || 'en';
      const fallbackResponse = currentLanguage === 'hi' ? 
        'मुझे खेद है, मैं आपकी सहायता नहीं कर सकता। कृपया बाद में पुनः प्रयास करें।' :
        currentLanguage === 'pa' ?
        'ਮੈਨੂੰ ਅਫ਼ਸੋਸ ਹੈ, ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਨਹੀਂ ਕਰ ਸਕਦਾ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।' :
        'I apologize, I cannot help you right now. Please try again later.';
        
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: fallbackResponse,
        timestamp: new Date(),
        isOffline: true
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getOfflineResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    const currentLanguage = selectedLanguage || 'en';
    
    // Check for emergency keywords
    const emergencyKeywords = ['emergency', 'serious', 'urgent', 'ambulance', 'hospital', 'गंभीर', 'जरूरी', 'ਗੰਭੀਰ', 'ਜ਼ਰੂਰੀ'];
    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return offlineResponses[currentLanguage]?.emergency || offlineResponses.en.emergency;
    }

    // Check for common symptoms
    for (const [symptom, response] of Object.entries(offlineResponses[currentLanguage] || offlineResponses.en)) {
      if (symptom !== 'emergency' && lowerMessage.includes(symptom)) {
        return response;
      }
    }

    return currentLanguage === 'hi' ? 
      'कृपया अपने लक्षणों का विस्तार से वर्णन करें। गंभीर लक्षणों के लिए तुरंत डॉक्टर से सलाह लें।' :
      currentLanguage === 'pa' ?
      'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਿਸਤਾਰ ਨਾਲ ਵਰਣਨ ਕਰੋ। ਗੰਭੀਰ ਲੱਛਣਾਂ ਲਈ ਤੁਰੰਤ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਲਓ।' :
      'Please describe your symptoms in detail. For serious symptoms, consult a doctor immediately.';
  };

  const speakText = (text) => {
    if (synthRef.current && !isSpeaking && text) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language with better fallback support
      const getVoiceLanguage = () => {
        const currentLanguage = selectedLanguage || 'en';
        switch (currentLanguage) {
          case 'hi':
            return 'hi-IN'; // Hindi (India)
          case 'pa':
            return 'pa-IN'; // Punjabi (India) - fallback to Hindi if not available
          case 'en':
          default:
            return 'en-US'; // English (US)
        }
      };

      utterance.lang = getVoiceLanguage();
      
      // Set voice properties for better pronunciation
      utterance.rate = 0.9; // Slightly slower for better understanding
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find a voice that matches the language
      const voices = synthRef.current.getVoices();
      const currentLanguage = selectedLanguage || 'en';
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(currentLanguage === 'hi' ? 'hi' : 
                             currentLanguage === 'pa' ? 'hi' : 'en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };
      
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSymptomClick = (symptom) => {
    setInputMessage(symptom.name);
    sendMessage(symptom.name);
  };

  const handleVoiceMenuOption = (option) => {
    const menuOptions = {
      en: {
        '1': 'symptom_checker',
        '2': 'faq',
        '3': 'medicine_reminder',
        '0': 'operator'
      },
      hi: {
        '1': 'symptom_checker',
        '2': 'faq', 
        '3': 'medicine_reminder',
        '0': 'operator'
      },
      pa: {
        '1': 'symptom_checker',
        '2': 'faq',
        '3': 'medicine_reminder',
        '0': 'operator'
      }
    };

    const selectedMode = menuOptions[selectedLanguage]?.[option];
    if (selectedMode) {
      setCurrentMode(selectedMode);
      
      const modeMessages = {
        symptom_checker: {
          en: "Please describe your symptoms. You can say things like fever, cough, headache, or stomach pain.",
          hi: "कृपया अपने लक्षण बताएं। आप बुखार, खांसी, सिरदर्द, या पेट दर्द जैसी चीजें कह सकते हैं।",
          pa: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ। ਤੁਸੀਂ ਤਾਪ, ਖੰਘ, ਸਿਰ ਦਰਦ, ਜਾਂ ਪੇਟ ਦਰਦ ਵਰਗੀਆਂ ਚੀਜ਼ਾਂ ਕਹਿ ਸਕਦੇ ਹੋ।"
        },
        faq: {
          en: "What would you like to know? You can ask about hospital timings, NABHA card, or medicine availability.",
          hi: "आप क्या जानना चाहते हैं? आप अस्पताल के समय, NABHA कार्ड, या दवा की उपलब्धता के बारे में पूछ सकते हैं।",
          pa: "ਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ? ਤੁਸੀਂ ਹਸਪਤਾਲ ਦੇ ਸਮੇਂ, NABHA ਕਾਰਡ, ਜਾਂ ਦਵਾਈ ਦੀ ਉਪਲਬਧਤਾ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।"
        },
        medicine_reminder: {
          en: "Press 1 to set medicine reminder, Press 2 to check existing reminders, Press 3 to cancel reminder.",
          hi: "दवा याददाश्त सेट करने के लिए 1 दबाएं, मौजूदा याददाश्त जांचने के लिए 2 दबाएं, याददाश्त रद्द करने के लिए 3 दबाएं।",
          pa: "ਦਵਾਈ ਯਾਦ ਸੈੱਟ ਕਰਨ ਲਈ 1 ਦਬਾਓ, ਮੌਜੂਦਾ ਯਾਦ ਜਾਂਚਣ ਲਈ 2 ਦਬਾਓ, ਯਾਦ ਰੱਦ ਕਰਨ ਲਈ 3 ਦਬਾਓ।"
        },
        operator: {
          en: "Connecting you to our operator. Please wait...",
          hi: "आपको हमारे ऑपरेटर से जोड़ रहे हैं। कृपया प्रतीक्षा करें...",
          pa: "ਤੁਹਾਨੂੰ ਸਾਡੇ ਓਪਰੇਟਰ ਨਾਲ ਜੋੜ ਰਹੇ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਇੰਤਜ਼ਾਰ ਕਰੋ..."
        }
      };

      const message = modeMessages[selectedMode]?.[selectedLanguage] || modeMessages[selectedMode]?.en;
      const assistantMessage = {
        id: Date.now(),
        type: 'assistant',
        content: message,
        timestamp: new Date(),
        mode: selectedMode
      };

      setMessages(prev => [...prev, assistantMessage]);
      speakText(message);
    }
  };

  const getCommonFAQQuestions = () => {
    const questions = {
      en: [
        { id: 'hospital_timing', text: 'What are the hospital timings?', icon: '🕒' },
        { id: 'nabha_card', text: 'How to create NABHA card?', icon: '🆔' },
        { id: 'medicine_availability', text: 'Is medicine available?', icon: '💊' }
      ],
      hi: [
        { id: 'hospital_timing', text: 'अस्पताल के समय क्या हैं?', icon: '🕒' },
        { id: 'nabha_card', text: 'NABHA कार्ड कैसे बनाएं?', icon: '🆔' },
        { id: 'medicine_availability', text: 'दवा उपलब्ध है?', icon: '💊' }
      ],
      pa: [
        { id: 'hospital_timing', text: 'ਹਸਪਤਾਲ ਦੇ ਸਮੇਂ ਕੀ ਹਨ?', icon: '🕒' },
        { id: 'nabha_card', text: 'NABHA ਕਾਰਡ ਕਿਵੇਂ ਬਣਾਈਏ?', icon: '🆔' },
        { id: 'medicine_availability', text: 'ਦਵਾਈ ਉਪਲਬਧ ਹੈ?', icon: '💊' }
      ]
    };
    return questions[selectedLanguage] || questions.en;
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'book_doctor':
        if (isAuthenticated) {
          navigate('/patient/appointments/book');
        } else {
          navigate('/auth/login');
        }
        break;
      case 'nabha_card':
        if (isAuthenticated) {
          navigate('/patient/nabha-card');
        } else {
          navigate('/auth/login');
        }
        break;
      case 'vaccines':
        navigate('/vaccines');
        break;
      case 'tutorials':
        navigate('/tutorials');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Health Assistant</h1>
                <p className="text-sm text-gray-600">Your 24/7 health companion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              
              {/* Online Status */}
              <div className="flex items-center space-x-1">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-gray-600">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border h-96 overflow-y-auto">
              <div className="p-4 space-y-4">
                {isLoading && messages.length === 0 && (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-center">
                      <div className="loading-spinner mx-auto mb-4"></div>
                      <p className="text-gray-600">
                        {(selectedLanguage || 'en') === 'hi' ? 'AI सहायक को शुरू कर रहे हैं...' :
                         (selectedLanguage || 'en') === 'pa' ? 'AI ਸਹਾਇਕ ਨੂੰ ਸ਼ੁਰੂ ਕਰ ਰਹੇ ਹਾਂ...' :
                         'Starting AI Assistant...'}
                      </p>
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.emergency
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : message.requiresDoctor
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.emergency && (
                        <div className="flex items-center mt-2 text-xs">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Emergency - Call ambulance immediately
                        </div>
                      )}
                      {message.requiresDoctor && !message.emergency && (
                        <div className="flex items-center mt-2 text-xs">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Please consult a doctor
                        </div>
                      )}
                      {message.isOffline && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <WifiOff className="w-4 h-4 mr-1" />
                          Offline response
                        </div>
                      )}
                      {message.showVoiceMenu && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-600 mb-2">
                            {(selectedLanguage || 'en') === 'hi' ? 'वॉइस मेन्यू के लिए नंबर दबाएं:' :
                             (selectedLanguage || 'en') === 'pa' ? 'ਵੌਇਸ ਮੇਨੂ ਲਈ ਨੰਬਰ ਦਬਾਓ:' :
                             'Press number for voice menu:'}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleVoiceMenuOption('1')}
                              className="flex items-center space-x-2 p-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
                            >
                              <span className="font-bold">1</span>
                              <span>{(selectedLanguage || 'en') === 'hi' ? 'लक्षण जांच' :
                                     (selectedLanguage || 'en') === 'pa' ? 'ਲੱਛਣ ਜਾਂਚ' :
                                     'Symptom Checker'}</span>
                            </button>
                            <button
                              onClick={() => handleVoiceMenuOption('2')}
                              className="flex items-center space-x-2 p-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-sm"
                            >
                              <span className="font-bold">2</span>
                              <span>{(selectedLanguage || 'en') === 'hi' ? 'FAQ' :
                                     (selectedLanguage || 'en') === 'pa' ? 'FAQ' :
                                     'FAQ'}</span>
                            </button>
                            <button
                              onClick={() => handleVoiceMenuOption('3')}
                              className="flex items-center space-x-2 p-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 text-sm"
                            >
                              <span className="font-bold">3</span>
                              <span>{(selectedLanguage || 'en') === 'hi' ? 'दवा याददाश्त' :
                                     (selectedLanguage || 'en') === 'pa' ? 'ਦਵਾਈ ਯਾਦ' :
                                     'Medicine Reminder'}</span>
                            </button>
                            <button
                              onClick={() => handleVoiceMenuOption('0')}
                              className="flex items-center space-x-2 p-2 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 text-sm"
                            >
                              <span className="font-bold">0</span>
                              <span>{(selectedLanguage || 'en') === 'hi' ? 'ऑपरेटर' :
                                     (selectedLanguage || 'en') === 'pa' ? 'ਓਪਰੇਟਰ' :
                                     'Operator'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="mt-4 flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={
                    (selectedLanguage || 'en') === 'hi' ? 'अपने लक्षण बताएं...' :
                    (selectedLanguage || 'en') === 'pa' ? 'ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ...' :
                    'Describe your symptoms...'
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              
              <button
                onClick={startListening}
                disabled={isListening || !recognitionRef.current}
                className={`p-2 rounded-lg ${
                  isListening 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => speakText(messages[messages.length - 1]?.content || '')}
                disabled={!messages.length || isSpeaking}
                className={`p-2 rounded-lg ${
                  isSpeaking 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Common Symptoms */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                {(selectedLanguage || 'en') === 'hi' ? 'सामान्य लक्षण' :
                 (selectedLanguage || 'en') === 'pa' ? 'ਆਮ ਲੱਛਣ' :
                 'Common Symptoms'}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(commonSymptoms[selectedLanguage] || commonSymptoms.en).map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => handleSymptomClick(symptom)}
                    className="flex items-center space-x-2 p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span className="text-lg">{symptom.icon}</span>
                    <span className="text-sm text-gray-700">{symptom.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Questions */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                {selectedLanguage === 'hindi' ? 'सामान्य प्रश्न' :
                 selectedLanguage === 'punjabi' ? 'ਆਮ ਸਵਾਲ' :
                 'Common Questions'}
              </h3>
              <div className="space-y-2">
                {getCommonFAQQuestions().map((question) => (
                  <button
                    key={question.id}
                    onClick={() => sendMessage(question.text)}
                    className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span className="text-lg">{question.icon}</span>
                    <span className="text-sm text-gray-700">{question.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                {selectedLanguage === 'hindi' ? 'त्वरित कार्य' :
                 selectedLanguage === 'punjabi' ? 'ਤੇਜ਼ ਕਾਰਵਾਈ' :
                 'Quick Actions'}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickAction('book_doctor')}
                  className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    {selectedLanguage === 'hindi' ? 'डॉक्टर बुक करें' :
                     selectedLanguage === 'punjabi' ? 'ਡਾਕਟਰ ਬੁਕ ਕਰੋ' :
                     'Book Doctor'}
                  </span>
                </button>
                
                <button
                  onClick={() => handleQuickAction('nabha_card')}
                  className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <QrCode className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">
                    {selectedLanguage === 'hindi' ? 'NABHA कार्ड' :
                     selectedLanguage === 'punjabi' ? 'NABHA ਕਾਰਡ' :
                     'NABHA Card'}
                  </span>
                </button>
                
                <button
                  onClick={() => handleQuickAction('vaccines')}
                  className="w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Phone className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">
                    {selectedLanguage === 'hindi' ? 'टीकाकरण' :
                     selectedLanguage === 'punjabi' ? 'ਟੀਕਾਕਰਣ' :
                     'Vaccines'}
                  </span>
                </button>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {selectedLanguage === 'hindi' ? 'आपातकालीन' :
                 selectedLanguage === 'punjabi' ? 'ਜ਼ਰੂਰੀ' :
                 'Emergency'}
              </h3>
              <p className="text-sm text-red-700 mb-2">
                {selectedLanguage === 'hindi' ? 'गंभीर लक्षणों के लिए तुरंत कॉल करें' :
                 selectedLanguage === 'punjabi' ? 'ਗੰਭੀਰ ਲੱਛਣਾਂ ਲਈ ਤੁਰੰਤ ਕਾਲ ਕਰੋ' :
                 'Call immediately for serious symptoms'}
              </p>
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700">
                {selectedLanguage === 'hindi' ? '108 - एम्बुलेंस' :
                 selectedLanguage === 'punjabi' ? '108 - ਐਂਬੂਲੈਂਸ' :
                 '108 - Ambulance'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Modal */}
      {showSMSModal && (
        <SMSService
          response={smsResponse}
          language={selectedLanguage}
          onClose={() => setShowSMSModal(false)}
        />
      )}
    </div>
  );
};

export default HealthAssistant;


