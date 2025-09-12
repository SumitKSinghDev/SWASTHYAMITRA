import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Video, 
  Phone, 
  Users, 
  Calendar, 
  Clock,
  QrCode,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import VideoCall from '../../components/VideoCall/VideoCall';
import JoinCall from '../../components/VideoCall/JoinCall';

const PatientVideoCall = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { channelId } = useParams();
  
  const [isJoining, setIsJoining] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [error, setError] = useState(null);
  const [callInfo, setCallInfo] = useState(null);

  useEffect(() => {
    if (channelId) {
      // If channelId is provided, join the call directly
      handleJoinCall(channelId);
    }
  }, [channelId]);

  const handleJoinCall = async (channelId) => {
    try {
      setIsJoining(true);
      setError(null);

      // Validate channel ID
      if (!channelId) {
        throw new Error('Invalid channel ID');
      }

      // Set call info
      setCallInfo({
        channelId,
        token: null, // For development, using null token
        userId: user?.id || Date.now(),
        userRole: user?.role || 'patient'
      });

      // Start the call
      setCallStarted(true);
      toast.success('Joining consultation...');

    } catch (error) {
      console.error('Failed to join call:', error);
      setError(error.message);
      toast.error('Failed to join consultation');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCallEnd = () => {
    setCallStarted(false);
    setCallInfo(null);
    navigate('/patient/appointments'); // Navigate back to appointments
  };

  const handleUserJoined = (user) => {
    console.log('User joined consultation:', user);
    toast.info('Doctor joined the consultation');
  };

  const handleUserLeft = (user) => {
    console.log('User left consultation:', user);
    toast.info('Doctor left the consultation');
  };

  if (callStarted && callInfo) {
    return (
      <VideoCall
        channel={callInfo.channelId}
        token={callInfo.token}
        onCallEnd={handleCallEnd}
        onUserJoined={handleUserJoined}
        onUserLeft={handleUserLeft}
        isGroupCall={false}
      />
    );
  }

  if (channelId) {
    return <JoinCall />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Consultation</h1>
            <p className="text-gray-600">Join your video consultation with the doctor</p>
          </div>
        </div>
      </div>

      {/* Join Call Form */}
      <div className="max-w-md mx-auto">
        <div className="card">
          <div className="card-content">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Join Video Consultation
              </h2>
              <p className="text-gray-600">
                Enter the consultation code provided by your doctor
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const code = formData.get('consultationCode');
              if (code) {
                handleJoinCall(code);
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Code
                </label>
                <input
                  type="text"
                  name="consultationCode"
                  placeholder="Enter consultation code"
                  className="input w-full"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <Phone className="h-5 w-5" />
                    <span>Join Consultation</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have a consultation code? Contact your doctor or ASHA worker.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">How to Join a Video Consultation</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Get Consultation Code</h4>
                  <p className="text-sm text-gray-600">
                    Your doctor or ASHA worker will provide you with a consultation code.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Enter the Code</h4>
                  <p className="text-sm text-gray-600">
                    Enter the consultation code in the field above and click "Join Consultation".
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Wait for Doctor</h4>
                  <p className="text-sm text-gray-600">
                    Once joined, wait for your doctor to join the consultation.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Start Consultation</h4>
                  <p className="text-sm text-gray-600">
                    Once the doctor joins, your video consultation will begin.
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

export default PatientVideoCall;
