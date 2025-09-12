import React, { useState } from 'react';
import { Video, Mic, AlertCircle, CheckCircle } from 'lucide-react';

const SimpleVideoTest = () => {
  const [permissions, setPermissions] = useState({
    camera: null,
    microphone: null
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testPermissions = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Test camera
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissions(prev => ({ ...prev, camera: 'granted' }));
      cameraStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.warn('Camera permission denied:', error);
      setPermissions(prev => ({ ...prev, camera: 'denied' }));
    }

    try {
      // Test microphone
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissions(prev => ({ ...prev, microphone: 'granted' }));
      micStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.warn('Microphone permission denied:', error);
      setPermissions(prev => ({ ...prev, microphone: 'denied' }));
    }

    setIsTesting(false);
    
    const hasAnyPermission = permissions.camera === 'granted' || permissions.microphone === 'granted';
    setTestResult(hasAnyPermission ? 'success' : 'failed');
  };

  const getStatusIcon = (type) => {
    const status = permissions[type];
    switch (status) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'denied':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusText = (type) => {
    const status = permissions[type];
    switch (status) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      default:
        return 'Not tested';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Simple Video Test
          </h1>
          <p className="text-gray-600">
            Test camera and microphone permissions for video calling
          </p>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="space-y-6">
              {/* Permission Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Permission Status</h3>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Video className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Camera</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon('camera')}
                    <span className="text-sm text-gray-600">{getStatusText('camera')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mic className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Microphone</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon('microphone')}
                    <span className="text-sm text-gray-600">{getStatusText('microphone')}</span>
                  </div>
                </div>
              </div>

              {/* Test Button */}
              <div className="text-center">
                <button
                  onClick={testPermissions}
                  disabled={isTesting}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    isTesting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isTesting ? 'Testing...' : 'Test Permissions'}
                </button>
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`p-4 rounded-lg ${
                  testResult === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {testResult === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`font-medium ${
                      testResult === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult === 'success' 
                        ? 'Permissions working! You can proceed with video calls.'
                        : 'Permissions denied. Please allow camera and microphone access.'
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>1. Click "Test Permissions" button</li>
                  <li>2. Allow camera and microphone when prompted</li>
                  <li>3. Check the status above</li>
                  <li>4. If denied, click the camera/mic icon in your browser's address bar</li>
                  <li>5. Try again after enabling permissions</li>
                </ul>
              </div>

              {/* Browser Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Browser Information:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                  <p><strong>HTTPS:</strong> {window.location.protocol === 'https:' ? 'Yes' : 'No'}</p>
                  <p><strong>Media Devices API:</strong> {navigator.mediaDevices ? 'Supported' : 'Not supported'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleVideoTest;
