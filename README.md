# SWASTHYAMITRA Telemedicine Web Platform

A comprehensive telemedicine platform designed for rural healthcare, featuring unique NABHA Health Card system, AI-powered health assistant, video consultations, and multilingual support.

## 🌟 Key Features

### 🏥 Core Healthcare Features
- **NABHA Health Card System**: Unique QR code-based digital identity for patients
- **Multi-Role Support**: Patient, Doctor, ASHA Worker, Pharmacy, Admin
- **Video Consultations**: Real-time video calling with doctors
- **AI Health Assistant**: Multilingual AI chatbot for health guidance
- **Appointment Management**: Complete booking and scheduling system
- **Prescription Management**: Digital prescriptions with pharmacy integration
- **Medicine Orders**: Online medicine ordering and delivery tracking

### 🌐 Accessibility & Localization
- **Multilingual Support**: Punjabi, Hindi, English with full UI translation
- **Offline-First Design**: SMS/USSD fallback for areas with poor internet
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Voice Support**: Speech-to-text and text-to-speech capabilities

### 🤖 AI & Technology
- **AI Health Assistant**: 24/7 health guidance and symptom checking
- **Smart Recommendations**: AI-powered health suggestions
- **Medicine Reminders**: Automated medication reminders
- **Health Data Tracking**: Symptom, condition, and medication tracking

### 🏪 Pharmacy Integration
- **Real-time Inventory**: Live medicine availability
- **Prescription Sync**: Automatic prescription processing
- **Delivery Tracking**: Real-time order status updates
- **Medicine Search**: Advanced search and filtering

### 👩‍⚕️ ASHA Worker Features
- **Offline Patient Registration**: Register patients without internet
- **NABHA Card Generation**: Create digital health cards for patients
- **Patient Management**: Track and manage patient records
- **Health Center Integration**: Connect with local health centers

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SumitKSinghDev/SWASTHYAMITRA.git
   cd SWASTHYAMITRA
   ```

2. **Install Dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   
   # Frontend environment
   cd ../frontend
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Start Development Server**
   ```bash
   # From root directory
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Configuration

