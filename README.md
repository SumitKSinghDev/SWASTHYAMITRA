# CODE4CARE Telemedicine Web Platform

A comprehensive telemedicine platform designed for rural healthcare in Nabha, Punjab, featuring unique NABHA Health Card system and multilingual AI support.

## 🎯 Key Features

- **NABHA Health Card System**: Unique QR code-based identity for patients
- **Multi-Role Support**: Patient, Doctor, ASHA Worker, Pharmacy, Admin
- **Multilingual AI Chatbot**: Punjabi, Hindi, English support with voice
- **Offline-First Design**: SMS/USSD fallback for areas with poor internet
- **Medicine Sync**: Real-time pharmacy integration with delivery tracking
- **ASHA Worker Integration**: Support for non-digital patients

## 🛠️ Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- Redux Toolkit for state management
- React Router for navigation

### Backend
- Node.js with Express.js
- MongoDB Atlas with Mongoose
- JWT authentication
- BCrypt for password hashing

### AI & Communication
- Python FastAPI microservice
- Twilio/MSG91 for SMS/USSD
- Firebase for notifications

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env` in both `backend/` and `frontend/` directories
   - Configure your MongoDB Atlas connection string
   - Set up Twilio credentials for SMS functionality

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
code4care-telemedicine/
├── frontend/          # React.js frontend application
├── backend/           # Node.js backend API
├── ai-service/        # Python AI chatbot microservice
├── docs/             # Documentation and API specs
└── deployment/       # Deployment configurations
```

## 🔐 User Roles

1. **Patient**: Register, view NABHA card, book consultations, view prescriptions
2. **Doctor**: Manage slots, view patient records, prescribe medications
3. **ASHA Worker**: Register offline patients, generate NABHA cards
4. **Pharmacy**: Manage stock, sync prescriptions, handle deliveries
5. **Admin**: User management, system monitoring, reports

## 🌐 Deployment

- **Backend**: Deployed on Render
- **Frontend**: Deployed on Netlify/Vercel
- **Database**: MongoDB Atlas
- **AI Service**: AWS EC2

## 📱 Offline Support

The platform includes comprehensive offline support:
- SMS notifications via Twilio
- USSD integration for basic interactions
- Offline-first design principles
- Progressive Web App (PWA) capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please contact the CODE4CARE development team.
