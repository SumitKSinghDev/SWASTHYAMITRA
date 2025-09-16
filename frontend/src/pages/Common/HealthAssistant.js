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
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // Ensure we have a valid language, fallback to 'en' if language is undefined
    return language && ['en', 'hi', 'pa'].includes(language) ? language : 'en';
  });
  
  // Debug language state
  console.log('Current selectedLanguage:', selectedLanguage);
  console.log('Redux language:', language);

  // Define commonSymptoms before useEffects
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

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [smsResponse, setSmsResponse] = useState('');
  const [currentMode, setCurrentMode] = useState('greeting'); // greeting, symptom_checker, faq, medicine_reminder
  const [voiceMenuActive, setVoiceMenuActive] = useState(false);
  const [medicineReminders, setMedicineReminders] = useState([]);
  
  // Triage state
  const [triageActive, setTriageActive] = useState(false);
  const [triageStep, setTriageStep] = useState(0);
  const [triageAnswers, setTriageAnswers] = useState({});
  
  // Question flow state
  const [questionFlow, setQuestionFlow] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isAskingQuestions, setIsAskingQuestions] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    try {
      if (newLanguage && ['en', 'hi', 'pa'].includes(newLanguage)) {
        setSelectedLanguage(newLanguage);
        dispatch(setLanguage(newLanguage));
      } else {
        console.warn('Invalid language selected:', newLanguage);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };


  // Initialize speech recognition and synthesis - only run once
  useEffect(() => {
    try {
    // Initialize speech recognition
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
          try {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
          } catch (error) {
            console.error('Error processing speech result:', error);
            setIsListening(false);
          }
      };

        recognitionRef.current.onerror = (error) => {
          console.error('Speech recognition error:', error);
        setIsListening(false);
      };
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
    }

    // Initialize speech synthesis
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Preload voices by triggering a silent utterance
      const preloadVoices = () => {
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        synthRef.current.speak(utterance);
        console.log('Voices preloaded:', synthRef.current.getVoices().length);
      };
      
      // Try to preload voices immediately
      preloadVoices();
      
      // Also listen for voices to be loaded
      const onVoicesChanged = () => {
        console.log('Voices loaded:', synthRef.current.getVoices().length);
        synthRef.current.removeEventListener('voiceschanged', onVoicesChanged);
      };
      synthRef.current.addEventListener('voiceschanged', onVoicesChanged);
      }
    } catch (error) {
      console.error('Error initializing speech synthesis:', error);
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

  // Start conversation when component mounts and dependencies are ready
  useEffect(() => {
    if (selectedLanguage && isAuthenticated !== undefined) {
      startConversation();
    }
  }, [selectedLanguage, isAuthenticated, user?._id]); // Add dependencies

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    try {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  };

  const startConversation = async () => {
    try {
      console.log('startConversation: Starting conversation...');
      
      // Safety check - ensure we have a valid language
      if (!selectedLanguage || !['en', 'hi', 'pa'].includes(selectedLanguage)) {
        console.log('startConversation: Invalid language, skipping');
        return;
      }
      
      // Show loading state briefly
      setIsLoading(true);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
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
        en: "Hello! I'm SymptoCare. To provide you with the most accurate help, I'll ask you some questions about your health concern first. What health issue would you like to discuss today?",
        hi: "नमस्ते! मैं लक्षण देखभाल हूं। आपको सबसे सटीक सहायता प्रदान करने के लिए, मैं पहले आपके स्वास्थ्य संबंधी चिंता के बारे में कुछ प्रश्न पूछूंगा। आज आप किस स्वास्थ्य समस्या पर चर्चा करना चाहते हैं?",
        pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਲੱਛਣ ਦੇਖਭਾਲ ਹਾਂ। ਮੈਂ ਇੱਥੇ ਤੁਹਾਡੇ ਸਿਹਤ ਸੰਬੰਧੀ ਸਵਾਲਾਂ, ਲੱਛਣ ਜਾਂਚ ਅਤੇ ਆਮ ਸਿਹਤ ਮਾਰਗਦਰਸ਼ਨ ਵਿੱਚ मदਦ लਈ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿൻਵੇਂ ਸਹਾਇਤਾ ਕਰ ਸਕਦਾ ਹਾਂ?"
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
        content: "Hello! I'm SymptoCare. I'm currently in offline mode but can still help with basic health guidance. How can I assist you?",
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
    } catch (error) {
      console.error('Error in startConversation:', error);
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

  // Translation functions using Google Translate API (free)
  const translateText = async (text, targetLang, sourceLang = 'auto') => {
    try {
      // Use Google Translate API (free tier)
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }
      return text; // Return original if translation fails
    } catch (error) {
      console.warn('Translation failed:', error);
      return text; // Return original if translation fails
    }
  };

  // Detect if text is in Hindi/Punjabi
  const detectLanguage = (text) => {
    // Simple detection based on character sets
    const hindiRegex = /[\u0900-\u097F]/;
    const punjabiRegex = /[\u0A00-\u0A7F]/;
    
    if (hindiRegex.test(text)) return 'hi';
    if (punjabiRegex.test(text)) return 'pa';
    return 'en';
  };

  // Improved Hindi responses for better context

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    // If triage is active, treat input as triage answer
    if (triageActive) {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      await processTriageAnswer(message);
      return;
    }

    // If we're in question flow, process the answer
    if (isAskingQuestions) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      await processQuestionAnswer(message);
      return;
    }

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
      // Detect health issue from user input
      const healthIssue = detectHealthIssue(message);
      
      if (healthIssue) {
        // Start question flow for the detected health issue
        startQuestionFlow(healthIssue);
        setIsLoading(false);
        return;
      }

      // Try API first if sessionId exists
      if (sessionId) {
    try {
      const response = await axios.post(`${API_BASE}/health-assistant/conversation/message`, {
        sessionId,
            message: message,
        language: selectedLanguage
      });

      if (response.data.success) {
            let responseText = response.data.message;
            
            // Translate response back to user's language if needed
            if (selectedLanguage !== 'en') {
              console.log('Translating response from English to', selectedLanguage);
              responseText = await translateText(response.data.message, selectedLanguage, 'en');
              console.log('Translated response:', responseText);
            }

        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
              content: responseText,
          timestamp: new Date(),
          requiresDoctor: response.data.requiresDoctor,
          emergency: response.data.emergency,
          nextSteps: response.data.nextSteps,
          smsResponse: response.data.smsResponse
        };

        setMessages(prev => [...prev, assistantMessage]);
        
            // Show SMS option if response available
            if (response.data.smsResponse && typeof response.data.smsResponse === 'string') {
          setSmsResponse(response.data.smsResponse);
          setShowSMSModal(true);
        }
        
        // Speak the response
            speakTextWithTTS(responseText);
            return;
          }
        } catch (apiError) {
          console.log('API not available:', apiError.message);
        }
      }
      
      // If no API or API fails, ask for more specific information
      const currentLanguage = selectedLanguage || 'en';
      const askForDetails = currentLanguage === 'hi' ? 
        'कृपया अपनी स्वास्थ्य समस्या के बारे में अधिक विस्तार से बताएं। मैं आपकी बेहतर सहायता कर सकूंगा।' :
        currentLanguage === 'pa' ?
        'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਸਿਹਤ ਸਮੱਸਿਆ ਬਾਰੇ ਵਧੇਰੇ ਵਿਸਤਾਰ ਨਾਲ ਦੱਸੋ। ਮੈਂ ਤੁਹਾਡੀ ਬਿਹਤਰ ਮਦਦ ਕਰ ਸਕਾਂਗਾ।' :
        'Please provide more details about your health concern. I can better assist you with more specific information.';
        
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: askForDetails,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      speakTextWithTTS(askForDetails);
      
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
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      speakTextWithTTS(fallbackResponse);
    } finally {
      setIsLoading(false);
    }
  };

  // Question flow system for better health assessment
  const initializeQuestionFlow = (healthIssue) => {
    const questions = {
      'fever': [
        { id: 'fever_duration', text: { en: 'How long have you had fever?', hi: 'आपको कितने दिन से बुखार है?', pa: 'ਤੁਹਾਨੂੰ ਕਿੰਨੇ ਦਿਨਾਂ ਤੋਂ ਬੁਖਾਰ ਹੈ?' } },
        { id: 'fever_temperature', text: { en: 'What is your current temperature?', hi: 'आपका वर्तमान तापमान क्या है?', pa: 'ਤੁਹਾਡਾ ਮੌਜੂਦਾ ਤਾਪਮਾਨ ਕੀ ਹੈ?' } },
        { id: 'fever_symptoms', text: { en: 'Do you have chills, sweating, or body aches?', hi: 'क्या आपको ठंड लग रही है, पसीना आ रहा है या शरीर में दर्द है?', pa: 'ਕੀ ਤੁਹਾਨੂੰ ਠੰਡ ਲਗ ਰਹੀ ਹੈ, ਪਸੀਨਾ ਆ ਰਿਹਾ ਹੈ ਜਾਂ ਸਰੀਰ ਵਿੱਚ ਦਰਦ ਹੈ?' } }
      ],
      'headache': [
        { id: 'headache_duration', text: { en: 'How long have you had this headache?', hi: 'आपको कितने समय से सिरदर्द है?', pa: 'ਤੁਹਾਨੂੰ ਕਿੰਨੇ ਸਮੇਂ ਤੋਂ ਸਿਰਦਰਦ ਹੈ?' } },
        { id: 'headache_severity', text: { en: 'On a scale of 1-10, how severe is the pain?', hi: '1-10 के पैमाने पर, दर्द कितना गंभीर है?', pa: '1-10 ਦੇ ਪੈਮਾਨੇ \'ਤੇ, ਦਰਦ ਕਿੰਨਾ ਗੰਭੀਰ ਹੈ?' } },
        { id: 'headache_type', text: { en: 'Is it a throbbing, stabbing, or pressure-like pain?', hi: 'क्या यह धड़कता हुआ, चुभता हुआ या दबाव जैसा दर्द है?', pa: 'ਕੀ ਇਹ ਧੜਕਦਾ, ਚੁਭਦਾ ਜਾਂ ਦਬਾਅ ਵਰਗਾ ਦਰਦ ਹੈ?' } }
      ],
      'cough': [
        { id: 'cough_duration', text: { en: 'How long have you had this cough?', hi: 'आपको कितने दिन से खांसी है?', pa: 'ਤੁਹਾਨੂੰ ਕਿੰਨੇ ਦਿਨਾਂ ਤੋਂ ਖੰਘ ਹੈ?' } },
        { id: 'cough_type', text: { en: 'Is it dry or productive (with phlegm)?', hi: 'क्या यह सूखी खांसी है या बलगम के साथ?', pa: 'ਕੀ ਇਹ ਸੁੱਕੀ ਖੰਘ ਹੈ ਜਾਂ ਬਲਗਮ ਨਾਲ?' } },
        { id: 'cough_triggers', text: { en: 'What makes it better or worse?', hi: 'क्या इसे बेहतर या बदतर बनाता है?', pa: 'ਕੀ ਇਸਨੂੰ ਬਿਹਤਰ ਜਾਂ ਬਦਤਰ ਬਣਾਉਂਦਾ ਹੈ?' } }
      ],
      'diabetes': [
        { id: 'diabetes_symptoms', text: { en: 'Do you have increased thirst, hunger, or frequent urination?', hi: 'क्या आपको अधिक प्यास, भूख या बार-बार पेशाब आ रहा है?', pa: 'ਕੀ ਤੁਹਾਨੂੰ ਵਧੇਰੇ ਪਿਆਸ, ਭੁੱਖ ਜਾਂ ਬਾਰ-ਬਾਰ ਪਿਸ਼ਾਬ ਆ ਰਿਹਾ ਹੈ?' } },
        { id: 'diabetes_family', text: { en: 'Is there a family history of diabetes?', hi: 'क्या परिवार में मधुमेह का इतिहास है?', pa: 'ਕੀ ਪਰਿਵਾਰ ਵਿੱਚ ਡਾਇਬੀਟੀਜ਼ ਦਾ ਇਤਿਹਾਸ ਹੈ?' } },
        { id: 'diabetes_medication', text: { en: 'Are you currently taking any diabetes medication?', hi: 'क्या आप वर्तमान में कोई मधुमेह की दवा ले रहे हैं?', pa: 'ਕੀ ਤੁਸੀਂ ਵਰਤਮਾਨ ਵਿੱਚ ਕੋਈ ਡਾਇਬੀਟੀਜ਼ ਦੀ ਦਵਾਈ ਲੈ ਰਹੇ ਹੋ?' } }
      ],
      'hypertension': [
        { id: 'bp_reading', text: { en: 'What is your current blood pressure reading?', hi: 'आपका वर्तमान रक्तचाप क्या है?', pa: 'ਤੁਹਾਡਾ ਵਰਤਮਾਨ ਰਕਤ ਚਾਪ ਕੀ ਹੈ?' } },
        { id: 'bp_symptoms', text: { en: 'Do you have dizziness, headaches, or chest pain?', hi: 'क्या आपको चक्कर, सिरदर्द या छाती में दर्द है?', pa: 'ਕੀ ਤੁਹਾਨੂੰ ਚਕਰ, ਸਿਰਦਰਦ ਜਾਂ ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਹੈ?' } },
        { id: 'bp_medication', text: { en: 'Are you taking any blood pressure medication?', hi: 'क्या आप कोई रक्तचाप की दवा ले रहे हैं?', pa: 'ਕੀ ਤੁਸੀਂ ਕੋਈ ਰਕਤ ਚਾਪ ਦੀ ਦਵਾਈ ਲੈ ਰਹੇ ਹੋ?' } }
      ],
      'asthma': [
        { id: 'asthma_triggers', text: { en: 'What triggers your breathing problems?', hi: 'आपकी सांस की समस्या क्या ट्रिगर करती है?', pa: 'ਤੁਹਾਡੀ ਸਾਹ ਦੀ ਸਮੱਸਿਆ ਕੀ ਟ੍ਰਿਗਰ ਕਰਦੀ ਹੈ?' } },
        { id: 'asthma_severity', text: { en: 'How severe is your breathing difficulty?', hi: 'आपकी सांस लेने में कितनी कठिनाई है?', pa: 'ਤੁਹਾਡੀ ਸਾਹ ਲੈਣ ਵਿੱਚ ਕਿੰਨੀ ਮੁਸ਼ਕਲ ਹੈ?' } },
        { id: 'asthma_medication', text: { en: 'Do you use an inhaler or any asthma medication?', hi: 'क्या आप इनहेलर या कोई दमा की दवा का उपयोग करते हैं?', pa: 'ਕੀ ਤੁਸੀਂ ਇਨਹੇਲਰ ਜਾਂ ਕੋਈ ਅਸਥਮਾ ਦੀ ਦਵਾਈ ਦਾ ਉਪਯੋਗ ਕਰਦੇ ਹੋ?' } }
      ],
      'arthritis': [
        { id: 'joint_location', text: { en: 'Which joints are affected?', hi: 'कौन से जोड़ प्रभावित हैं?', pa: 'ਕਿਹੜੇ ਜੋੜ ਪ੍ਰਭਾਵਿਤ ਹਨ?' } },
        { id: 'joint_severity', text: { en: 'How severe is the joint pain and stiffness?', hi: 'जोड़ों का दर्द और अकड़न कितनी गंभीर है?', pa: 'ਜੋੜਾਂ ਦਾ ਦਰਦ ਅਤੇ ਅਕੜਨ ਕਿੰਨੀ ਗੰਭੀਰ ਹੈ?' } },
        { id: 'arthritis_medication', text: { en: 'Are you taking any pain medication or anti-inflammatory drugs?', hi: 'क्या आप कोई दर्द की दवा या सूजनरोधी दवा ले रहे हैं?', pa: 'ਕੀ ਤੁਸੀਂ ਕੋਈ ਦਰਦ ਦੀ ਦਵਾਈ ਜਾਂ ਸੁਜਨ ਰੋਧੀ ਦਵਾਈ ਲੈ ਰਹੇ ਹੋ?' } }
      ],
      'depression': [
        { id: 'mood_duration', text: { en: 'How long have you been feeling this way?', hi: 'आपको कितने समय से ऐसा महसूस हो रहा है?', pa: 'ਤੁਹਾਨੂੰ ਕਿੰਨੇ ਸਮੇਂ ਤੋਂ ਇਸ ਤਰ੍ਹਾਂ ਮਹਿਸੂਸ ਹੋ ਰਿਹਾ ਹੈ?' } },
        { id: 'depression_symptoms', text: { en: 'Do you have changes in sleep, appetite, or energy levels?', hi: 'क्या आपकी नींद, भूख या ऊर्जा के स्तर में बदलाव आया है?', pa: 'ਕੀ ਤੁਹਾਡੀ ਨੀਂਦ, ਭੁੱਖ ਜਾਂ ਊਰਜਾ ਦੇ ਪੱਧਰ ਵਿੱਚ ਬਦਲਾਅ ਆਇਆ ਹੈ?' } },
        { id: 'depression_support', text: { en: 'Do you have thoughts of self-harm or suicide?', hi: 'क्या आपके मन में आत्महत्या या नुकसान पहुंचाने के विचार आते हैं?', pa: 'ਕੀ ਤੁਹਾਡੇ ਮਨ ਵਿੱਚ ਆਤਮਹੱਤਿਆ ਜਾਂ ਨੁਕਸਾਨ ਪਹੁੰਚਾਉਣ ਦੇ ਵਿਚਾਰ ਆਉਂਦੇ ਹਨ?' } }
      ],
      'skin_rash': [
        { id: 'rash_location', text: { en: 'Where is the rash located on your body?', hi: 'आपके शरीर पर चकत्ते कहां हैं?', pa: 'ਤੁਹਾਡੇ ਸਰੀਰ \'ਤੇ ਚਕਤੇ ਕਿੱਥੇ ਹਨ?' } },
        { id: 'rash_appearance', text: { en: 'Describe the rash - is it red, itchy, raised, or flat?', hi: 'चकत्ते का वर्णन करें - क्या यह लाल, खुजली वाला, उभरा हुआ या सपाट है?', pa: 'ਚਕਤੇ ਦਾ ਵਰਣਨ ਕਰੋ - ਕੀ ਇਹ ਲਾਲ, ਖੁਜਲੀ ਵਾਲਾ, ਉਭਰਿਆ ਹੋਇਆ ਜਾਂ ਸਪਾਟ ਹੈ?' } },
        { id: 'rash_duration', text: { en: 'How long have you had this rash?', hi: 'आपको कितने समय से यह चकत्ता है?', pa: 'ਤੁਹਾਨੂੰ ਕਿੰਨੇ ਸਮੇਂ ਤੋਂ ਇਹ ਚਕਤਾ ਹੈ?' } }
      ],
      'eye_problems': [
        { id: 'eye_symptoms', text: { en: 'What specific eye problems are you experiencing?', hi: 'आपको कौन सी विशिष्ट आंख की समस्या हो रही है?', pa: 'ਤੁਹਾਨੂੰ ਕਿਹੜੀ ਵਿਸ਼ੇਸ਼ ਅੱਖ ਦੀ ਸਮੱਸਿਆ ਹੋ ਰਹੀ ਹੈ?' } },
        { id: 'eye_duration', text: { en: 'How long have you had these eye problems?', hi: 'आपको कितने समय से ये आंख की समस्याएं हैं?', pa: 'ਤੁਹਾਨੂੰ ਕਿੰਨੇ ਸਮੇਂ ਤੋਂ ਇਹ ਅੱਖ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਹਨ?' } },
        { id: 'eye_vision', text: { en: 'Has your vision changed or become blurred?', hi: 'क्या आपकी दृष्टि बदली है या धुंधली हो गई है?', pa: 'ਕੀ ਤੁਹਾਡੀ ਦ੍ਰਿਸ਼ਟੀ ਬਦਲੀ ਹੈ ਜਾਂ ਧੁੰਦਲੀ ਹੋ ਗਈ ਹੈ?' } }
      ],
      'ear_problems': [
        { id: 'ear_symptoms', text: { en: 'What ear problems are you experiencing?', hi: 'आपको कौन सी कान की समस्या हो रही है?', pa: 'ਤੁਹਾਨੂੰ ਕਿਹੜੀ ਕੰਨ ਦੀ ਸਮੱਸਿਆ ਹੋ ਰਹੀ ਹੈ?' } },
        { id: 'ear_duration', text: { en: 'How long have you had these ear problems?', hi: 'आपको कितने समय से ये कान की समस्याएं हैं?', pa: 'ਤੁਹਾਨੂੰ ਕਿੰਨੇ ਸਮੇਂ ਤੋਂ ਇਹ ਕੰਨ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਹਨ?' } },
        { id: 'ear_hearing', text: { en: 'Have you noticed any hearing loss or changes?', hi: 'क्या आपने कोई सुनने की कमी या बदलाव नोटिस किया है?', pa: 'ਕੀ ਤੁਸੀਂ ਕੋਈ ਸੁਣਨ ਦੀ ਕਮੀ ਜਾਂ ਬਦਲਾਅ ਨੋਟਿਸ ਕੀਤਾ ਹੈ?' } }
      ],
      'back_pain': [
        { id: 'back_location', text: { en: 'Where exactly is your back pain located?', hi: 'आपका कमर दर्द बिल्कुल कहां है?', pa: 'ਤੁਹਾਡਾ ਕਮਰ ਦਰਦ ਬਿਲਕੁਲ ਕਿੱਥੇ ਹੈ?' } },
        { id: 'back_severity', text: { en: 'How severe is the back pain on a scale of 1-10?', hi: '1-10 के पैमाने पर कमर दर्द कितना गंभीर है?', pa: '1-10 ਦੇ ਪੈਮਾਨੇ \'ਤੇ ਕਮਰ ਦਰਦ ਕਿੰਨਾ ਗੰਭੀਰ ਹੈ?' } },
        { id: 'back_movement', text: { en: 'Does the pain worsen with movement or certain positions?', hi: 'क्या दर्द हिलने या कुछ स्थितियों में बढ़ता है?', pa: 'ਕੀ ਦਰਦ ਹਿਲਣ ਜਾਂ ਕੁਝ ਸਥਿਤੀਆਂ ਵਿੱਚ ਵਧਦਾ ਹੈ?' } }
      ],
      'chest_pain': [
        { id: 'chest_type', text: { en: 'What type of chest pain are you experiencing?', hi: 'आपको किस प्रकार का छाती दर्द हो रहा है?', pa: 'ਤੁਹਾਨੂੰ ਕਿਸ ਕਿਸਮ ਦਾ ਛਾਤੀ ਦਰਦ ਹੋ ਰਿਹਾ ਹੈ?' } },
        { id: 'chest_duration', text: { en: 'How long have you had this chest pain?', hi: 'आपको कितने समय से यह छाती दर्द है?', pa: 'ਤੁਹਾਨੂੰ ਕਿੰਨੇ ਸਮੇਂ ਤੋਂ ਇਹ ਛਾਤੀ ਦਰਦ ਹੈ?' } },
        { id: 'chest_activity', text: { en: 'Does the pain occur during rest or physical activity?', hi: 'क्या दर्द आराम के दौरान या शारीरिक गतिविधि के दौरान होता है?', pa: 'ਕੀ ਦਰਦ ਆਰਾਮ ਦੌਰਾਨ ਜਾਂ ਸਰੀਰਕ ਗਤੀਵਿਧੀ ਦੌਰਾਨ ਹੁੰਦਾ ਹੈ?' } }
      ],
      'urinary': [
        { id: 'urinary_symptoms', text: { en: 'What urinary symptoms are you experiencing?', hi: 'आपको कौन से मूत्र संबंधी लक्षण हो रहे हैं?', pa: 'ਤੁਹਾਨੂੰ ਕਿਹੜੇ ਮੂਤਰ ਸੰਬੰਧੀ ਲੱਛਣ ਹੋ ਰਹੇ ਹਨ?' } },
        { id: 'urinary_duration', text: { en: 'How long have you had these urinary problems?', hi: 'आपको कितने समय से ये मूत्र संबंधी समस्याएं हैं?', pa: 'ਤੁਹਾਨੂੰ ਕਿੰਨੇ ਸਮੇਂ ਤੋਂ ਇਹ ਮੂਤਰ ਸੰਬੰਧੀ ਸਮੱਸਿਆਵਾਂ ਹਨ?' } },
        { id: 'urinary_frequency', text: { en: 'How often do you need to urinate?', hi: 'आपको कितनी बार पेशाब करने की जरूरत पड़ती है?', pa: 'ਤੁਹਾਨੂੰ ਕਿੰਨੀ ਵਾਰ ਪਿਸ਼ਾਬ ਕਰਨ ਦੀ ਜ਼ਰੂਰਤ ਪੈਂਦੀ ਹੈ?' } }
      ]
    };
    
    return questions[healthIssue] || questions['fever']; // Default to fever questions
  };
  const detectHealthIssue = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced health issue keywords with more diseases
    const healthIssues = {
      'fever': ['fever', 'temperature', 'hot', 'burning', 'heat', 'pyrexia', 'hyperthermia', 'chills', 'sweating', 'sweat', 'बुखार', 'तापमान', 'गर्मी', 'ਬੁਖਾਰ', 'ਤਾਪਮਾਨ'],
      'headache': ['headache', 'head pain', 'head', 'migraine', 'tension', 'pressure', 'throbbing', 'pounding', 'ache', 'सिरदर्द', 'सिर', 'ਦਰਦ', 'ਸਿਰਦਰਦ'],
      'cough': ['cough', 'coughing', 'throat', 'sore throat', 'throat pain', 'hoarse', 'voice', 'phlegm', 'mucus', 'sputum', 'खांसी', 'गला', 'ਖੰਘ', 'ਗਲਾ'],
      'stomach': ['stomach', 'belly', 'abdomen', 'stomach pain', 'abdominal', 'cramps', 'cramping', 'nausea', 'vomiting', 'vomit', 'diarrhea', 'diarrhoea', 'constipation', 'bloating', 'gas', 'पेट', 'उदर', 'ਪੇਟ', 'ਉਦਰ'],
      'cold': ['cold', 'runny nose', 'nose', 'sneezing', 'sneeze', 'congestion', 'stuffy nose', 'nasal', 'sinus', 'sinusitis', 'flu', 'influenza', 'जुकाम', 'नाक', 'ਨੱਕ', 'ਜੁਕਾਮ'],
      'fatigue': ['tired', 'fatigue', 'weak', 'exhausted', 'exhaustion', 'lethargy', 'drowsy', 'sleepy', 'low energy', 'energy', 'weakness', 'dizzy', 'dizziness', 'थकान', 'कमजोरी', 'ਥਕਾਵਟ', 'ਕਮਜ਼ੋਰੀ'],
      'diabetes': ['diabetes', 'diabetic', 'blood sugar', 'glucose', 'insulin', 'sugar', 'urination', 'thirst', 'hunger', 'weight loss', 'मधुमेह', 'शुगर', 'ਡਾਇਬੀਟੀਜ਼', 'ਸ਼ੁਗਰ'],
      'hypertension': ['hypertension', 'high blood pressure', 'bp', 'pressure', 'dizziness', 'headache', 'chest pain', 'उच्च रक्तचाप', 'बीपी', 'ਉੱਚ ਰਕਤ ਚਾਪ', 'ਬੀਪੀ'],
      'asthma': ['asthma', 'breathing', 'wheezing', 'shortness of breath', 'chest tightness', 'cough', 'दमा', 'सांस', 'ਅਸਥਮਾ', 'ਸਾਹ'],
      'arthritis': ['arthritis', 'joint pain', 'joints', 'stiffness', 'swelling', 'rheumatoid', 'osteoarthritis', 'गठिया', 'जोड़', 'ਗਠੀਆ', 'ਜੋੜ'],
      'depression': ['depression', 'sad', 'mood', 'anxiety', 'stress', 'mental health', 'sleep', 'appetite', 'अवसाद', 'तनाव', 'ਡਿਪਰੈਸ਼ਨ', 'ਤਨਾਅ'],
      'skin_rash': ['rash', 'skin', 'itching', 'redness', 'bumps', 'allergy', 'dermatitis', 'चकत्ते', 'त्वचा', 'ਚਕਤੇ', 'ਚਮੜੀ'],
      'eye_problems': ['eye', 'vision', 'blurred', 'red eye', 'pain', 'irritation', 'आंख', 'दृष्टि', 'ਅੱਖ', 'ਦ੍ਰਿਸ਼ਟੀ'],
      'ear_problems': ['ear', 'hearing', 'earache', 'ear pain', 'tinnitus', 'कान', 'सुनाई', 'ਕੰਨ', 'ਸੁਣਾਈ'],
      'back_pain': ['back pain', 'spine', 'lumbar', 'muscle', 'stiffness', 'कमर दर्द', 'रीढ़', 'ਕਮਰ ਦਰਦ', 'ਰੀੜ੍ਹ'],
      'chest_pain': ['chest pain', 'heart', 'cardiac', 'angina', 'छाती दर्द', 'दिल', 'ਛਾਤੀ ਦਰਦ', 'ਦਿਲ'],
      'urinary': ['urinary', 'bladder', 'urination', 'burning', 'frequent', 'मूत्र', 'पेशाब', 'ਮੂਤਰ', 'ਪਿਸ਼ਾਬ']
    };
    
    for (const [issue, keywords] of Object.entries(healthIssues)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return issue;
      }
    }
    
    return null;
  };

  const processQuestionAnswer = async (answer) => {
    const currentQuestion = questionFlow[currentQuestionIndex];
    if (!currentQuestion) return;
    
    // Store the answer
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
    
    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < questionFlow.length) {
      // Ask next question
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questionFlow[nextIndex];
      const questionText = nextQuestion.text[selectedLanguage] || nextQuestion.text.en;
      
      const questionMessage = {
        id: Date.now(),
        type: 'assistant',
        content: questionText,
        timestamp: new Date(),
        isQuestion: true
      };
      
      setMessages(prev => [...prev, questionMessage]);
      speakTextWithTTS(questionText);
    } else {
      // All questions answered, provide assessment
      await provideAssessment();
    }
  };

  const provideAssessment = async () => {
    setIsAskingQuestions(false);
    
    // Try to get assessment from API
    if (sessionId) {
      try {
        const response = await axios.post(`${API_BASE}/health-assistant/assessment`, {
          sessionId,
          answers: userAnswers,
          language: selectedLanguage
        });
        
        if (response.data.success) {
          const assessmentMessage = {
            id: Date.now(),
            type: 'assistant',
            content: response.data.assessment,
            timestamp: new Date(),
            recommendations: response.data.recommendations,
            requiresDoctor: response.data.requiresDoctor,
            emergency: response.data.emergency
          };
          
          setMessages(prev => [...prev, assessmentMessage]);
          speakTextWithTTS(response.data.assessment);
          return;
        }
      } catch (apiError) {
        console.log('API not available for assessment:', apiError.message);
      }
    }
    
    // Fallback assessment based on answers
    const currentLanguage = selectedLanguage || 'en';
    const assessment = await generateBasicAssessment(userAnswers, currentLanguage);
    
    const assessmentMessage = {
      id: Date.now(),
      type: 'assistant',
      content: assessment,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assessmentMessage]);
    speakTextWithTTS(assessment);
  };

  // Comprehensive disease database with remedies and medicine suggestions
  const diseaseDatabase = {
    'fever': {
      name: { en: 'Fever', hi: 'बुखार', pa: 'ਬੁਖਾਰ' },
      remedies: {
        en: [
          'Take paracetamol (500mg) every 6 hours',
          'Stay hydrated - drink plenty of water',
          'Apply cool compress to forehead',
          'Get adequate rest',
          'Monitor temperature regularly'
        ],
        hi: [
          'पैरासिटामोल (500mg) हर 6 घंटे में लें',
          'हाइड्रेटेड रहें - खूब पानी पिएं',
          'माथे पर ठंडा सेक लगाएं',
          'पर्याप्त आराम करें',
          'तापमान की नियमित निगरानी करें'
        ],
        pa: [
          'ਪੈਰਾਸੀਟਾਮੋਲ (500mg) ਹਰ 6 ਘੰਟੇ ਵਿੱਚ ਲਓ',
          'ਹਾਈਡ੍ਰੇਟਿਡ ਰਹੋ - ਖੂਬ ਪਾਣੀ ਪੀਓ',
          'ਮੱਥੇ \'ਤੇ ਠੰਡਾ ਸੇਕ ਲਗਾਓ',
          'ਪਰਿਆਪਤ ਆਰਾਮ ਕਰੋ',
          'ਤਾਪਮਾਨ ਦੀ ਨਿਯਮਿਤ ਨਿਗਰਾਨੀ ਕਰੋ'
        ]
      },
      medicines: ['Paracetamol', 'Ibuprofen', 'Aspirin'],
      emergency: false,
      requiresDoctor: true
    },
    'diabetes': {
      name: { en: 'Diabetes', hi: 'मधुमेह', pa: 'ਡਾਇਬੀਟੀਜ਼' },
      remedies: {
        en: [
          'Monitor blood sugar levels regularly',
          'Follow a balanced diet with controlled carbohydrates',
          'Engage in regular physical activity',
          'Stay hydrated',
          'Take prescribed medication as directed'
        ],
        hi: [
          'रक्त शर्करा के स्तर की नियमित निगरानी करें',
          'नियंत्रित कार्बोहाइड्रेट के साथ संतुलित आहार लें',
          'नियमित शारीरिक गतिविधि करें',
          'हाइड्रेटेड रहें',
          'निर्धारित दवा निर्देशानुसार लें'
        ],
        pa: [
          'ਰਕਤ ਸ਼ਰਕਰਾ ਦੇ ਪੱਧਰ ਦੀ ਨਿਯਮਿਤ ਨਿਗਰਾਨੀ ਕਰੋ',
          'ਨਿਯੰਤ੍ਰਿਤ ਕਾਰਬੋਹਾਈਡਰੇਟ ਨਾਲ ਸੰਤੁਲਿਤ ਆਹਾਰ ਲਓ',
          'ਨਿਯਮਿਤ ਸਰੀਰਕ ਗਤੀਵਿਧੀ ਕਰੋ',
          'ਹਾਈਡ੍ਰੇਟਿਡ ਰਹੋ',
          'ਨਿਰਧਾਰਿਤ ਦਵਾਈ ਨਿਰਦੇਸ਼ਾਨੁਸਾਰ ਲਓ'
        ]
      },
      medicines: ['Metformin', 'Insulin', 'Glipizide', 'Gliclazide'],
      emergency: false,
      requiresDoctor: true
    },
    'hypertension': {
      name: { en: 'High Blood Pressure', hi: 'उच्च रक्तचाप', pa: 'ਉੱਚ ਰਕਤ ਚਾਪ' },
      remedies: {
        en: [
          'Reduce sodium intake',
          'Maintain a healthy weight',
          'Exercise regularly (30 minutes daily)',
          'Limit alcohol consumption',
          'Practice stress management techniques'
        ],
        hi: [
          'सोडियम का सेवन कम करें',
          'स्वस्थ वजन बनाए रखें',
          'नियमित व्यायाम करें (प्रतिदिन 30 मिनट)',
          'शराब का सेवन सीमित करें',
          'तनाव प्रबंधन तकनीकों का अभ्यास करें'
        ],
        pa: [
          'ਸੋਡੀਅਮ ਦਾ ਸੇਵਨ ਘਟਾਓ',
          'ਸਿਹਤਮੰਦ ਵਜਨ ਬਣਾਏ ਰੱਖੋ',
          'ਨਿਯਮਿਤ ਵਿਅਾਯਾਮ ਕਰੋ (ਰੋਜ਼ਾਨਾ 30 ਮਿੰਟ)',
          'ਸ਼ਰਾਬ ਦਾ ਸੇਵਨ ਸੀਮਿਤ ਕਰੋ',
          'ਤਨਾਅ ਪ੍ਰਬੰਧਨ ਤਕਨੀਕਾਂ ਦਾ ਅਭਿਆਸ ਕਰੋ'
        ]
      },
      medicines: ['Amlodipine', 'Losartan', 'Metoprolol', 'Hydrochlorothiazide'],
      emergency: false,
      requiresDoctor: true
    },
    'asthma': {
      name: { en: 'Asthma', hi: 'दमा', pa: 'ਅਸਥਮਾ' },
      remedies: {
        en: [
          'Use prescribed inhaler as directed',
          'Avoid known triggers (dust, pollen, smoke)',
          'Practice breathing exercises',
          'Keep rescue inhaler nearby',
          'Monitor symptoms regularly'
        ],
        hi: [
          'निर्धारित इनहेलर का उपयोग करें',
          'ज्ञात ट्रिगर्स से बचें (धूल, पराग, धुआं)',
          'श्वसन व्यायाम करें',
          'राहत इनहेलर पास रखें',
          'लक्षणों की नियमित निगरानी करें'
        ],
        pa: [
          'ਨਿਰਧਾਰਿਤ ਇਨਹੇਲਰ ਦਾ ਉਪਯੋਗ ਕਰੋ',
          'ਜਾਣੇ ਟ੍ਰਿਗਰਾਂ ਤੋਂ ਬਚੋ (ਧੂੜ, ਪਰਾਗ, ਧੂੰਆਂ)',
          'ਸਾਹ ਲੈਣ ਦੇ ਵਿਅਾਯਾਮ ਕਰੋ',
          'ਰਾਹਤ ਇਨਹੇਲਰ ਨੇੜੇ ਰੱਖੋ',
          'ਲੱਛਣਾਂ ਦੀ ਨਿਯਮਿਤ ਨਿਗਰਾਨੀ ਕਰੋ'
        ]
      },
      medicines: ['Salbutamol', 'Budesonide', 'Montelukast', 'Theophylline'],
      emergency: false,
      requiresDoctor: true
    },
    'arthritis': {
      name: { en: 'Arthritis', hi: 'गठिया', pa: 'ਗਠੀਆ' },
      remedies: {
        en: [
          'Apply heat or cold packs to affected joints',
          'Gentle stretching and range-of-motion exercises',
          'Maintain healthy weight',
          'Use assistive devices if needed',
          'Take prescribed anti-inflammatory medication'
        ],
        hi: [
          'प्रभावित जोड़ों पर गर्म या ठंडे पैक लगाएं',
          'कोमल स्ट्रेचिंग और गति की सीमा के व्यायाम',
          'स्वस्थ वजन बनाए रखें',
          'आवश्यकता हो तो सहायक उपकरणों का उपयोग करें',
          'निर्धारित सूजनरोधी दवा लें'
        ],
        pa: [
          'ਪ੍ਰਭਾਵਿਤ ਜੋੜਾਂ \'ਤੇ ਗਰਮ ਜਾਂ ਠੰਡੇ ਪੈਕ ਲਗਾਓ',
          'ਨਰਮ ਸਟ੍ਰੈਚਿੰਗ ਅਤੇ ਗਤੀ ਦੀ ਸੀਮਾ ਦੇ ਵਿਅਾਯਾਮ',
          'ਸਿਹਤਮੰਦ ਵਜਨ ਬਣਾਏ ਰੱਖੋ',
          'ਲੋੜ ਹੋਵੇ ਤਾਂ ਸਹਾਇਕ ਉਪਕਰਣਾਂ ਦਾ ਉਪਯੋਗ ਕਰੋ',
          'ਨਿਰਧਾਰਿਤ ਸੁਜਨ ਰੋਧੀ ਦਵਾਈ ਲਓ'
        ]
      },
      medicines: ['Ibuprofen', 'Naproxen', 'Methotrexate', 'Sulfasalazine'],
      emergency: false,
      requiresDoctor: true
    },
    'depression': {
      name: { en: 'Depression', hi: 'अवसाद', pa: 'ਡਿਪਰੈਸ਼ਨ' },
      remedies: {
        en: [
          'Maintain regular sleep schedule',
          'Engage in physical activity daily',
          'Practice mindfulness and meditation',
          'Stay connected with friends and family',
          'Seek professional counseling if needed'
        ],
        hi: [
          'नियमित नींद का कार्यक्रम बनाए रखें',
          'प्रतिदिन शारीरिक गतिविधि करें',
          'माइंडफुलनेस और ध्यान का अभ्यास करें',
          'दोस्तों और परिवार के साथ जुड़े रहें',
          'आवश्यकता हो तो पेशेवर परामर्श लें'
        ],
        pa: [
          'ਨਿਯਮਿਤ ਨੀਂਦ ਦਾ ਕਾਰਜਕ੍ਰਮ ਬਣਾਏ ਰੱਖੋ',
          'ਰੋਜ਼ਾਨਾ ਸਰੀਰਕ ਗਤੀਵਿਧੀ ਕਰੋ',
          'ਮਾਈਂਡਫੁਲਨੈਸ ਅਤੇ ਧਿਆਨ ਦਾ ਅਭਿਆਸ ਕਰੋ',
          'ਦੋਸਤਾਂ ਅਤੇ ਪਰਿਵਾਰ ਨਾਲ ਜੁੜੇ ਰਹੋ',
          'ਲੋੜ ਹੋਵੇ ਤਾਂ ਪੇਸ਼ੇਵਰ ਸਲਾਹ ਲਓ'
        ]
      },
      medicines: ['Sertraline', 'Fluoxetine', 'Amitriptyline', 'Citalopram'],
      emergency: false,
      requiresDoctor: true
    },
    'chest_pain': {
      name: { en: 'Chest Pain', hi: 'छाती दर्द', pa: 'ਛਾਤੀ ਦਰਦ' },
      remedies: {
        en: [
          'Seek immediate medical attention',
          'Stop any physical activity',
          'Sit in a comfortable position',
          'Take prescribed nitroglycerin if available',
          'Call emergency services if severe'
        ],
        hi: [
          'तुरंत चिकित्सा सहायता लें',
          'किसी भी शारीरिक गतिविधि बंद करें',
          'आरामदायक स्थिति में बैठें',
          'यदि उपलब्ध हो तो निर्धारित नाइट्रोग्लिसरीन लें',
          'यदि गंभीर हो तो आपातकालीन सेवाओं को कॉल करें'
        ],
        pa: [
          'ਤੁਰੰਤ ਚਿਕਿਤਸਾ ਸਹਾਇਤਾ ਲਓ',
          'ਕੋਈ ਵੀ ਸਰੀਰਕ ਗਤੀਵਿਧੀ ਬੰਦ ਕਰੋ',
          'ਆਰਾਮਦਾਇਕ ਸਥਿਤੀ ਵਿੱਚ ਬੈਠੋ',
          'ਜੇ ਉਪਲਬਧ ਹੋਵੇ ਤਾਂ ਨਿਰਧਾਰਿਤ ਨਾਈਟ੍ਰੋਗਲਿਸਰੀਨ ਲਓ',
          'ਜੇ ਗੰਭੀਰ ਹੋਵੇ ਤਾਂ ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨੂੰ ਕਾਲ ਕਰੋ'
        ]
      },
      medicines: ['Nitroglycerin', 'Aspirin', 'Atorvastatin'],
      emergency: true,
      requiresDoctor: true
    },
    'skin_rash': {
      name: { en: 'Skin Rash', hi: 'त्वचा पर चकत्ते', pa: 'ਚਮੜੀ \'ਤੇ ਚਕਤੇ' },
      remedies: {
        en: [
          'Keep the affected area clean and dry',
          'Apply calamine lotion or hydrocortisone cream',
          'Avoid scratching the affected area',
          'Wear loose, breathable clothing',
          'Identify and avoid potential allergens'
        ],
        hi: [
          'प्रभावित क्षेत्र को साफ और सूखा रखें',
          'कैलामाइन लोशन या हाइड्रोकार्टिसोन क्रीम लगाएं',
          'प्रभावित क्षेत्र को खरोंचने से बचें',
          'ढीले, हवादार कपड़े पहनें',
          'संभावित एलर्जेन की पहचान करें और उनसे बचें'
        ],
        pa: [
          'ਪ੍ਰਭਾਵਿਤ ਖੇਤਰ ਨੂੰ ਸਾਫ ਅਤੇ ਸੁੱਕਾ ਰੱਖੋ',
          'ਕੈਲਾਮਾਈਨ ਲੋਸ਼ਨ ਜਾਂ ਹਾਈਡ੍ਰੋਕਾਰਟੀਸੋਨ ਕਰੀਮ ਲਗਾਓ',
          'ਪ੍ਰਭਾਵਿਤ ਖੇਤਰ ਨੂੰ ਖੁਰਚਣ ਤੋਂ ਬਚੋ',
          'ਢਿੱਲੇ, ਹਵਾਦਾਰ ਕੱਪੜੇ ਪਹਿਨੋ',
          'ਸੰਭਾਵਿਤ ਐਲਰਜੀਨ ਦੀ ਪਛਾਣ ਕਰੋ ਅਤੇ ਉਨ੍ਹਾਂ ਤੋਂ ਬਚੋ'
        ]
      },
      medicines: ['Hydrocortisone', 'Calamine', 'Antihistamines', 'Topical Antibiotics'],
      emergency: false,
      requiresDoctor: true
    },
    'eye_problems': {
      name: { en: 'Eye Problems', hi: 'आंख की समस्याएं', pa: 'ਅੱਖ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ' },
      remedies: {
        en: [
          'Rest your eyes regularly (20-20-20 rule)',
          'Use artificial tears if eyes are dry',
          'Avoid rubbing your eyes',
          'Wear sunglasses in bright light',
          'Maintain good hygiene around eyes'
        ],
        hi: [
          'अपनी आंखों को नियमित रूप से आराम दें (20-20-20 नियम)',
          'यदि आंखें सूखी हैं तो कृत्रिम आंसू का उपयोग करें',
          'अपनी आंखों को रगड़ने से बचें',
          'तेज रोशनी में धूप के चश्मे पहनें',
          'आंखों के आसपास अच्छी स्वच्छता बनाए रखें'
        ],
        pa: [
          'ਆਪਣੀਆਂ ਅੱਖਾਂ ਨੂੰ ਨਿਯਮਿਤ ਰੂਪ ਵਿੱਚ ਆਰਾਮ ਦਿਓ (20-20-20 ਨਿਯਮ)',
          'ਜੇ ਅੱਖਾਂ ਸੁੱਕੀਆਂ ਹਨ ਤਾਂ ਕ੍ਰਿਤਰਿਮ ਅੱਥੂ ਦਾ ਉਪਯੋਗ ਕਰੋ',
          'ਆਪਣੀਆਂ ਅੱਖਾਂ ਨੂੰ ਰਗੜਨ ਤੋਂ ਬਚੋ',
          'ਤੇਜ ਰੋਸ਼ਨੀ ਵਿੱਚ ਧੁੱਪ ਦੇ ਚਸ਼ਮੇ ਪਹਿਨੋ',
          'ਅੱਖਾਂ ਦੇ ਆਸ-ਪਾਸ ਚੰਗੀ ਸਫਾਈ ਬਣਾਏ ਰੱਖੋ'
        ]
      },
      medicines: ['Artificial Tears', 'Antibiotic Eye Drops', 'Antihistamine Eye Drops'],
      emergency: false,
      requiresDoctor: true
    },
    'ear_problems': {
      name: { en: 'Ear Problems', hi: 'कान की समस्याएं', pa: 'ਕੰਨ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ' },
      remedies: {
        en: [
          'Keep ears dry and clean',
          'Use warm compresses for pain relief',
          'Avoid inserting objects into ears',
          'Use over-the-counter pain relievers',
          'Avoid loud noises'
        ],
        hi: [
          'कानों को सूखा और साफ रखें',
          'दर्द से राहत के लिए गर्म सेक का उपयोग करें',
          'कानों में कोई वस्तु डालने से बचें',
          'ओवर-द-काउंटर दर्द निवारक का उपयोग करें',
          'तेज आवाज से बचें'
        ],
        pa: [
          'ਕੰਨਾਂ ਨੂੰ ਸੁੱਕਾ ਅਤੇ ਸਾਫ ਰੱਖੋ',
          'ਦਰਦ ਤੋਂ ਰਾਹਤ ਲਈ ਗਰਮ ਸੇਕ ਦਾ ਉਪਯੋਗ ਕਰੋ',
          'ਕੰਨਾਂ ਵਿੱਚ ਕੋਈ ਵਸਤੂ ਪਾਉਣ ਤੋਂ ਬਚੋ',
          'ਓਵਰ-ਦ-ਕਾਉਂਟਰ ਦਰਦ ਨਿਵਾਰਕ ਦਾ ਉਪਯੋਗ ਕਰੋ',
          'ਤੇਜ ਆਵਾਜ਼ ਤੋਂ ਬਚੋ'
        ]
      },
      medicines: ['Ear Drops', 'Pain Relievers', 'Antibiotic Ear Drops'],
      emergency: false,
      requiresDoctor: true
    },
    'back_pain': {
      name: { en: 'Back Pain', hi: 'कमर दर्द', pa: 'ਕਮਰ ਦਰਦ' },
      remedies: {
        en: [
          'Apply heat or cold packs to affected area',
          'Practice gentle stretching exercises',
          'Maintain good posture',
          'Use ergonomic furniture',
          'Avoid heavy lifting'
        ],
        hi: [
          'प्रभावित क्षेत्र पर गर्म या ठंडे पैक लगाएं',
          'कोमल स्ट्रेचिंग व्यायाम करें',
          'अच्छी मुद्रा बनाए रखें',
          'एर्गोनोमिक फर्नीचर का उपयोग करें',
          'भारी वस्तुओं को उठाने से बचें'
        ],
        pa: [
          'ਪ੍ਰਭਾਵਿਤ ਖੇਤਰ \'ਤੇ ਗਰਮ ਜਾਂ ਠੰਡੇ ਪੈਕ ਲਗਾਓ',
          'ਨਰਮ ਸਟ੍ਰੈਚਿੰਗ ਵਿਅਾਯਾਮ ਕਰੋ',
          'ਚੰਗੀ ਮੁਦਰਾ ਬਣਾਏ ਰੱਖੋ',
          'ਐਰਗੋਨੋਮਿਕ ਫਰਨੀਚਰ ਦਾ ਉਪਯੋਗ ਕਰੋ',
          'ਭਾਰੀ ਵਸਤੂਆਂ ਨੂੰ ਚੁੱਕਣ ਤੋਂ ਬਚੋ'
        ]
      },
      medicines: ['Ibuprofen', 'Naproxen', 'Muscle Relaxants', 'Topical Pain Relief'],
      emergency: false,
      requiresDoctor: true
    },
    'urinary': {
      name: { en: 'Urinary Problems', hi: 'मूत्र संबंधी समस्याएं', pa: 'ਮੂਤਰ ਸੰਬੰਧੀ ਸਮੱਸਿਆਵਾਂ' },
      remedies: {
        en: [
          'Drink plenty of water',
          'Avoid caffeine and alcohol',
          'Practice good hygiene',
          'Empty bladder regularly',
          'Avoid holding urine for long periods'
        ],
        hi: [
          'खूब पानी पिएं',
          'कैफीन और शराब से बचें',
          'अच्छी स्वच्छता का अभ्यास करें',
          'मूत्राशय को नियमित रूप से खाली करें',
          'लंबे समय तक पेशाब रोकने से बचें'
        ],
        pa: [
          'ਖੂਬ ਪਾਣੀ ਪੀਓ',
          'ਕੈਫੀਨ ਅਤੇ ਸ਼ਰਾਬ ਤੋਂ ਬਚੋ',
          'ਚੰਗੀ ਸਫਾਈ ਦਾ ਅਭਿਆਸ ਕਰੋ',
          'ਮੂਤਰਾਸ਼ਯ ਨੂੰ ਨਿਯਮਿਤ ਰੂਪ ਵਿੱਚ ਖਾਲੀ ਕਰੋ',
          'ਲੰਬੇ ਸਮੇਂ ਤੱਕ ਪਿਸ਼ਾਬ ਰੋਕਣ ਤੋਂ ਬਚੋ'
        ]
      },
      medicines: ['Antibiotics', 'Pain Relievers', 'Urinary Antiseptics'],
      emergency: false,
      requiresDoctor: true
    },
    'cold': {
      name: { en: 'Common Cold', hi: 'सामान्य जुकाम', pa: 'ਆਮ ਜੁਕਾਮ' },
      remedies: {
        en: [
          'Get plenty of rest',
          'Stay hydrated with warm fluids',
          'Use saline nasal sprays',
          'Gargle with warm salt water',
          'Use a humidifier'
        ],
        hi: [
          'भरपूर आराम करें',
          'गर्म तरल पदार्थों से हाइड्रेटेड रहें',
          'सलाइन नाक स्प्रे का उपयोग करें',
          'गर्म नमक के पानी से गरारे करें',
          'ह्यूमिडिफायर का उपयोग करें'
        ],
        pa: [
          'ਭਰਪੂਰ ਆਰਾਮ ਕਰੋ',
          'ਗਰਮ ਤਰਲ ਪਦਾਰਥਾਂ ਨਾਲ ਹਾਈਡ੍ਰੇਟਿਡ ਰਹੋ',
          'ਸਲਾਈਨ ਨੱਕ ਸਪ੍ਰੇ ਦਾ ਉਪਯੋਗ ਕਰੋ',
          'ਗਰਮ ਨਮਕ ਦੇ ਪਾਣੀ ਨਾਲ ਗਰਾਰੇ ਕਰੋ',
          'ਹਿਊਮਿਡੀਫਾਇਰ ਦਾ ਉਪਯੋਗ ਕਰੋ'
        ]
      },
      medicines: ['Decongestants', 'Antihistamines', 'Cough Syrup', 'Vitamin C'],
      emergency: false,
      requiresDoctor: false
    },
    'fatigue': {
      name: { en: 'Fatigue', hi: 'थकान', pa: 'ਥਕਾਵਟ' },
      remedies: {
        en: [
          'Maintain regular sleep schedule',
          'Eat balanced meals regularly',
          'Stay physically active',
          'Manage stress levels',
          'Stay hydrated'
        ],
        hi: [
          'नियमित नींद का कार्यक्रम बनाए रखें',
          'नियमित रूप से संतुलित भोजन करें',
          'शारीरिक रूप से सक्रिय रहें',
          'तनाव के स्तर का प्रबंधन करें',
          'हाइड्रेटेड रहें'
        ],
        pa: [
          'ਨਿਯਮਿਤ ਨੀਂਦ ਦਾ ਕਾਰਜਕ੍ਰਮ ਬਣਾਏ ਰੱਖੋ',
          'ਨਿਯਮਿਤ ਰੂਪ ਵਿੱਚ ਸੰਤੁਲਿਤ ਭੋਜਨ ਕਰੋ',
          'ਸਰੀਰਕ ਰੂਪ ਵਿੱਚ ਸਰਗਰਮ ਰਹੋ',
          'ਤਨਾਅ ਦੇ ਪੱਧਰ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ',
          'ਹਾਈਡ੍ਰੇਟਿਡ ਰਹੋ'
        ]
      },
      medicines: ['Iron Supplements', 'B-Complex Vitamins', 'Energy Supplements'],
      emergency: false,
      requiresDoctor: true
    }
  };

  const getPreviousMedicines = async (disease) => {
    if (!isAuthenticated || !user?._id) return [];
    
    try {
      const response = await axios.get(`${API_BASE}/patient/medicines`, {
        params: { 
          patientId: user._id,
          condition: disease 
        }
      });
      return response.data?.medicines || [];
    } catch (error) {
      console.log('Error fetching previous medicines:', error);
      return [];
    }
  };

  const generateBasicAssessment = async (answers, language) => {
    // Determine the disease from the question flow
    const detectedDisease = questionFlow.length > 0 ? 
      Object.keys(diseaseDatabase).find(disease => 
        questionFlow[0].id.includes(disease)
      ) : 'fever';
    
    const disease = diseaseDatabase[detectedDisease] || diseaseDatabase['fever'];
    
    // Get previous medicines for this condition
    const previousMedicines = await getPreviousMedicines(detectedDisease);
    
    // Build assessment with remedies and medicine suggestions
    let assessment = `**${disease.name[language] || disease.name.en}**\n\n`;
    
    // Add remedies
    assessment += `**Quick Remedies:**\n`;
    disease.remedies[language]?.forEach((remedy, index) => {
      assessment += `${index + 1}. ${remedy}\n`;
    });
    
    // Add medicine suggestions
    if (disease.medicines.length > 0) {
      assessment += `\n**Suggested Medicines:**\n`;
      disease.medicines.forEach((medicine, index) => {
        assessment += `${index + 1}. ${medicine}\n`;
      });
    }
    
    // Add previous medicine suggestions if available
    if (previousMedicines.length > 0) {
      assessment += `\n**Previously Prescribed (Consult Doctor):**\n`;
      previousMedicines.forEach((medicine, index) => {
        assessment += `${index + 1}. ${medicine.name} (${medicine.dosage})\n`;
      });
    }
    
    // Add emergency/doctor recommendation
    if (disease.emergency) {
      assessment += `\n🚨 **EMERGENCY: Seek immediate medical attention!**`;
    } else if (disease.requiresDoctor) {
      assessment += `\n👨‍⚕️ **Consult a doctor for proper diagnosis and treatment.**`;
    }
    
    return assessment;
  };

  const startQuestionFlow = (healthIssue) => {
    const questions = initializeQuestionFlow(healthIssue);
    setQuestionFlow(questions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsAskingQuestions(true);
    
    // Ask the first question
    const firstQuestion = questions[0];
    const questionText = firstQuestion.text[selectedLanguage] || firstQuestion.text.en;
    
    const questionMessage = {
      id: Date.now(),
      type: 'assistant',
      content: questionText,
      timestamp: new Date(),
      isQuestion: true
    };
    
    setMessages(prev => [...prev, questionMessage]);
    speakTextWithTTS(questionText);
  };

  // Simple and reliable TTS service
  const speakTextWithTTS = (text) => {
    if (!synthRef.current || !text) {
      return;
    }

    // Stop any current speech
    synthRef.current.cancel();
    
    console.log('Speaking text:', text);
    console.log('Selected language:', selectedLanguage);
    
    // For Hindi and Punjabi, try Google TTS first, then fallback to browser
    if (selectedLanguage === 'hi' || selectedLanguage === 'pa') {
      tryGoogleTTS(text, selectedLanguage);
    } else {
      // For English, use browser TTS directly
      speakWithBrowserTTS(text);
    }
  };

  const tryGoogleTTS = async (text, language) => {
    try {
      console.log('Trying Google TTS for:', language);
      
      // Use Google Translate TTS API (free)
      const langCode = language === 'hi' ? 'hi' : 'pa';
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(text)}`;
      
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      
      audio.onloadstart = () => {
        console.log('Google TTS started');
      setIsSpeaking(true);
      };
      
      audio.onended = () => {
        console.log('Google TTS ended');
        setIsSpeaking(false);
      };
      
      audio.onerror = (error) => {
        console.log('Google TTS failed, falling back to browser TTS:', error);
        setIsSpeaking(false);
        speakWithBrowserTTS(text);
      };
      
      audio.src = ttsUrl;
      audio.play();
      
    } catch (error) {
      console.log('Google TTS error, falling back to browser TTS:', error);
      speakWithBrowserTTS(text);
    }
  };

  const speakWithBrowserTTS = (text) => {
      const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on selected language
    if (selectedLanguage === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (selectedLanguage === 'pa') {
      utterance.lang = 'pa-IN';
    } else {
      utterance.lang = 'en-US';
    }
    
    utterance.rate = 0.7; // Slower for better pronunciation
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a voice for the language
    const voices = synthRef.current.getVoices();
    console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
    
    let selectedVoice = null;
    
    if (selectedLanguage === 'hi') {
      // Try multiple Hindi voice options
      selectedVoice = voices.find(v => v.lang === 'hi-IN') ||
                     voices.find(v => v.lang.startsWith('hi')) ||
                     voices.find(v => v.name.toLowerCase().includes('hindi')) ||
                     voices.find(v => v.name.toLowerCase().includes('india')) ||
                     voices.find(v => v.name.toLowerCase().includes('indian'));
    } else if (selectedLanguage === 'pa') {
      // Try Punjabi, then Hindi as fallback
      selectedVoice = voices.find(v => v.lang === 'pa-IN') ||
                     voices.find(v => v.lang.startsWith('pa')) ||
                     voices.find(v => v.lang === 'hi-IN') ||
                     voices.find(v => v.lang.startsWith('hi'));
    } else {
      selectedVoice = voices.find(v => 
        v.lang === 'en-US' || 
        v.lang.startsWith('en')
      );
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
    } else {
      console.log('No suitable voice found, using default');
    }

    utterance.onstart = () => {
      console.log('Browser TTS started');
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      console.log('Browser TTS ended');
      setIsSpeaking(false);
    };
    
    utterance.onerror = (error) => {
      console.error('Browser TTS Error:', error);
      setIsSpeaking(false);
    };

      synthRef.current.speak(utterance);
  };






  // ElevenLabs TTS (Free tier)
  const tryElevenLabsTTS = async (text, language) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      // Map languages to ElevenLabs voice IDs
      const voiceMap = {
        'hi': 'pNInz6obpgDQGcFmaJgB', // Adam (multilingual)
        'pa': 'pNInz6obpgDQGcFmaJgB', // Adam (multilingual)
        'en': 'pNInz6obpgDQGcFmaJgB'  // Adam (multilingual)
      };

      const voiceId = voiceMap[language] || voiceMap['en'];
      
      // ElevenLabs API endpoint
      const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      
      const requestData = {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      };

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': 'sk-11labs-free-key' // This would be a real API key in production
        },
        body: JSON.stringify(requestData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        audio.src = audioUrl;
        
        audio.onloadstart = () => {
          setIsSpeaking(true);
          console.log('ElevenLabs TTS: Loading audio');
        };
        
        audio.oncanplay = () => {
          console.log('ElevenLabs TTS: Playing audio');
          audio.play();
        };
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.load();
      })
      .catch(error => {
        reject(error);
      });
    });
  };

  // Google Translate TTS (Updated working method)
  const tryGoogleTranslateTTS = async (text, language) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      // Use a working Google TTS endpoint
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=gtx&q=${encodeURIComponent(text)}`;
      
      audio.src = ttsUrl;
      audio.volume = 1.0;
      
      const timeout = setTimeout(() => {
        reject(new Error('Google TTS timeout'));
      }, 10000);
      
      audio.onloadstart = () => {
        setIsSpeaking(true);
        console.log('Google TTS: Loading audio');
      };
      
      audio.oncanplay = () => {
        console.log('Google TTS: Playing audio');
        audio.play();
      };
      
      audio.onended = () => {
        setIsSpeaking(false);
        clearTimeout(timeout);
        resolve();
      };
      
      audio.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
      
      audio.load();
    });
  };

  // Azure Cognitive Services TTS (Free tier)
  const tryAzureTTS = async (text, language) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      // Azure TTS endpoint (would need subscription key in production)
      const apiUrl = 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1';
      
      const voiceMap = {
        'hi': 'hi-IN-MadhurNeural',
        'pa': 'pa-IN-GurpreetNeural',
        'en': 'en-US-AriaNeural'
      };

      const voice = voiceMap[language] || voiceMap['en'];
      
      const ssml = `
        <speak version='1.0' xml:lang='${language}'>
          <voice xml:lang='${language}' name='${voice}'>
            ${text}
          </voice>
        </speak>
      `;

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': 'your-azure-key', // Would be real key in production
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: ssml
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Azure TTS error: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        audio.src = audioUrl;
        
        audio.onloadstart = () => {
          setIsSpeaking(true);
          console.log('Azure TTS: Loading audio');
        };
        
        audio.oncanplay = () => {
          console.log('Azure TTS: Playing audio');
          audio.play();
        };
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.load();
      })
      .catch(error => {
        reject(error);
      });
    });
  };

  // Amazon Polly TTS (Free tier)
  const tryAmazonPollyTTS = async (text, language) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      // Amazon Polly endpoint (would need AWS credentials in production)
      const apiUrl = 'https://polly.us-east-1.amazonaws.com/v1/speech';
      
      const voiceMap = {
        'hi': 'Aditi',
        'pa': 'Aditi', // Polly doesn't have Punjabi, use Hindi
        'en': 'Joanna'
      };

      const voice = voiceMap[language] || voiceMap['en'];
      
      const requestData = {
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: voice,
        LanguageCode: language === 'pa' ? 'hi-IN' : `${language}-IN`
      };

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'AWS4-HMAC-SHA256 your-aws-key' // Would be real AWS key in production
        },
        body: JSON.stringify(requestData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Amazon Polly error: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        audio.src = audioUrl;
        
        audio.onloadstart = () => {
          setIsSpeaking(true);
          console.log('Amazon Polly TTS: Loading audio');
        };
        
        audio.oncanplay = () => {
          console.log('Amazon Polly TTS: Playing audio');
          audio.play();
        };
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.load();
      })
      .catch(error => {
        reject(error);
      });
    });
  };

  // Simple browser TTS for Hindi/Punjabi
  const trySimpleBrowserTTS = async (text, language) => {
    return new Promise((resolve, reject) => {
      if (!synthRef.current) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Force language setting
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (language === 'pa') {
        utterance.lang = 'pa-IN';
      } else {
        utterance.lang = 'en-US';
      }
      
      utterance.rate = 0.6; // Slower for better pronunciation
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        setIsSpeaking(false);
        reject(new Error('TTS timeout'));
      }, 8000);

      // Don't try to select specific voice, let browser handle it
      utterance.onend = () => {
        clearTimeout(timeout);
        setIsSpeaking(false);
        console.log('Simple TTS: Speech completed');
        resolve();
      };
      
      utterance.onerror = (error) => {
        clearTimeout(timeout);
        setIsSpeaking(false);
        console.error('Simple TTS: Speech error:', error);
        reject(error);
      };

      console.log('Simple TTS: Speaking text:', text, 'with lang:', utterance.lang);
      setIsSpeaking(true);
      synthRef.current.speak(utterance);
    });
  };

  // Google Cloud TTS approach
  const tryGoogleCloudTTS = async (text, language) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      // Updated Google TTS URL format
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=gtx&q=${encodeURIComponent(text)}`;
      
      audio.src = ttsUrl;
      audio.volume = 1.0;
      
      const timeout = setTimeout(() => {
        reject(new Error('TTS timeout'));
      }, 10000);
      
      audio.onloadstart = () => {
        setIsSpeaking(true);
        console.log('Google TTS: Loading audio');
      };
      
      audio.oncanplay = () => {
        console.log('Google TTS: Playing audio');
        audio.play();
      };
      
      audio.onended = () => {
        setIsSpeaking(false);
        clearTimeout(timeout);
        resolve();
      };
      
      audio.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
      
      audio.load();
    });
  };

  // ResponsiveVoice approach (if available)
  const tryResponsiveVoice = async (text, language) => {
    return new Promise((resolve, reject) => {
      if (typeof window.responsiveVoice === 'undefined') {
        reject(new Error('ResponsiveVoice not available'));
        return;
      }
      
      const voiceMap = {
        'hi': 'Hindi Female',
        'pa': 'Punjabi Female',
        'en': 'US English Female'
      };
      
      const voice = voiceMap[language] || 'US English Female';
      
      setIsSpeaking(true);
      window.responsiveVoice.speak(text, voice, {
        onend: () => {
          setIsSpeaking(false);
          resolve();
        },
        onerror: (error) => {
          setIsSpeaking(false);
          reject(error);
        }
      });
    });
  };

  // Browser TTS with better voice selection
  const tryBrowserTTSWithVoiceSelection = async (text, language) => {
    return new Promise((resolve, reject) => {
      if (!synthRef.current) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      const langMap = {
        'hi': 'hi-IN',
        'pa': 'pa-IN',
        'en': 'en-US'
      };
      
      utterance.lang = langMap[language] || 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find the best voice
      const voices = synthRef.current.getVoices();
      let selectedVoice = null;

      if (language === 'hi') {
        selectedVoice = voices.find(v => 
          v.lang === 'hi-IN' || 
          v.lang.startsWith('hi') ||
          v.name.toLowerCase().includes('hindi')
        );
      } else if (language === 'pa') {
        selectedVoice = voices.find(v => 
          v.lang === 'pa-IN' || 
          v.lang.startsWith('pa') ||
          v.name.toLowerCase().includes('punjabi')
        ) || voices.find(v => v.lang.startsWith('hi')); // Fallback to Hindi
      } else {
        selectedVoice = voices.find(v => 
          v.lang === 'en-US' || 
          v.lang.startsWith('en')
        );
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      utterance.onerror = (error) => {
        setIsSpeaking(false);
        reject(error);
      };

      setIsSpeaking(true);
      synthRef.current.speak(utterance);
    });
  };

  // Fallback to browser TTS with forced language
  const fallbackToBrowserTTS = (text) => {
    if (synthRef.current && !isSpeaking && text) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      const currentLanguage = selectedLanguage || 'en';
      
      // Force language setting
      if (currentLanguage === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (currentLanguage === 'pa') {
        utterance.lang = 'pa-IN';
      } else {
        utterance.lang = 'en-US';
      }
      
      utterance.rate = 0.6; // Slower for better pronunciation
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find and set a voice
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        let voice = null;
        
        if (currentLanguage === 'hi') {
          voice = voices.find(v => v.lang.includes('hi')) || voices.find(v => v.name.includes('Hindi'));
        } else if (currentLanguage === 'pa') {
          voice = voices.find(v => v.lang.includes('pa')) || voices.find(v => v.lang.includes('hi')) || voices.find(v => v.name.includes('Hindi'));
        } else {
          voice = voices.find(v => v.lang.includes('en')) || voices.find(v => v.name.includes('English'));
        }
        
        if (voice) {
          utterance.voice = voice;
          console.log('Using voice:', voice.name, voice.lang);
        }
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('Fallback TTS completed');
      };
      
      utterance.onerror = (event) => {
        console.warn('Fallback TTS error:', event.error);
        setIsSpeaking(false);
      };
      
      console.log('Fallback TTS: Speaking', text, 'in language:', utterance.lang);
      synthRef.current.speak(utterance);
    }
  };

  const speakText = (text) => {
    speakTextWithTTS(text);
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
    console.log('=== VOICE MENU OPTION CLICKED ===');
    console.log('Option clicked:', option);
    console.log('Selected language:', selectedLanguage);
    
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
    console.log('Selected mode:', selectedMode);
    
    if (selectedMode) {
      setCurrentMode(selectedMode);
      
      const modeMessages = {
        symptom_checker: {
          en: "Please describe your symptoms. You can say things like fever, cough, headache, or stomach pain.",
          hi: "कृपया अपने लक्षण विस्तार से बताएं। आप बुखार, खांसी, सिरदर्द, पेट दर्द, या कोई अन्य समस्या बता सकते हैं। मैं आपकी मदद करूंगी।",
          pa: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣ ਵਿਸਤਾਰ ਨਾਲ ਦੱਸੋ। ਤੁਸੀਂ ਤਾਪ, ਖੰਘ, ਸਿਰ ਦਰਦ, ਪੇਟ ਦਰਦ, ਜਾਂ ਕੋਈ ਹੋਰ ਸਮਸਿਆ ਦੱਸ ਸਕਦੇ ਹੋ। ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰਾਂਗੀ।"
        },
        faq: {
          en: "What would you like to know? You can ask about hospital timings, health card, or medicine availability.",
          hi: "आप क्या जानना चाहते हैं? आप अस्पताल के समय, स्वास्थ्य कार्ड, दवा की उपलब्धता, या किसी अन्य जानकारी के बारे में पूछ सकते हैं।",
          pa: "ਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ? ਤੁਸੀਂ ਹਸਪਤਾਲ ਦੇ ਸਮੇਂ, ਸਿਹਤ ਕਾਰਡ, ਦਵਾਈ ਦੀ ਉਪਲਬਧਤਾ, ਜਾਂ ਕੋਈ ਹੋਰ ਜਾਣਕਾਰੀ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।"
        },
        medicine_reminder: {
          en: "Press 1 to set medicine reminder, Press 2 to check existing reminders, Press 3 to cancel reminder.",
          hi: "दवा की याददाश्त सेट करने के लिए एक दबाएं, मौजूदा याददाश्त देखने के लिए दो दबाएं, याददाश्त रद्द करने के लिए तीन दबाएं।",
          pa: "ਦਵਾਈ ਦੀ ਯਾਦ ਸੈੱਟ ਕਰਨ ਲਈ ਇੱਕ ਦਬਾਓ, ਮੌਜੂਦਾ ਯਾਦ ਦੇਖਣ ਲਈ ਦੋ ਦਬਾਓ, ਯਾਦ ਰੱਦ ਕਰਨ ਲਈ ਤਿੰਨ ਦਬਾਓ।"
        },
        operator: {
          en: "Connecting you to our operator. Please wait...",
          hi: "आपको हमारे ऑपरेटर से जोड़ रहे हैं। कृपया प्रतीक्षा करें। आपकी कॉल जल्दी कनेक्ट होगी।",
          pa: "ਤੁਹਾਨੂੰ ਸਾਡੇ ਓਪਰੇਟਰ ਨਾਲ ਜੋੜ ਰਹੇ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਇੰਤਜ਼ਾਰ ਕਰੋ। ਤੁਹਾਡੀ ਕਾਲ ਜਲਦੀ ਕਨੈਕਟ ਹੋਵੇਗੀ।"
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
      
      // Debug the voice menu option
      console.log('Voice menu option selected:', option, 'Mode:', selectedMode);
      console.log('Message to speak:', message);
      console.log('Selected language:', selectedLanguage);
      
      // Use the TTS for voice menu options
      speakTextWithTTS(message);

      // If symptom checker selected, begin triage
      if (selectedMode === 'symptom_checker' && !triageActive) {
        beginTriage();
      }
    } else {
      console.log('No mode found for option:', option, 'in language:', selectedLanguage);
      console.log('Available options for language:', menuOptions[selectedLanguage]);
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
        { id: 'nabha_card', text: 'NABHA ਕਾਰਡ ਕਿേਂ ਬਣਾਈਏ?', icon: '🆔' },
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

  // Triage questions (localized)
  const triageQuestions = {
    en: [
      { key: 'age', prompt: 'What is your age?' },
      { key: 'sex', prompt: 'What is your biological sex? (male/female)' },
      { key: 'chiefComplaint', prompt: 'What is your main symptom? (e.g., fever, cough, stomach pain)' },
      { key: 'duration', prompt: 'How long has this been going on? (e.g., hours/days)' },
      { key: 'redFlags', prompt: 'Any red flags: chest pain, severe breathlessness, fainting, bleeding, stiff neck with fever? (yes/no)' }
    ],
    hi: [
      { key: 'age', prompt: 'आपकी उम्र क्या है?' },
      { key: 'sex', prompt: 'आपका जैविक लिंग क्या है? (पुरुष/महिला)' },
      { key: 'chiefComplaint', prompt: 'आपका मुख्य लक्षण क्या है? (जैसे बुखार, खांसी, पेट दर्द)' },
      { key: 'duration', prompt: 'यह समस्या कब से है? (घंटे/दिन)' },
      { key: 'redFlags', prompt: 'क्या कोई गंभीर लक्षण है: छाती में दर्द, सांस लेने में तकलीफ, बेहोशी, खून बहना, गर्दन अकड़न के साथ बुखार? (हाँ/नहीं)' }
    ],
    pa: [
      { key: 'age', prompt: 'ਤੁਹਾਡੀ ਉਮਰ ਕੀ ਹੈ?' },
      { key: 'sex', prompt: 'ਤੁਹਾਡਾ ਜੈਵਿਕ ਲਿੰਗ ਕੀ ਹੈ? (ਪੁਰਸ਼/ਮਹਿਲਾ)' },
      { key: 'chiefComplaint', prompt: 'ਤੁਹਾਡਾ ਮੁੱਖ ਲੱਛਣ ਕੀ ਹੈ? (ਜਿਵੇਂ ਤਾਪ, ਖੰਘ, ਪੇਟ ਦਰਦ)' },
      { key: 'duration', prompt: 'ਇਹ ਸਮੱਸਿਆ ਕਦੋਂ ਤੋਂ ਹੈ? (ਘੰਟੇ/ਦਿਨ)' },
      { key: 'redFlags', prompt: 'ਕੀ ਕੋਈ ਗੰਭੀਰ ਲੱਛਣ ਹਨ: ਛਾਤੀ ਵਿੱਚ ਦਰਦ, ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ, ਬੇਹੋਸ਼ੀ, ਖੂਨਸਰਾਵ, ਗਰਦਨ ਅਕੜਨ ਨਾਲ ਤਾਪ? (ਹਾਂ/ਨਹੀਂ)' }
    ]
  };

  const getTriageList = () => triageQuestions[selectedLanguage] || triageQuestions.en;

  const computeSeverity = (answers) => {
    const red = (answers.redFlags || '').toString().toLowerCase();
    const ageNum = parseInt(answers.age, 10);
    const chief = (answers.chiefComplaint || '').toLowerCase();
    let emergency = false;
    let requiresDoctor = false;

    if (red.includes('yes') || red.includes('haan') || red.includes('हाँ') || red.includes('ha') ) {
      emergency = true;
    }
    if (Number.isFinite(ageNum) && (ageNum < 5 || ageNum > 65)) {
      requiresDoctor = true;
    }
    if (chief.includes('chest pain') || chief.includes('breath') || chief.includes('bleed')) {
      emergency = true;
    }

    return { emergency, requiresDoctor };
  };


  const fetchPatientHistory = async () => {
    if (!isAuthenticated || !user?._id) return null;
    try {
      const res = await axios.get(`${API_BASE}/patient/history`, { params: { patientId: user._id } });
      return res.data?.history || null;
    } catch (e) {
      return null; // fail silently
    }
  };

  const beginTriage = async () => {
    setTriageActive(true);
    setTriageStep(0);
    setTriageAnswers({});
    const q = getTriageList()[0];
    const msg = {
      id: Date.now() + 2,
      type: 'assistant',
      content: q.prompt,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, msg]);
    speakText(q.prompt);
  };

  const processTriageAnswer = async (userText) => {
    const list = getTriageList();
    const current = list[triageStep];
    const nextStep = triageStep + 1;
    const updated = { ...triageAnswers, [current.key]: userText };
    setTriageAnswers(updated);

    if (nextStep < list.length) {
      setTriageStep(nextStep);
      const nextQ = list[nextStep];
      const msg = {
        id: Date.now() + 3,
        type: 'assistant',
        content: nextQ.prompt,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, msg]);
      speakText(nextQ.prompt);
      return;
    }

    // Completed triage: compute severity, check history, give advice
    const severity = computeSeverity(updated);

    // Optional: use history to enrich advice (future: match cc to prior meds)
    const history = await fetchPatientHistory();
    let historyNote = '';
    if (history && Array.isArray(history) && history.length) {
      historyNote = selectedLanguage === 'hi'
        ? '\n\nपिछला रिकॉर्ड मिला: आपकी चिकित्सा इतिहास के आधार पर, पहले उपयोग की गई सलाह/दवा प्रभावी रही थी। कोई एलर्जी/गर्भावस्था/क्रोनिक रोग हो तो डॉक्टर से अवश्य परामर्श लें।'
        : selectedLanguage === 'pa'
        ? '\n\nਪਿਛਲਾ ਰਿਕਾਰਡ ਮਿਲਿਆ: ਤੁਹਾਡੇ ਇਤਿਹਾਸ ਦੇ ਆਧਾਰ ਤੇ, ਪਹਿਲਾਂ ਵਰਤੀ ਸਲਾਹ/ਦਵਾਈ ਲਾਭਕਾਰੀ ਰਹੀ ਸੀ। ਐਲਰਜੀ/ਗਰਭਾਵਸਥਾ/ਦੀਰਘ ਰੋਗ ਹੋਣ ਤੇ ਡਾਕਟਰ ਨਾਲ ਜ਼ਰੂਰ ਸਲਾਹ ਕਰੋ।'
        : '\n\nPrevious record found: A prior remedy/medicine worked for you. If allergies/pregnancy/chronic disease apply, consult a doctor first.';
    }

    // Generate basic advice based on severity
    const currentLanguage = selectedLanguage || 'en';
    let advice = '';
    
    if (severity.emergency) {
      advice = currentLanguage === 'hi' ? 
        '🚨 आपातकाल! तुरंत 108/एम्बुलेंस बुलाएं। निकटतम अस्पताल जाएं।' :
        currentLanguage === 'pa' ?
        '🚨 ਜ਼ਰੂਰੀ! ਤੁਰੰਤ 108/ਐਂਬੂਲੈਂਸ ਬੁਲਾਓ। ਨੇੜਲੇ ਹਸਪਤਾਲ ਜਾਓ।' :
        '🚨 EMERGENCY! Call 108/ambulance immediately. Go to nearest hospital.';
    } else if (severity.requiresDoctor) {
      advice = currentLanguage === 'hi' ? 
        'डॉक्टर से परामर्श करने की सलाह दी जाती है। लक्षणों की निगरानी करें।' :
        currentLanguage === 'pa' ?
        'ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਲੈਣ ਦੀ ਸਿਫਾਰਿਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਲੱਛਣਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।' :
        'Consultation with a doctor is recommended. Monitor your symptoms.';
    } else {
      advice = currentLanguage === 'hi' ? 
        'लक्षणों की निगरानी करें। यदि बिगड़ते हैं तो डॉक्टर से मिलें।' :
        currentLanguage === 'pa' ?
        'ਲੱਛਣਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ। ਜੇ ਬਿਗੜਦੇ ਹਨ ਤਾਂ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ।' :
        'Monitor your symptoms. See a doctor if they worsen.';
    }
    
    advice += historyNote;

    const resultMsg = {
      id: Date.now() + 4,
      type: 'assistant',
      content: advice,
      timestamp: new Date(),
      emergency: severity.emergency,
      requiresDoctor: severity.requiresDoctor && !severity.emergency,
      isOffline: true
    };
    setMessages(prev => [...prev, resultMsg]);
    speakText(advice);

    setTriageActive(false);
  };

  // Require login to use AI Assistant fully (hard redirect, return to health-assistant)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login', { replace: true, state: { redirectTo: '/health-assistant' } });
    }
  }, [isAuthenticated, navigate]);

  // Add error boundary for runtime errors
  try {
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
                <h1 className="text-xl font-bold text-gray-900">{t('ai_health_assistant')}</h1>
                <p className="text-sm text-gray-600">{t('health_companion')}</p>
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
                              onClick={() => {
                                console.log('Button 1 clicked!');
                                handleVoiceMenuOption('1');
                              }}
                              className="flex items-center space-x-2 p-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
                            >
                              <span className="font-bold">1</span>
                              <span>{(selectedLanguage || 'en') === 'hi' ? 'लक्षण जांच' :
                                     (selectedLanguage || 'en') === 'pa' ? 'ਲੱਛਣ ਜਾਂਚ' :
                                     'Symptom Checker'}</span>
                            </button>
                            <button
                              onClick={() => {
                                console.log('Button 2 clicked!');
                                handleVoiceMenuOption('2');
                              }}
                              className="flex items-center space-x-2 p-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-sm"
                            >
                              <span className="font-bold">2</span>
                              <span>{(selectedLanguage || 'en') === 'hi' ? 'FAQ' :
                                     (selectedLanguage || 'en') === 'pa' ? 'FAQ' :
                                     'FAQ'}</span>
                            </button>
                            <button
                              onClick={() => {
                                console.log('Button 3 clicked!');
                                handleVoiceMenuOption('3');
                              }}
                              className="flex items-center space-x-2 p-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 text-sm"
                            >
                              <span className="font-bold">3</span>
                              <span>{(selectedLanguage || 'en') === 'hi' ? 'दवा याददाश्त' :
                                     (selectedLanguage || 'en') === 'pa' ? 'ਦਵਾਈ ਯਾਦ' :
                                     'Medicine Reminder'}</span>
                            </button>
                            <button
                              onClick={() => {
                                console.log('Button 0 clicked!');
                                handleVoiceMenuOption('0');
                              }}
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
  } catch (error) {
    console.error('HealthAssistant component error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Please refresh the page to try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default HealthAssistant;