### MongoDB Setup
- **Local MongoDB**: Use `mongodb://localhost:27017/swasthyamitra`
- **MongoDB Atlas**: Get connection string from [MongoDB Atlas](https://cloud.mongodb.com)

### Environment Variables
See `backend/.env.example` and `frontend/.env.example` for required variables.

## 📋 Detailed Feature Implementation

### 🤖 AI Health Assistant
- **Multilingual Chat Interface**: Supports English, Hindi, and Punjabi
- **Voice Input/Output**: Speech-to-text and text-to-speech capabilities
- **Symptom Checking**: AI-powered symptom analysis and recommendations
- **Emergency Detection**: Automatic emergency situation identification
- **Offline Mode**: Works without internet using pre-programmed responses
- **Medicine Reminders**: Set and manage medication schedules
- **FAQ System**: Common health questions and answers
- **SMS Integration**: Send health advice via SMS for offline users

### 📹 Video Consultation System
- **Real-time Video Calls**: WebRTC-based video calling
- **Call Controls**: Mute, video toggle, screen sharing
- **Network Quality Indicator**: Real-time connection status
- **Call Recording**: Optional call recording for medical records
- **Join via Link**: Shareable call links for easy access
- **Mobile Responsive**: Works on all devices

### 🆔 NABHA Health Card System
- **QR Code Generation**: Unique QR codes for each patient
- **Digital Identity**: Complete health profile in one card
- **Offline Access**: Works without internet connection
- **Medical History**: Complete health records accessible via QR
- **Emergency Information**: Critical health data for emergencies
- **ASHA Integration**: ASHA workers can generate cards for patients

### 💊 Medicine Management
- **Online Ordering**: Complete medicine ordering system
- **Prescription Sync**: Automatic prescription processing
- **Inventory Management**: Real-time stock updates
- **Delivery Tracking**: Live order status updates
- **Medicine Search**: Advanced search with filters
- **Price Comparison**: Compare prices across pharmacies
- **Reminder System**: Automated medication reminders

### 📅 Appointment System
- **Smart Scheduling**: AI-powered appointment recommendations
- **Multi-slot Booking**: Book multiple appointments
- **Calendar Integration**: Sync with personal calendars
- **Reminder Notifications**: SMS and email reminders
- **Rescheduling**: Easy appointment modification
- **Waitlist Management**: Automatic waitlist handling

### 🌍 Multilingual Support
- **Complete UI Translation**: All interface elements translated
- **Dynamic Language Switching**: Change language on the fly
- **Voice Recognition**: Speech recognition in multiple languages
- **Cultural Adaptation**: Region-specific health information
- **RTL Support**: Right-to-left text support for Arabic (future)

## 👥 User Roles & Capabilities

### 👤 Patient
- **Dashboard**: Health overview and quick actions
- **NABHA Card**: Digital health identity management
- **Appointments**: Book, view, and manage appointments
- **Prescriptions**: View and download prescriptions
- **Medicine Orders**: Order and track medications
- **Health Records**: Complete medical history
- **AI Assistant**: 24/7 health guidance
- **Video Calls**: Consult with doctors remotely
- **Reviews**: Rate and review services

### 👨‍⚕️ Doctor
- **Dashboard**: Patient overview and statistics
- **Appointment Management**: View and manage appointments
- **Patient Records**: Access complete patient history
- **Prescription Writing**: Digital prescription system
- **Video Consultations**: Conduct remote consultations
- **Schedule Management**: Set availability and slots
- **Patient Communication**: Direct messaging with patients
- **Health Analytics**: Patient health insights

### 👩‍⚕️ ASHA Worker
- **Offline Registration**: Register patients without internet
- **NABHA Card Generation**: Create digital health cards
- **Patient Management**: Track and manage patient records
- **Health Center Integration**: Connect with local centers
- **Vaccination Tracking**: Manage vaccination schedules
- **Health Education**: Provide health information to patients
- **Emergency Response**: Handle emergency situations
- **Data Collection**: Collect health data for government programs

### 🏪 Pharmacy
- **Inventory Management**: Real-time stock management
- **Prescription Processing**: Handle digital prescriptions
- **Order Management**: Process and track orders
- **Delivery Coordination**: Manage delivery schedules
- **Customer Support**: Patient communication
- **Analytics**: Sales and inventory analytics
- **Medicine Search**: Advanced search capabilities
- **Price Management**: Dynamic pricing system

### 👨‍💼 Admin
- **User Management**: Manage all user accounts
- **System Monitoring**: Monitor platform performance
- **Analytics Dashboard**: Comprehensive system analytics
- **Content Management**: Manage health content
- **Report Generation**: Generate various reports
- **Settings Configuration**: System-wide settings
- **Security Management**: Monitor security and access
- **Backup Management**: Data backup and recovery

## 🛠️ Tech Stack

### Frontend
- **React.js** with modern hooks and functional components
- **Tailwind CSS** for responsive styling and theming
- **Redux Toolkit** for state management
- **React Router** for navigation and routing
- **React Context API** for theme, notifications, and feature-specific state
- **Axios** for API communication
- **React Toastify** for notifications
- **Lucide React** for icons
- **WebRTC** for video calling functionality

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication and authorization
- **BCrypt** for password hashing
- **Multer** for file uploads
- **CORS** for cross-origin requests
- **Express Rate Limit** for API protection
- **Helmet** for security headers

### AI & External Services
- **OpenAI API** for AI health assistant (configurable)
- **SMS Gateway** for offline communication
- **QR Code Generation** for NABHA cards
- **WebRTC** for video calling
- **Speech Recognition** for voice input
- **Text-to-Speech** for audio responses

## 🚀 Current Implementation Status

### ✅ Fully Implemented Features
- **User Authentication & Authorization**: Complete login/register system
- **Multi-role Dashboard**: Role-based dashboards for all user types
- **AI Health Assistant**: Multilingual chatbot with voice support
- **Video Calling System**: WebRTC-based video consultations
- **NABHA Health Card**: QR code generation and management
- **Appointment System**: Complete booking and management
- **Prescription Management**: Digital prescription system
- **Medicine Ordering**: Online medicine ordering and tracking
- **Multilingual Support**: English, Hindi, Punjabi UI translation
- **Responsive Design**: Mobile-first responsive design
- **Theme System**: Light/dark mode support
- **Notification System**: Toast notifications and alerts
- **Context Management**: React Context for state management

### 🔄 Partially Implemented Features
- **SMS Integration**: Basic SMS service structure (needs API keys)
- **Payment Integration**: Payment gateway integration (in progress)
- **Advanced Analytics**: Basic analytics implemented
- **File Upload**: Basic file upload system
- **Email Notifications**: Email service structure (needs SMTP config)

### 📋 Planned Features
- **Advanced AI Features**: More sophisticated AI responses
- **Mobile App**: React Native mobile application
- **Offline Sync**: Complete offline functionality
- **Advanced Reporting**: Comprehensive reporting system
- **Integration APIs**: Third-party health service integrations

## 📱 Demo Accounts

For testing purposes, you can use these demo accounts:

- **Patient**: `patient@demo.com` / `password123`
- **Doctor**: `doctor@demo.com` / `password123`
- **ASHA Worker**: `asha@demo.com` / `password123`
- **Pharmacy**: `pharmacy@demo.com` / `password123`
- **Admin**: `admin@demo.com` / `password123`

## 🎯 How to Use Key Features

### 🤖 AI Health Assistant
1. **Access**: Click on "AI Assistant" from any dashboard
2. **Language Selection**: Choose from English, Hindi, or Punjabi
3. **Voice Input**: Click microphone icon for voice input
4. **Text Input**: Type your health questions
5. **Voice Output**: Click speaker icon to hear responses
6. **Quick Actions**: Use predefined symptom buttons
7. **Emergency**: Use emergency button for urgent situations

### 📹 Video Consultations
1. **Book Appointment**: Schedule appointment with video option
2. **Join Call**: Click on appointment to join video call
3. **Call Controls**: Use mute, video toggle, screen share
4. **Network Status**: Monitor connection quality
5. **End Call**: Properly end call to save records

### 🆔 NABHA Health Card
1. **Generate Card**: ASHA workers can generate for patients
2. **View Card**: Patients can view their digital health card
3. **QR Code**: Scan QR code to access health records
4. **Update Information**: Keep health information current
5. **Emergency Data**: Critical information for emergencies

### 💊 Medicine Orders
1. **Browse Medicines**: Search and filter available medicines
2. **Add to Cart**: Select medicines and quantities
3. **Upload Prescription**: Upload doctor's prescription
4. **Checkout**: Complete order with delivery details
5. **Track Order**: Monitor order status and delivery

### 📅 Appointment Booking
1. **Select Doctor**: Choose from available doctors
2. **Pick Time Slot**: Select available appointment time
3. **Add Details**: Provide symptoms and reason for visit
4. **Confirm Booking**: Review and confirm appointment
5. **Receive Reminders**: Get SMS/email reminders

## 📁 Project Structure

```
SWASTHYAMITRA/
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Auth/        # Authentication components
│   │   │   ├── Layout/      # Layout components (Navbar, Sidebar)
│   │   │   ├── VideoCall/   # Video calling components
│   │   │   └── Reviews/     # Review system components
│   │   ├── contexts/        # React Context providers
│   │   │   ├── ThemeContext.js
│   │   │   ├── NotificationContext.js
│   │   │   ├── VideoCallContext.js
│   │   │   ├── HealthAssistantContext.js
│   │   │   └── AppointmentContext.js
│   │   ├── pages/           # Page components
│   │   │   ├── Auth/        # Login, Register pages
│   │   │   ├── Patient/     # Patient-specific pages
│   │   │   ├── Doctor/      # Doctor-specific pages
│   │   │   ├── ASHA/        # ASHA worker pages
│   │   │   ├── Pharmacy/    # Pharmacy pages
│   │   │   ├── Admin/       # Admin pages
│   │   │   └── Common/      # Shared pages (AI Assistant, etc.)
│   │   ├── store/           # Redux store
│   │   │   ├── slices/      # Redux slices
│   │   │   └── store.js     # Store configuration
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── translations/    # Language files
├── backend/                 # Node.js backend application
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── controllers/         # Route controllers
│   └── utils/               # Backend utilities
├── docs/                    # Documentation
├── CONTRIBUTING.md          # Contribution guidelines
├── DEMO_CREDENTIALS.md      # Demo account information
├── VIDEO_CALLING_GUIDE.md   # Video calling setup guide
└── LICENSE                  # MIT License
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Health Assistant
- `POST /api/health-assistant/conversation/start` - Start AI conversation
- `POST /api/health-assistant/conversation/message` - Send message to AI
- `GET /api/health-assistant/medicine-reminders` - Get medicine reminders

### Video Calls
- `POST /api/video-calls/create` - Create video call session
- `GET /api/video-calls/:id` - Get call details
- `POST /api/video-calls/:id/join` - Join video call

### Medicine Orders
- `GET /api/medicine-orders` - Get medicine orders
- `POST /api/medicine-orders` - Create medicine order
- `PUT /api/medicine-orders/:id` - Update order status

### NABHA Cards
- `POST /api/nabha-cards/generate` - Generate NABHA card
- `GET /api/nabha-cards/:id` - Get NABHA card details
- `PUT /api/nabha-cards/:id` - Update NABHA card

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variables

### Backend Deployment (Heroku/Railway)
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables
5. Configure MongoDB Atlas connection

### Environment Variables Required
```env
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/swasthyamitra
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_VIDEO_CALL_URL=wss://your-webrtc-server.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact: [Your Email/Contact Info]

## 🌟 Acknowledgments

- Built for rural healthcare in India
- Inspired by the need for accessible telemedicine
- Open source for community benefit

---

**Made with ❤️ for rural healthcare**
