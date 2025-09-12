import React, { createContext, useContext, useState, useCallback } from 'react';

const VideoCallContext = createContext();

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};

export const VideoCallProvider = ({ children }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [callData, setCallData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const startCall = useCallback((data) => {
    setCallData(data);
    setIsInCall(true);
    setParticipants(data.participants || []);
    setIsMuted(false);
    setIsVideoOn(true);
    setIsScreenSharing(false);
    setCallDuration(0);
  }, []);

  const endCall = useCallback(() => {
    setIsInCall(false);
    setCallData(null);
    setParticipants([]);
    setIsMuted(false);
    setIsVideoOn(true);
    setIsScreenSharing(false);
    setCallDuration(0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    setIsVideoOn(prev => !prev);
  }, []);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing(prev => !prev);
  }, []);

  const addParticipant = useCallback((participant) => {
    setParticipants(prev => [...prev, participant]);
  }, []);

  const removeParticipant = useCallback((participantId) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId));
  }, []);

  const updateCallDuration = useCallback((duration) => {
    setCallDuration(duration);
  }, []);

  const value = {
    isInCall,
    callData,
    participants,
    isMuted,
    isVideoOn,
    isScreenSharing,
    callDuration,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    addParticipant,
    removeParticipant,
    updateCallDuration
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};
