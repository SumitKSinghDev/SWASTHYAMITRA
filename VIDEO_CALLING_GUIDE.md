# Video Calling Integration Guide

## Overview
This guide explains how to use the Agora.io WebRTC video calling integration in the CODE4CARE telemedicine platform.

## Features Implemented

### ✅ Core Features
- **1-to-1 Video Calls**: Direct video consultations between doctors and patients
- **Group Calls**: Support for doctor + patient + ASHA worker consultations
- **Unique Room/Channel IDs**: Each consultation gets a unique identifier
- **NABHA Card Integration**: Patients can join using their NABHA Card ID
- **Call Controls**: Mute/unmute, video on/off, end call
- **Network Quality Monitoring**: Real-time network quality indicators
- **Audio-Only Fallback**: Automatic fallback for low bandwidth conditions
- **Auto-logout**: Automatic session cleanup after consultation ends

### ✅ Technical Implementation
- **Agora.io WebRTC SDK**: Latest version with VP8 codec for better performance
- **React Components**: Modular, reusable video call components
- **Backend API**: RESTful API for call management
- **Real-time Updates**: WebSocket support for live updates
- **Security**: Token-based authentication (development mode uses null tokens)

## Configuration

### Environment Variables
```env
# Agora.io Configuration
REACT_APP_AGORA_APP_ID=52f10392fa8c472ca61e8c32c08dfd2e
REACT_APP_AGORA_CERTIFICATE=7a077a7300a94ea78bdb0eff1b2ab4e7

# Chat Configuration
REACT_APP_AGORA_CHAT_APP_KEY=611394168#1598463
REACT_APP_AGORA_CHAT_ORG_NAME=611394168
REACT_APP_AGORA_CHAT_APP_NAME=1598463

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

## Usage

### For Patients
1. **Navigate to Video Call**: Go to `/patient/video-call`
2. **Enter Consultation Code**: Input the code provided by doctor/ASHA worker
3. **Join Call**: Click "Join Consultation" to enter the video call
4. **Use Controls**: Mute/unmute, turn video on/off as needed
5. **End Call**: Click the red phone button to end the consultation

### For Doctors
1. **Navigate to Video Consultation**: Go to `/doctor/video-consultation`
2. **Create New Call**: Click "Start New Call" to create a consultation
3. **Share Link**: Copy and share the call link with patients
4. **Join Call**: Click "Join Now" to enter the video call
5. **Manage Participants**: View and manage all participants

### For ASHA Workers
1. **Join Existing Calls**: Use the call link provided by doctors
2. **Participate in Group Calls**: Join as a third participant when needed
3. **Assist Patients**: Help patients join calls using their NABHA Card ID

## API Endpoints

### Video Call Management
```javascript
// Create a new video call
POST /api/video-calls/create
{
  "doctorId": "doctor123",
  "patientId": "patient456",
  "patientNabhaId": "NABHA815959NTQF",
  "callType": "video",
  "scheduledTime": "2024-01-20T10:00:00Z",
  "participants": []
}

// Join a video call
POST /api/video-calls/join/:callId
{
  "userId": "user123",
  "userRole": "patient"
}

// Get call by channel ID
GET /api/video-calls/channel/:channelId

// End a video call
POST /api/video-calls/end/:callId
{
  "userId": "user123"
}

// Get user's calls
GET /api/video-calls/user/:userId?status=active&limit=10&offset=0

// Generate call link for NABHA ID
POST /api/video-calls/generate-link
{
  "patientNabhaId": "NABHA815959NTQF",
  "doctorId": "doctor123",
  "callType": "video"
}

// Get call statistics
GET /api/video-calls/stats/:userId?period=30d
```

## Components

### VideoCall Component
Main video calling interface with:
- Video grid layout
- Call controls
- Network quality indicators
- Participant management
- Call duration tracking

### CallControls Component
Control buttons for:
- Microphone toggle
- Camera toggle
- Audio/Video mode switch
- Settings
- Participants list
- End call

### CallInvite Component
Invitation interface with:
- Channel ID display
- Call link generation
- QR code display
- Share functionality
- Join call button

### JoinCall Component
Call joining interface with:
- Channel ID input
- User information display
- Join call functionality
- Error handling

## Testing

### Test Page
Visit `/test/video-call` to test the video calling functionality:
1. Create test calls
2. Join existing calls
3. Test all features
4. Simulate low bandwidth conditions

### Manual Testing Steps
1. **Create Call**: Use the test page to create a new call
2. **Share Link**: Copy the generated call link
3. **Join from Another Tab**: Open the link in another browser tab
4. **Test Controls**: Test all call controls (mute, video, etc.)
5. **Test Network Quality**: Use browser dev tools to simulate slow network
6. **Test Audio-Only**: Switch to audio-only mode
7. **Test Group Calls**: Add multiple participants

## Troubleshooting

### Common Issues

#### 1. "Failed to join call" Error
- **Cause**: Invalid channel ID or network issues
- **Solution**: Check channel ID format and network connection

#### 2. No Video/Audio
- **Cause**: Browser permissions or device issues
- **Solution**: Allow camera/microphone permissions, check device connections

#### 3. Poor Video Quality
- **Cause**: Low bandwidth or network issues
- **Solution**: Switch to audio-only mode or check network connection

#### 4. Token Errors
- **Cause**: Invalid or expired Agora token
- **Solution**: In development, using null tokens is fine. In production, ensure proper token generation.

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Limited support (use native apps for production)

## Security Considerations

### Development Mode
- Uses null tokens (Agora's temporary token system)
- No authentication required for testing
- All calls are public (anyone with channel ID can join)

### Production Mode
- Implement proper token generation using Agora's token server
- Add authentication middleware
- Implement call access controls
- Add call recording and logging
- Implement rate limiting

## Performance Optimization

### For Low Bandwidth Areas
- **VP8 Codec**: Better compression than H.264
- **Adaptive Bitrate**: Automatic quality adjustment
- **Audio-Only Fallback**: Switch to audio when video quality is poor
- **Frame Rate Control**: Lower frame rates for better performance

### Best Practices
- **Pre-call Testing**: Test connection before starting calls
- **Network Monitoring**: Show network quality to users
- **Graceful Degradation**: Fallback options for poor connections
- **Call Timeout**: Automatic call ending after inactivity

## Future Enhancements

### Planned Features
- **Call Recording**: Record consultations for medical records
- **Screen Sharing**: Share screens during consultations
- **File Sharing**: Share documents and images
- **Chat Integration**: Text chat during video calls
- **Mobile Apps**: Native mobile applications
- **Offline Support**: SMS/USSD fallback for rural areas

### Integration Opportunities
- **EHR Integration**: Link calls to patient records
- **Prescription Integration**: Generate prescriptions during calls
- **Appointment Integration**: Schedule follow-up appointments
- **Payment Integration**: Handle consultation payments
- **Analytics**: Track call quality and usage patterns

## Support

For technical support or questions about the video calling integration:
1. Check the test page at `/test/video-call`
2. Review browser console for error messages
3. Check network connectivity
4. Verify Agora.io credentials
5. Contact the development team

## License

This video calling integration uses Agora.io WebRTC SDK and is subject to Agora's terms of service and licensing requirements.
