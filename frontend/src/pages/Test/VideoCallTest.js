import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import VideoCall from '../../components/VideoCall/VideoCall';
import CallInvite from '../../components/VideoCall/CallInvite';
import videoCallService from '../../services/videoCallService';

const VideoCallTest = () => {
  const { user } = useSelector((state) => state.auth);
  const [testMode, setTestMode] = useState('create'); // 'create', 'join', 'call'
  const [channelId, setChannelId] = useState('');
  const [currentCall, setCurrentCall] = useState(null);
  const [callInvite, setCallInvite] = useState(null);

  const createTestCall = () => {
    const newChannelId = videoCallService.generateRoomId();
    setChannelId(newChannelId);
    setCallInvite({
      channelId: newChannelId,
      callType: 'video',
      participants: [
        { name: `${user?.firstName} ${user?.lastName}`, role: user?.role || 'patient' }
      ]
    });
    setTestMode('invite');
  };

  const joinTestCall = () => {
    if (!channelId) {
      toast.error('Please enter a channel ID');
      return;
    }
    setCurrentCall({
      channelId,
      token: null,
      userId: user?.id || Date.now(),
      userRole: user?.role || 'patient'
    });
    setTestMode('call');
  };

  const handleJoinCall = () => {
    if (callInvite) {
      setCurrentCall({
        channelId: callInvite.channelId,
        token: null,
        userId: user?.id || Date.now(),
        userRole: user?.role || 'patient'
      });
      setTestMode('call');
    }
  };

  const handleCallEnd = () => {
    setCurrentCall(null);
    setCallInvite(null);
    setTestMode('create');
    toast.success('Test call ended');
  };

  const handleUserJoined = (user) => {
    console.log('User joined test call:', user);
    toast.info('User joined the test call');
  };

  const handleUserLeft = (user) => {
    console.log('User left test call:', user);
    toast.info('User left the test call');
  };

  if (testMode === 'call' && currentCall) {
    return (
      <VideoCall
        channel={currentCall.channelId}
        token={currentCall.token}
        onCallEnd={handleCallEnd}
        onUserJoined={handleUserJoined}
        onUserLeft={handleUserLeft}
        isGroupCall={true}
      />
    );
  }

  if (testMode === 'invite' && callInvite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <CallInvite
          channelId={callInvite.channelId}
          callType={callInvite.callType}
          participants={callInvite.participants}
          onJoinCall={handleJoinCall}
          onCancel={() => setTestMode('create')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Video Call Integration Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the Agora.io WebRTC video calling functionality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Call Test */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Create Test Call</h3>
            </div>
            <div className="card-content">
              <p className="text-gray-600 mb-4">
                Create a new video call and get an invitation link to share.
              </p>
              <button
                onClick={createTestCall}
                className="btn btn-primary w-full"
              >
                Create Test Call
              </button>
            </div>
          </div>

          {/* Join Call Test */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Join Test Call</h3>
            </div>
            <div className="card-content">
              <p className="text-gray-600 mb-4">
                Join an existing call using a channel ID.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter Channel ID"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="input w-full"
                />
                <button
                  onClick={joinTestCall}
                  className="btn btn-primary w-full"
                >
                  Join Test Call
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Test Instructions</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Create a Call</h4>
                    <p className="text-sm text-gray-600">
                      Click "Create Test Call" to generate a new video call with a unique channel ID.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Share the Link</h4>
                    <p className="text-sm text-gray-600">
                      Copy the call link and share it with another person or open it in another browser tab.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Test Features</h4>
                    <p className="text-sm text-gray-600">
                      Test video/audio controls, network quality indicators, and call management features.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Test Low Bandwidth</h4>
                    <p className="text-sm text-gray-600">
                      Use browser dev tools to simulate slow network and test audio-only fallback.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current User Info */}
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Current User Info</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">User ID:</p>
                  <p className="text-sm text-gray-900">{user?.id || 'Demo User'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Role:</p>
                  <p className="text-sm text-gray-900 capitalize">{user?.role || 'patient'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Name:</p>
                  <p className="text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Agora App ID:</p>
                  <p className="text-sm text-gray-900 font-mono">
                    {process.env.REACT_APP_AGORA_APP_ID || 'Not configured'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallTest;
