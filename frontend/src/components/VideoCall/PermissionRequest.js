import React, { useState } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const PermissionRequest = ({ onPermissionGranted, onPermissionDenied, onRetry }) => {
  const [permissions, setPermissions] = useState({
    camera: null, // null, 'granted', 'denied', 'prompting'
    microphone: null
  });
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermissions = async () => {
    setIsRequesting(true);
    
    try {
      // Request camera permission
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissions(prev => ({ ...prev, camera: 'granted' }));
      cameraStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.warn('Camera permission denied:', error);
      setPermissions(prev => ({ ...prev, camera: 'denied' }));
    }

    try {
      // Request microphone permission
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissions(prev => ({ ...prev, microphone: 'granted' }));
      micStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.warn('Microphone permission denied:', error);
      setPermissions(prev => ({ ...prev, microphone: 'denied' }));
    }

    setIsRequesting(false);

    // Check if we have at least one permission
    const hasAnyPermission = permissions.camera === 'granted' || permissions.microphone === 'granted';
    
    if (hasAnyPermission) {
      onPermissionGranted();
    } else if (permissions.camera === 'denied' && permissions.microphone === 'denied') {
      onPermissionDenied();
    }
  };

  const getPermissionIcon = (type) => {
    const status = permissions[type];
    switch (status) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'denied':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return type === 'camera' ? <Video className="h-5 w-5 text-gray-400" /> : <Mic className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPermissionText = (type) => {
    const status = permissions[type];
    switch (status) {
      case 'granted':
        return `${type === 'camera' ? 'Camera' : 'Microphone'} permission granted`;
      case 'denied':
        return `${type === 'camera' ? 'Camera' : 'Microphone'} permission denied`;
      default:
        return `Request ${type === 'camera' ? 'camera' : 'microphone'} permission`;
    }
  };

  const canProceed = permissions.camera === 'granted' || permissions.microphone === 'granted';
  const allDenied = permissions.camera === 'denied' && permissions.microphone === 'denied';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Camera & Microphone Access
          </h2>
          <p className="text-gray-600">
            We need access to your camera and microphone for video consultations
          </p>
        </div>

        {/* Permission Status */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {getPermissionIcon('camera')}
            <span className="text-sm text-gray-700">{getPermissionText('camera')}</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {getPermissionIcon('microphone')}
            <span className="text-sm text-gray-700">{getPermissionText('microphone')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isRequesting && !allDenied && (
            <button
              onClick={requestPermissions}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Request Permissions</span>
            </button>
          )}

          {isRequesting && (
            <button
              disabled
              className="w-full bg-blue-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Requesting Permissions...</span>
            </button>
          )}

          {canProceed && (
            <button
              onClick={onPermissionGranted}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium"
            >
              Continue to Call
            </button>
          )}

          {allDenied && (
            <div className="space-y-3">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-700">
                    Both camera and microphone permissions were denied. You can still join with audio-only mode.
                  </span>
                </div>
              </div>
              
              <button
                onClick={onPermissionGranted}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium"
              >
                Continue with Audio Only
              </button>
            </div>
          )}

          <button
            onClick={onRetry}
            className="w-full text-gray-500 hover:text-gray-700 text-sm"
          >
            Try Again
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            If permissions are blocked, click the camera/microphone icon in your browser's address bar to allow access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionRequest;
