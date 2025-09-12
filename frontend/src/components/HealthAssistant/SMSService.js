import React, { useState } from 'react';
import { Phone, MessageSquare, Send, Copy, Check } from 'lucide-react';

const SMSService = ({ response, language, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleSendSMS = () => {
    if (phoneNumber) {
      const smsText = encodeURIComponent(response);
      const smsUrl = `sms:${phoneNumber}?body=${smsText}`;
      window.open(smsUrl);
    }
  };

  const getSMSInstructions = () => {
    const instructions = {
      english: {
        title: 'SMS Response (160 characters)',
        description: 'Copy this message to send via SMS or WhatsApp to share with family/doctor:',
        phonePlaceholder: 'Enter phone number',
        sendButton: 'Send SMS',
        copyButton: 'Copy Text'
      },
      hindi: {
        title: 'SMS प्रतिक्रिया (160 अक्षर)',
        description: 'इस संदेश को कॉपी करें और परिवार/डॉक्टर के साथ साझा करने के लिए SMS या WhatsApp से भेजें:',
        phonePlaceholder: 'फोन नंबर दर्ज करें',
        sendButton: 'SMS भेजें',
        copyButton: 'टेक्स्ट कॉपी करें'
      },
      punjabi: {
        title: 'SMS ਜਵਾਬ (160 ਅੱਖਰ)',
        description: 'ਇਸ ਸੁਨੇਹੇ ਨੂੰ ਕਾਪੀ ਕਰੋ ਅਤੇ ਪਰਿਵਾਰ/ਡਾਕਟਰ ਨਾਲ ਸਾਂਝਾ ਕਰਨ ਲਈ SMS ਜਾਂ WhatsApp ਰਾਹੀਂ ਭੇਜੋ:',
        phonePlaceholder: 'ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ',
        sendButton: 'SMS ਭੇਜੋ',
        copyButton: 'ਟੈਕਸਟ ਕਾਪੀ ਕਰੋ'
      }
    };
    return instructions[language] || instructions.english;
  };

  const instructions = getSMSInstructions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
            {instructions.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {instructions.description}
        </p>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-800 font-mono break-words">
            {response}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {response.length}/160 characters
            </span>
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : instructions.copyButton}</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={instructions.phonePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSendSMS}
              disabled={!phoneNumber.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <Send className="w-4 h-4" />
              <span>{instructions.sendButton}</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <Phone className="w-3 h-3 inline mr-1" />
            Emergency: Call 108 for ambulance
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSService;
