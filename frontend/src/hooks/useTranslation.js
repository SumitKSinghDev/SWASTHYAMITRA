import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

// Import translation files
import en from '../translations/en.json';
import hi from '../translations/hi.json';
import pa from '../translations/pa.json';

const translations = {
  english: en,
  hindi: hi,
  punjabi: pa,
};

export const useTranslation = () => {
  const { language } = useSelector((state) => state.ui);
  const [currentTranslations, setCurrentTranslations] = useState(translations[language] || en);

  useEffect(() => {
    setCurrentTranslations(translations[language] || en);
  }, [language]);
  
  const t = (key) => {
    const translation = currentTranslations[key];
    return translation || key;
  };
  
  return { t, language };
};
