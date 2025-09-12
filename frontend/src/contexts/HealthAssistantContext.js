import React, { createContext, useContext, useState, useCallback } from 'react';

const HealthAssistantContext = createContext();

export const useHealthAssistant = () => {
  const context = useContext(HealthAssistantContext);
  if (!context) {
    throw new Error('useHealthAssistant must be used within a HealthAssistantProvider');
  }
  return context;
};

export const HealthAssistantProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [healthData, setHealthData] = useState({
    symptoms: [],
    conditions: [],
    medications: [],
    allergies: []
  });

  const startConversation = useCallback(() => {
    setIsActive(true);
    setConversation([{
      id: 1,
      type: 'assistant',
      message: 'Hello! I\'m your health assistant. How can I help you today?',
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const endConversation = useCallback(() => {
    setIsActive(false);
    setConversation([]);
    setIsTyping(false);
    setSuggestions([]);
  }, []);

  const sendMessage = useCallback(async (message) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message,
      timestamp: new Date().toISOString()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        message: 'I understand your concern. Let me help you with that...',
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  }, []);

  const addSymptom = useCallback((symptom) => {
    setHealthData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, symptom]
    }));
  }, []);

  const removeSymptom = useCallback((symptomId) => {
    setHealthData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s.id !== symptomId)
    }));
  }, []);

  const addCondition = useCallback((condition) => {
    setHealthData(prev => ({
      ...prev,
      conditions: [...prev.conditions, condition]
    }));
  }, []);

  const addMedication = useCallback((medication) => {
    setHealthData(prev => ({
      ...prev,
      medications: [...prev.medications, medication]
    }));
  }, []);

  const addAllergy = useCallback((allergy) => {
    setHealthData(prev => ({
      ...prev,
      allergies: [...prev.allergies, allergy]
    }));
  }, []);

  const clearHealthData = useCallback(() => {
    setHealthData({
      symptoms: [],
      conditions: [],
      medications: [],
      allergies: []
    });
  }, []);

  const value = {
    isActive,
    conversation,
    isTyping,
    suggestions,
    healthData,
    startConversation,
    endConversation,
    sendMessage,
    addSymptom,
    removeSymptom,
    addCondition,
    addMedication,
    addAllergy,
    clearHealthData
  };

  return (
    <HealthAssistantContext.Provider value={value}>
      {children}
    </HealthAssistantContext.Provider>
  );
};
