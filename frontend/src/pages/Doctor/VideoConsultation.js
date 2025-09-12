import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Video, 
  Phone, 
  Users, 
  Plus, 
  Calendar, 
  Clock,
  QrCode,
  Share2,
  Copy
} from 'lucide-react';
import videoCallService from '../../services/videoCallService';
import CallInvite from '../../components/VideoCall/CallInvite';
import VideoCall from '../../components/VideoCall/VideoCall';

const DoctorVideoConsultation = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [activeCalls, setActiveCalls] = useState([]);
  const [showCreateCall, setShowCreateCall] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [callInvite, setCallInvite] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, this would come from API
  const mockCalls = [
    {
      id: 1,
      channelId: 'room_123456789',
      patientName: 'Ram Singh',
      patientNabhaId: 'NABHA815959NTQF',
      scheduledTime: '2024-01-20T10:00:00Z',
      status: 'scheduled',
      type: 'video',
      duration: 0,
      participants: [
        { name: 'Dr. Rajesh Kumar', role: 'doctor' },
        { name: 'Ram Singh', role: 'patient' }
      ]
    },
    {
      id: 2,
      channelId: 'room_987654321',
      patientName: 'Priya Sharma',
      patientNabhaId: 'NABHA815959NTQF',
      scheduledTime: '2024-01-20T14:30:00Z',
      status: 'active',
      type: 'video',
      duration: 1200,
      participants: [
        { name: 'Dr. Rajesh Kumar', role: 'doctor' },
        { name: 'Priya Sharma', role: 'patient' },
        { name: 'ASHA Worker', role: 'asha' }
      ]
    }
  ];

  useEffect(() => {
    // Load active calls
    setActiveCalls(mockCalls);
  }, []);

  const createNewCall = () => {
    const channelId = videoCallService.generateRoomId();
    setCallInvite({
      channelId,
      callType: 'video',
      participants: [
        { name: `${user?.firstName} ${user?.lastName}`, role: 'doctor' }
      ]
    });
    setShowCreateCall(true);
  };

  const startCall = (call) => {
    setCurrentCall(call);
    setShowCreateCall(false);
    setCallInvite(null);
  };

  const joinCall = (call) => {
    navigate(`/call/${call.channelId}`);
  };

  const endCall = () => {
    setCurrentCall(null);
    toast.success('Call ended');
  };

  const handleJoinCall = () => {
    if (callInvite) {
      const call = {
        id: Date.now(),
        channelId: callInvite.channelId,
        patientName: 'New Patient',
        patientNabhaId: 'TBD',
        scheduledTime: new Date().toISOString(),
        status: 'active',
        type: callInvite.callType,
        duration: 0,
        participants: callInvite.participants
      };
      startCall(call);
    }
  };

  const handleCancelInvite = () => {
    setCallInvite(null);
    setShowCreateCall(false);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (currentCall) {
    return (
      <VideoCall
        channel={currentCall.channelId}
        token={null} // In production, get token from backend
        onCallEnd={endCall}
        isGroupCall={currentCall.participants.length > 2}
      />
    );
  }

  if (showCreateCall && callInvite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <CallInvite
          channelId={callInvite.channelId}
          callType={callInvite.callType}
          participants={callInvite.participants}
          onJoinCall={handleJoinCall}
          onCancel={handleCancelInvite}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Consultations</h1>
          <p className="text-gray-600">Manage your video consultations with patients</p>
        </div>
        <button
          onClick={createNewCall}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Start New Call</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{activeCalls.length}</p>
                <p className="text-gray-600">Total Calls</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {activeCalls.filter(call => call.status === 'active').length}
                </p>
                <p className="text-gray-600">Active Calls</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {activeCalls.reduce((sum, call) => sum + call.participants.length, 0)}
                </p>
                <p className="text-gray-600">Participants</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(activeCalls.reduce((sum, call) => sum + call.duration, 0))}
                </p>
                <p className="text-gray-600">Total Duration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calls List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Consultation Calls</h3>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {activeCalls.map((call) => (
              <div key={call.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Video className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {call.patientName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          NABHA ID: {call.patientNabhaId}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                            {call.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(call.scheduledTime).toLocaleString()}
                          </span>
                          {call.duration > 0 && (
                            <span className="text-sm text-gray-500">
                              Duration: {formatDuration(call.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {call.participants.length} participants
                      </p>
                      <p className="text-xs text-gray-500">
                        {call.type} call
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {call.status === 'scheduled' && (
                        <button
                          onClick={() => joinCall(call)}
                          className="btn btn-primary btn-sm"
                        >
                          Join
                        </button>
                      )}
                      {call.status === 'active' && (
                        <button
                          onClick={() => joinCall(call)}
                          className="btn btn-success btn-sm"
                        >
                          Rejoin
                        </button>
                      )}
                      <button
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/call/${call.channelId}`)}
                        className="btn btn-outline btn-sm"
                        title="Copy call link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorVideoConsultation;
