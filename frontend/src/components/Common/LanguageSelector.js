import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { setLanguage } from '../../store/slices/uiSlice';

const LanguageSelector = ({ variant = 'default', showLabel = true }) => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.ui);
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { 
      code: 'english', 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸',
      direction: 'ltr'
    },
    { 
      code: 'hindi', 
      name: 'Hindi', 
      nativeName: 'हिंदी',
      flag: '🇮🇳',
      direction: 'ltr'
    },
    { 
      code: 'punjabi', 
      name: 'Punjabi', 
      nativeName: 'ਪੰਜਾਬੀ',
      flag: '🇮🇳',
      direction: 'ltr'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleLanguageChange = (selectedLanguage) => {
    dispatch(setLanguage(selectedLanguage.code));
    setIsOpen(false);
    
    // Update document direction if needed
    document.documentElement.setAttribute('dir', selectedLanguage.direction);
    document.documentElement.setAttribute('lang', selectedLanguage.code);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'home':
        return 'bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg';
      case 'navbar':
        return 'bg-white border border-gray-200 shadow-sm';
      case 'minimal':
        return 'bg-transparent border-none shadow-none';
      default:
        return 'bg-white border border-gray-200 shadow-sm';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 ${getVariantClasses()}`}
      >
        <Globe className="w-4 h-4 text-gray-600" />
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {currentLanguage.flag} {currentLanguage.nativeName}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                    language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{lang.flag}</span>
                    <div>
                      <div className="font-medium">{lang.nativeName}</div>
                      <div className="text-xs text-gray-500">{lang.name}</div>
                    </div>
                  </div>
                  {language === lang.code && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
