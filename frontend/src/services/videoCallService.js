import AgoraRTC from 'agora-rtc-sdk-ng';
import { v4 as uuidv4 } from 'uuid';

class VideoCallService {
  constructor() {
    this.client = null;
    this.localTracks = {
      videoTrack: null,
      audioTrack: null
    };
    this.remoteUsers = new Map();
    this.isJoined = false;
    this.isConnecting = false;
    this.currentChannel = null;
    this.callbacks = {
      onUserJoined: null,
      onUserLeft: null,
      onUserPublished: null,
      onUserUnpublished: null,
      onError: null,
      onNetworkQuality: null
    };
  }

  // Initialize Agora client
  async initialize(appId) {
    try {
      this.client = AgoraRTC.createClient({ 
        mode: 'rtc', 
        codec: 'vp8' // Better for low bandwidth
      });

      // Set up event listeners
      this.setupEventListeners();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Agora client:', error);
      throw error;
    }
  }

  // Set up event listeners
  setupEventListeners() {
    if (!this.client) return;

    // User joined
    this.client.on('user-joined', (user) => {
      console.log('User joined:', user);
      this.remoteUsers.set(user.uid, user);
      if (this.callbacks.onUserJoined) {
        this.callbacks.onUserJoined(user);
      }
    });

    // User left
    this.client.on('user-left', (user) => {
      console.log('User left:', user);
      this.remoteUsers.delete(user.uid);
      if (this.callbacks.onUserLeft) {
        this.callbacks.onUserLeft(user);
      }
    });

    // User published media
    this.client.on('user-published', async (user, mediaType) => {
      console.log('User published:', user, mediaType);
      await this.client.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        user.videoTrack.play(`remote-video-${user.uid}`);
      }
      if (mediaType === 'audio') {
        user.audioTrack.play();
      }

      if (this.callbacks.onUserPublished) {
        this.callbacks.onUserPublished(user, mediaType);
      }
    });

    // User unpublished media
    this.client.on('user-unpublished', (user, mediaType) => {
      console.log('User unpublished:', user, mediaType);
      if (this.callbacks.onUserUnpublished) {
        this.callbacks.onUserUnpublished(user, mediaType);
      }
    });

    // Network quality
    this.client.on('network-quality', (stats) => {
      if (this.callbacks.onNetworkQuality) {
        this.callbacks.onNetworkQuality(stats);
      }
    });

