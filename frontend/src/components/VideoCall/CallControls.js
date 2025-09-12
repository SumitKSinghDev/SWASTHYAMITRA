import React from 'react';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2,
  VolumeX,
  Settings,
  Users
} from 'lucide-react';

const CallControls = ({
  isMuted,
  isVideoOff,
  isAudioOnly,
  onToggleMicrophone,
  onToggleCamera,
  onSwitchToAudioOnly,
  onSwitchToVideoMode,
  onEndCall
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
      <div className="flex items-center justify-center space-x-4">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMicrophone}
          className={`p-3 rounded-full transition-colors ${
            isMuted 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`p-3 rounded-full transition-colors ${
            isVideoOff 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </button>

        {/* Audio/Video Mode Toggle */}
        <button
          onClick={isAudioOnly ? onSwitchToVideoMode : onSwitchToAudioOnly}
          className={`p-3 rounded-full transition-colors ${
            isAudioOnly 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
          title={isAudioOnly ? 'Switch to video' : 'Switch to audio only'}
        >
          {isAudioOnly ? <Video className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </button>

        {/* Settings */}
        <button
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
          title="Settings"
        >
          <Settings className="h-6 w-6" />
        </button>

        {/* Participants */}
        <button
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
          title="Participants"
        >
          <Users className="h-6 w-6" />
        </button>

        {/* End Call */}
        <button
          onClick={onEndCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          title="End call"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default CallControls;
