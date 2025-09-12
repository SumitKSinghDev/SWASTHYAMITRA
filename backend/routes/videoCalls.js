const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
// Agora token generation
let RtcRole, RtcTokenBuilder;
try {
  ({ RtcRole, RtcTokenBuilder } = require('agora-access-token'));
} catch (e) {
  // Library may not be installed yet; endpoints that require it will respond with error
}

// Mock data - in production, this would be stored in database
const videoCalls = new Map();

// Generate Agora token (in production, use Agora's token server)
const generateAgoraToken = (channelName, uid, role = 'publisher') => {
  if (!RtcTokenBuilder || !RtcRole) return null;
  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  if (!appID || !appCertificate) return null;
  const agoraRole = role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
  // Use account (string) UID to align with frontend string uid
  const expireTs = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
  return RtcTokenBuilder.buildTokenWithAccount(appID, appCertificate, channelName, String(uid), agoraRole, expireTs);
};

// Issue RTC token
router.post('/token', (req, res) => {
  try {
    const { channelName, uid, role = 'publisher', expireSeconds = 3600 } = req.body || {};
    if (!channelName) {
      return res.status(400).json({ success: false, message: 'channelName required' });
    }
    if (!RtcTokenBuilder || !RtcRole) {
      return res.status(500).json({ success: false, message: 'agora-access-token not installed on server' });
    }
    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appID || !appCertificate) {
      return res.status(500).json({ success: false, message: 'AGORA_APP_ID/AGORA_APP_CERTIFICATE missing' });
    }
    const agoraRole = role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
    const sanitizedUid = String(uid || `user_${Math.floor(1000 + Math.random() * 9000)}`).slice(0, 255);
    const expireTs = Math.floor(Date.now() / 1000) + Number(expireSeconds || 3600);
    const token = RtcTokenBuilder.buildTokenWithAccount(appID, appCertificate, channelName, sanitizedUid, agoraRole, expireTs);
    return res.json({ success: true, token, uid: sanitizedUid, expireAt: expireTs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new video call
router.post('/create', async (req, res) => {
  try {
    const { 
      doctorId, 
      patientId, 
      patientNabhaId, 
      callType = 'video',
      scheduledTime,
      participants = []
    } = req.body;

    // Generate unique channel ID
    const channelId = `room_${uuidv4().replace(/-/g, '')}`;
    
    // Create call object
    const call = {
      id: uuidv4(),
      channelId,
      doctorId,
      patientId,
      patientNabhaId,
      callType,
      scheduledTime: scheduledTime || new Date().toISOString(),
      status: 'created',
      participants: [
        { id: doctorId, role: 'doctor', joined: false },
        { id: patientId, role: 'patient', joined: false },
        ...participants.map(p => ({ ...p, joined: false }))
      ],
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null,
      duration: 0
    };

    // Store call
    videoCalls.set(call.id, call);

    res.json({
      success: true,
      call: {
        id: call.id,
        channelId: call.channelId,
        callType: call.callType,
        status: call.status,
        participants: call.participants,
        scheduledTime: call.scheduledTime
      }
    });
  } catch (error) {
    console.error('Error creating video call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create video call',
      error: error.message
    });
  }
});

// Join a video call
router.post('/join/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const { userId, userRole } = req.body;

    const call = videoCalls.get(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Update participant status
    const participant = call.participants.find(p => p.id === userId);
    if (participant) {
      participant.joined = true;
      participant.joinedAt = new Date().toISOString();
    }

    // Update call status
    if (call.status === 'created') {
      call.status = 'active';
      call.startedAt = new Date().toISOString();
    }

    // Generate token for the user
    const token = generateAgoraToken(call.channelId, userId, 'publisher');

    res.json({
      success: true,
      call: {
        id: call.id,
        channelId: call.channelId,
        callType: call.callType,
        status: call.status,
        participants: call.participants,
        token
      }
    });
  } catch (error) {
    console.error('Error joining video call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join video call',
      error: error.message
    });
  }
});

// Get call by channel ID
router.get('/channel/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    
    const call = Array.from(videoCalls.values()).find(c => c.channelId === channelId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    res.json({
      success: true,
      call: {
        id: call.id,
        channelId: call.channelId,
        callType: call.callType,
        status: call.status,
        participants: call.participants,
        scheduledTime: call.scheduledTime,
        startedAt: call.startedAt,
        duration: call.duration
      }
    });
  } catch (error) {
    console.error('Error getting call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get call',
      error: error.message
    });
  }
});

// End a video call
router.post('/end/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const { userId } = req.body;

    const call = videoCalls.get(callId);
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Update call status
    call.status = 'ended';
    call.endedAt = new Date().toISOString();
    
    // Calculate duration
    if (call.startedAt) {
      call.duration = Math.floor((new Date(call.endedAt) - new Date(call.startedAt)) / 1000);
    }

    res.json({
      success: true,
      call: {
        id: call.id,
        channelId: call.channelId,
        status: call.status,
        duration: call.duration,
        endedAt: call.endedAt
      }
    });
  } catch (error) {
    console.error('Error ending video call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end video call',
      error: error.message
    });
  }
});

// Get calls for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 10, offset = 0 } = req.query;

    let userCalls = Array.from(videoCalls.values()).filter(call => 
      call.participants.some(p => p.id === userId)
    );

    if (status) {
      userCalls = userCalls.filter(call => call.status === status);
    }

    // Sort by creation date (newest first)
    userCalls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const paginatedCalls = userCalls.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      calls: paginatedCalls.map(call => ({
        id: call.id,
        channelId: call.channelId,
        callType: call.callType,
        status: call.status,
        participants: call.participants,
        scheduledTime: call.scheduledTime,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        duration: call.duration
      })),
      total: userCalls.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error getting user calls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user calls',
      error: error.message
    });
  }
});

// Generate call link for NABHA ID
router.post('/generate-link', async (req, res) => {
  try {
    const { patientNabhaId, doctorId, callType = 'video' } = req.body;

    // Generate channel ID from NABHA ID
    const channelId = `nabha_${patientNabhaId}_${Date.now()}`;
    
    // Create call object
    const call = {
      id: uuidv4(),
      channelId,
      doctorId,
      patientNabhaId,
      callType,
      status: 'created',
      participants: [
        { id: doctorId, role: 'doctor', joined: false }
      ],
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null,
      duration: 0
    };

    // Store call
    videoCalls.set(call.id, call);

    const callLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/call/${channelId}`;

    res.json({
      success: true,
      call: {
        id: call.id,
        channelId: call.channelId,
        callType: call.callType,
        status: call.status,
        callLink
      }
    });
  } catch (error) {
    console.error('Error generating call link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate call link',
      error: error.message
    });
  }
});

// Get call statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;

    const userCalls = Array.from(videoCalls.values()).filter(call => 
      call.participants.some(p => p.id === userId)
    );

    const now = new Date();
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    const recentCalls = userCalls.filter(call => 
      new Date(call.createdAt) >= startDate
    );

    const stats = {
      totalCalls: recentCalls.length,
      activeCalls: recentCalls.filter(call => call.status === 'active').length,
      completedCalls: recentCalls.filter(call => call.status === 'ended').length,
      totalDuration: recentCalls.reduce((sum, call) => sum + (call.duration || 0), 0),
      averageDuration: recentCalls.length > 0 
        ? Math.floor(recentCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / recentCalls.length)
        : 0,
      videoCalls: recentCalls.filter(call => call.callType === 'video').length,
      audioCalls: recentCalls.filter(call => call.callType === 'audio').length
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting call stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get call stats',
      error: error.message
    });
  }
});

module.exports = router;