    // Error handling
    this.client.on('exception', (event) => {
      console.error('Agora exception:', event);
      if (this.callbacks.onError) {
        this.callbacks.onError(event);
      }
    });
  }

  // Generate unique room/channel ID
  generateRoomId() {
    return `room_${uuidv4().replace(/-/g, '')}`;
  }

  // Sanitize and generate a valid Agora UID (string preferred)
  // Rules: ASCII only, length 1-255
  sanitizeUid(raw) {
    if (raw === undefined || raw === null) {
      return `user_${Math.floor(1000 + Math.random() * 9000)}`;
    }
    let uid = String(raw);
    // Remove non-ASCII characters (excluding null character)
    uid = uid.replace(/[^\x20-\x7E]/g, '');
    // Trim whitespace
    uid = uid.trim();
    // Fallback if empty after sanitization
    if (!uid) {
      uid = `user_${Math.floor(1000 + Math.random() * 9000)}`;
    }
    // Cap length to 255
    if (uid.length > 255) {
      uid = uid.slice(0, 255);
    }
    return uid;
  }

  // Build UID for current user (prefers email, then nabhaId, then id, then role)
  generateUid(user) {
    const candidates = [
      user?.email,
      user?.nabhaId,
      user?._id,
      user?.id,
      user?.role,
      Date.now()
    ];
    for (const c of candidates) {
      const s = this.sanitizeUid(c);
      if (s) return s;
    }
    return this.sanitizeUid(Date.now());
  }

  // Generate channel ID from NABHA ID
  generateChannelFromNabhaId(nabhaId) {
    return `nabha_${nabhaId}`;
  }

  // Join channel
  async joinChannel(appId, channel, token, uid) {
    try {
      if (this.isJoined || this.isConnecting) {
        console.warn('Join skipped: already in joining/joined state');
        return true;
      }
      this.isConnecting = true;
      if (!this.client) {
        await this.initialize(appId);
      }

      // Create local tracks
      await this.createLocalTracks();

      // Join channel
      await this.client.join(appId, channel, token, uid);
      this.isJoined = true;
      this.isConnecting = false;
      this.currentChannel = channel;

      // Publish local tracks
      await this.client.publish(Object.values(this.localTracks).filter(track => track));

      console.log('Successfully joined channel:', channel);
      return true;
    } catch (error) {
      console.error('Failed to join channel:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  // Create local audio and video tracks
  async createLocalTracks(options = {}) {
    try {
      const { 
        audio = true, 
        video = true, 
        audioConfig = {},
        videoConfig = {
          width: 640,
          height: 480,
          frameRate: 15 // Lower frame rate for better performance
        }
      } = options;

      // Request permissions first
      await this.requestPermissions(audio, video);

      if (audio) {
        try {
          this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack(audioConfig);
        } catch (error) {
          console.warn('Failed to create audio track:', error);
          // Continue without audio if permission denied
        }
      }

      if (video) {
        try {
          this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack(videoConfig);
          // Play local video
          this.localTracks.videoTrack.play('local-video');
        } catch (error) {
          console.warn('Failed to create video track:', error);
          // Continue without video if permission denied
        }
      }

      return this.localTracks;
    } catch (error) {
      console.error('Failed to create local tracks:', error);
      throw error;
    }
  }

  // Request camera and microphone permissions
  async requestPermissions(audio = true, video = true) {
    try {
      const constraints = {};
      
      if (audio) {
        constraints.audio = true;
      }
      
      if (video) {
        constraints.video = {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        };
      }

      // Request permissions using getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop the stream immediately as we just needed to check permissions
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      throw new Error(`Permission denied: ${error.message}`);
    }
  }

  // Leave channel
  async leaveChannel() {
    try {
      if (this.isJoined && this.client) {
        this.isConnecting = false;
        // Stop and close local tracks
        Object.values(this.localTracks).forEach(track => {
          if (track) {
            track.stop();
            track.close();
          }
        });

        // Leave channel
        await this.client.leave();
        
        this.isJoined = false;
        this.currentChannel = null;
        this.remoteUsers.clear();
        this.localTracks = { videoTrack: null, audioTrack: null };

        console.log('Successfully left channel');
        return true;
      }
    } catch (error) {
      console.error('Failed to leave channel:', error);
      throw error;
    }
  }

  // Toggle microphone
  async toggleMicrophone() {
    try {
      if (this.localTracks.audioTrack) {
        const enabled = this.localTracks.audioTrack.enabled;
        await this.localTracks.audioTrack.setEnabled(!enabled);
        return !enabled;
      }
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      throw error;
    }
  }

  // Toggle camera
  async toggleCamera() {
    try {
      if (this.localTracks.videoTrack) {
        const enabled = this.localTracks.videoTrack.enabled;
        await this.localTracks.videoTrack.setEnabled(!enabled);
        return !enabled;
      }
    } catch (error) {
      console.error('Failed to toggle camera:', error);
      throw error;
    }
  }

  // Switch to audio-only mode (for low bandwidth)
  async switchToAudioOnly() {
    try {
      if (this.localTracks.videoTrack) {
        await this.localTracks.videoTrack.stop();
        await this.localTracks.videoTrack.close();
        this.localTracks.videoTrack = null;
      }
      return true;
    } catch (error) {
      console.error('Failed to switch to audio-only:', error);
      throw error;
    }
  }

  // Switch back to video mode
  async switchToVideoMode() {
    try {
      if (!this.localTracks.videoTrack) {
        this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
          width: 640,
          height: 480,
          frameRate: 15
        });
        this.localTracks.videoTrack.play('local-video');
        await this.client.publish(this.localTracks.videoTrack);
      }
      return true;
    } catch (error) {
      console.error('Failed to switch to video mode:', error);
      throw error;
    }
  }

  // Get network quality
  getNetworkQuality() {
    if (this.client) {
      return this.client.getRTCStats();
    }
    return null;
  }

  // Set callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Get remote users
  getRemoteUsers() {
    return Array.from(this.remoteUsers.values());
  }

  // Check if user is in call
  isInCall() {
    return this.isJoined;
  }

  // Get current channel
  getCurrentChannel() {
    return this.currentChannel;
  }

  // Cleanup
  async cleanup() {
    try {
      await this.leaveChannel();
      if (this.client) {
        this.client.removeAllListeners();
        this.client = null;
      }
    } catch (error) {
      console.error('Failed to cleanup:', error);
    }
  }
}

// Create singleton instance
const videoCallService = new VideoCallService();

export default videoCallService;
