import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { QrCode, Users, Phone, AlertCircle } from 'lucide-react';
import VideoCall from './VideoCall';
import videoCallService from '../../services/videoCallService';

const JoinCall = () => {
  const { channelId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const query = new URLSearchParams(location.search);
  const roleParam = (query.get('role') || '').toLowerCase();
  const effectiveRole = roleParam === 'doctor' || roleParam === 'patient' || roleParam === 'admin' ? roleParam : (user?.role || 'patient');
  
  const [isJoining, setIsJoining] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [error, setError] = useState(null);
  const [callInfo, setCallInfo] = useState(null);

  // Mock token generation - In production, this should come from your backend
  const generateToken = (channelId, userId) => {
    // This is a placeholder. In production, you need to generate tokens on your backend
    // using Agora's token server or your own token server
    return null; // For testing, you can use null token in development mode
  };

  const handleJoinCall = async () => {
    try {
      setIsJoining(true);
      setError(null);

      // Validate channel ID
      if (!channelId) {
        throw new Error('Invalid channel ID');
      }

      // Generate token (in production, this should come from your backend)
      const token = generateToken(channelId, user?.id);

      // Set call info
      setCallInfo({
        channelId,
        token,
        userId: user?.id || Date.now(),
        userRole: effectiveRole
      });

      // Start the call
      setCallStarted(true);
      toast.success('Joining call...');

    } catch (error) {
      console.error('Failed to join call:', error);
      setError(error.message);
      toast.error('Failed to join call');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCallEnd = () => {
    setCallStarted(false);
    setCallInfo(null);
    navigate(-1); // Go back to previous page
  };

  const handleUserJoined = (user) => {
    console.log('User joined call:', user);
  };

  const handleUserLeft = (user) => {
    console.log('User left call:', user);
  };

  if (callStarted && callInfo) {
    return (
      <VideoCall
        channel={callInfo.channelId}
        token={callInfo.token}
        onCallEnd={handleCallEnd}
        onUserJoined={handleUserJoined}
        onUserLeft={handleUserLeft}
        isGroupCall={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {error ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Join Video Call
              </h2>
              <p className="text-gray-600">
                You're about to join a video consultation
              </p>
            </div>

            {/* Channel Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Channel:</span>
                <span className="text-sm font-mono text-gray-900">{channelId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Your Role:</span>
                <span className="text-sm text-gray-900 capitalize">{effectiveRole}</span>
              </div>
            </div>

            {/* User Info */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Joining as:</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinCall}
              disabled={isJoining}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <Phone className="h-5 w-5" />
                  <span>Join Call</span>
                </>
              )}
            </button>

            {/* Cancel Button */}
            <button
              onClick={() => navigate(-1)}
              className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinCall;
