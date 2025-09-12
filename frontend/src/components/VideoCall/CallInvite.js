import React, { useState } from 'react';
import { Copy, Share2, QrCode, Users, Clock, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

const CallInvite = ({ 
  channelId, 
  callType = 'video', 
  participants = [], 
  onJoinCall,
  onCancel 
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const callUrl = `${window.location.origin}/call/${channelId}`;
  const qrData = JSON.stringify({
    channelId,
    callType,
    url: callUrl,
    timestamp: Date.now()
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(callUrl);
    setCopied(true);
    toast.success('Call link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Video Consultation',
          text: 'Join my video consultation',
          url: callUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleJoinCall = () => {
    if (onJoinCall) {
      onJoinCall();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {callType === 'video' ? 'Video Consultation' : 'Audio Call'}
        </h2>
        <p className="text-gray-600">
          Share this link with participants to join the call
        </p>
      </div>

      {/* Channel Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Channel ID:</span>
          <span className="text-sm font-mono text-gray-900">{channelId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Call Type:</span>
          <span className="text-sm text-gray-900 capitalize">{callType}</span>
        </div>
      </div>

      {/* Participants */}
      {participants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Participants:</h3>
          <div className="space-y-2">
            {participants.map((participant, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-900">{participant.name || participant.role}</span>
                <span className="text-xs text-gray-500">({participant.role})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call Link */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Call Link:
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={callUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={handleCopyLink}
            className={`p-2 rounded-md ${
              copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Copy link"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* QR Code */}
      <div className="mb-6">
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
        >
          <QrCode className="h-4 w-4" />
          <span>{showQR ? 'Hide' : 'Show'} QR Code</span>
        </button>
        
        {showQR && (
          <div className="mt-3 text-center">
            <div className="w-32 h-32 bg-white border border-gray-300 rounded-lg flex items-center justify-center mx-auto">
              {/* In a real app, you'd use a QR code library here */}
              <div className="text-xs text-gray-500">QR Code</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Scan to join the call
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
        
        <button
          onClick={handleJoinCall}
          className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          <Phone className="h-4 w-4" />
          <span>Join Now</span>
        </button>
      </div>

      {/* Cancel Button */}
      <button
        onClick={onCancel}
        className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm"
      >
        Cancel
      </button>
    </div>
  );
};

export default CallInvite;
