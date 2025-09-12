import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import videoCallService from '../../services/videoCallService';
import CallControls from './CallControls';
import NetworkQualityIndicator from './NetworkQualityIndicator';
import PermissionRequest from './PermissionRequest';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

const VideoCall = ({ 
  channel, 
  token, 
  onCallEnd, 
  onUserJoined, 
  onUserLeft,
  isGroupCall = false,
  showControls = true 
}) => {
  const { user } = useSelector((state) => state.auth);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [networkQuality, setNetworkQuality] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  
  const localVideoRef = useRef(null);
  const callStartTime = useRef(null);
  const durationInterval = useRef(null);

  // Agora App ID from environment variables
  const AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID || '52f10392fa8c472ca61e8c32c08dfd2e';

  useEffect(() => {
    // Check permissions first
    checkPermissions();
    
    return () => {
      cleanup();
    };
  }, []);

  // Check if we have permissions
  const checkPermissions = async () => {
    try {
      // Try to get media devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');

      if (!hasCamera && !hasMicrophone) {
        setShowPermissionRequest(true);
        return;
      }

      // Try to request permissions
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // If successful, proceed with call
      initializeCall();
    } catch (error) {
      console.log('Permission check failed:', error);
      setShowPermissionRequest(true);
    }
  };

  // Initialize call
  const initializeCall = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Set up callbacks
      videoCallService.setCallbacks({
        onUserJoined: handleUserJoined,
        onUserLeft: handleUserLeft,
        onUserPublished: handleUserPublished,
        onUserUnpublished: handleUserUnpublished,
        onError: handleError,
        onNetworkQuality: handleNetworkQuality
      });

      // Obtain dynamic RTC token from backend, then join
      const uid = videoCallService.generateUid(user);
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      let tokenToUse = null;
      try {
        const tokenResp = await fetch(`${apiBase}/video-calls/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelName: channel, uid, role: 'publisher', expireSeconds: 3600 })
        });
        const tokenJson = await tokenResp.json();
        if (tokenJson?.success && tokenJson?.token) {
          tokenToUse = tokenJson.token;
        } else {
          console.warn('RTC token unavailable, proceeding without token (dev/test mode).', tokenJson?.message);
        }
      } catch (e) {
        console.warn('RTC token fetch failed, proceeding without token (dev/test mode).', e?.message);
      }

      // Try to join with video first, fallback to audio-only if needed
      try {
        await videoCallService.joinChannel(
          AGORA_APP_ID,
          channel,
          tokenToUse,
          uid
        );
      } catch (permissionError) {
        if (permissionError.message.includes('Permission denied')) {
          // Try audio-only mode
          console.log('Video permission denied, trying audio-only mode...');
          await videoCallService.joinChannel(
            AGORA_APP_ID,
            channel,
            tokenToUse,
            uid
          );
          setIsAudioOnly(true);
          toast.warning('Video permission denied. Continuing with audio-only mode.');
        } else {
          throw permissionError;
        }
      }

      setIsJoined(true);
      callStartTime.current = Date.now();
      startDurationTimer();
      toast.success('Successfully joined the call');
      
    } catch (error) {
      console.error('Failed to join call:', error);
      if (error.message.includes('Permission denied')) {
        setError('Camera and microphone access is required for video calls. Please allow permissions and try again.');
      } else {
        setError(error.message || 'Failed to join call');
      }
      toast.error('Failed to join call');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user joined
  const handleUserJoined = (user) => {
    setRemoteUsers(prev => [...prev, user]);
    if (onUserJoined) {
      onUserJoined(user);
    }
    toast.info(`${user.uid} joined the call`);
  };

  // Handle user left
  const handleUserLeft = (user) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    if (onUserLeft) {
      onUserLeft(user);
    }
    toast.info(`${user.uid} left the call`);
  };

  // Handle user published media
  const handleUserPublished = (user, mediaType) => {
    console.log('User published:', user, mediaType);
  };

  // Handle user unpublished media
  const handleUserUnpublished = (user, mediaType) => {
    console.log('User unpublished:', user, mediaType);
  };

  // Handle error
  const handleError = (error) => {
    console.error('Call error:', error);
    setError(error.message || 'Call error occurred');
    toast.error('Call error occurred');
  };

  // Handle network quality
  const handleNetworkQuality = (stats) => {
    setNetworkQuality(stats);
  };

  // Start duration timer
  const startDurationTimer = () => {
    durationInterval.current = setInterval(() => {
      if (callStartTime.current) {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }
    }, 1000);
  };

  // Stop duration timer
  const stopDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  // Toggle microphone
  const toggleMicrophone = async () => {
    try {
      const enabled = await videoCallService.toggleMicrophone();
      setIsMuted(!enabled);
      toast.info(enabled ? 'Microphone unmuted' : 'Microphone muted');
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  // Toggle camera
  const toggleCamera = async () => {
    try {
      const enabled = await videoCallService.toggleCamera();
      setIsVideoOff(!enabled);
      toast.info(enabled ? 'Camera turned on' : 'Camera turned off');
    } catch (error) {
      console.error('Failed to toggle camera:', error);
      toast.error('Failed to toggle camera');
    }
  };

  // Switch to audio-only mode
  const switchToAudioOnly = async () => {
    try {
      await videoCallService.switchToAudioOnly();
      setIsAudioOnly(true);
      toast.info('Switched to audio-only mode');
    } catch (error) {
      console.error('Failed to switch to audio-only:', error);
      toast.error('Failed to switch to audio-only');
    }
  };

  // Switch to video mode
  const switchToVideoMode = async () => {
    try {
      await videoCallService.switchToVideoMode();
      setIsAudioOnly(false);
      toast.info('Switched to video mode');
    } catch (error) {
      console.error('Failed to switch to video mode:', error);
      toast.error('Failed to switch to video mode');
    }
  };

  // End call
  const endCall = async () => {
    try {
      await videoCallService.leaveChannel();
      stopDurationTimer();
      setIsJoined(false);
      if (onCallEnd) {
        onCallEnd();
      }
      toast.success('Call ended');
    } catch (error) {
      console.error('Failed to end call:', error);
      toast.error('Failed to end call');
    }
  };

  // Cleanup
  const cleanup = async () => {
    try {
      stopDurationTimer();
      await videoCallService.cleanup();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle permission granted
  const handlePermissionGranted = () => {
    setShowPermissionRequest(false);
    setPermissionError(false);
    initializeCall();
  };

  // Handle permission denied
  const handlePermissionDenied = () => {
    setPermissionError(true);
    setShowPermissionRequest(false);
  };

  // Retry permission request
  const handleRetryPermission = () => {
    setShowPermissionRequest(true);
    setPermissionError(false);
  };

  if (showPermissionRequest) {
    return (
      <PermissionRequest
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={handlePermissionDenied}
        onRetry={handleRetryPermission}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  if (error || permissionError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {permissionError ? 'Permission Required' : 'Call Error'}
          </h2>
          <p className="text-gray-300 mb-4">
            {permissionError 
              ? 'Camera and microphone access is required for video calls. Please allow permissions and try again.'
              : error
            }
          </p>
          <div className="space-x-4">
            <button
              onClick={handleRetryPermission}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
            <button
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              End Call
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">
              {isGroupCall ? 'Group Call' : 'Video Consultation'}
            </h1>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{remoteUsers.length + 1} participants</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              {formatDuration(callDuration)}
            </div>
            <NetworkQualityIndicator quality={networkQuality} />
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="h-full pt-20 pb-20">
        <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <div 
              id="local-video" 
              className="w-full h-full min-h-[200px]"
              ref={localVideoRef}
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              You {isMuted && <MicOff className="inline h-4 w-4 ml-1" />}
              {isVideoOff && <VideoOff className="inline h-4 w-4 ml-1" />}
            </div>
          </div>

          {/* Remote Videos */}
          {remoteUsers.map((user) => (
            <div key={user.uid} className="relative bg-gray-800 rounded-lg overflow-hidden">
              <div 
                id={`remote-video-${user.uid}`}
                className="w-full h-full min-h-[200px]"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                User {user.uid}
              </div>
            </div>
          ))}

          {/* Placeholder for more participants */}
          {remoteUsers.length === 0 && (
            <div className="flex items-center justify-center bg-gray-800 rounded-lg">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Waiting for participants...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call Controls */}
      {showControls && (
        <CallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isAudioOnly={isAudioOnly}
          onToggleMicrophone={toggleMicrophone}
          onToggleCamera={toggleCamera}
          onSwitchToAudioOnly={switchToAudioOnly}
          onSwitchToVideoMode={switchToVideoMode}
          onEndCall={endCall}
        />
      )}
    </div>
  );
};

export default VideoCall;
