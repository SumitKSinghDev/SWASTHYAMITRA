# SWASTHYAMITRA Telemedicine Web Platform

A comprehensive telemedicine platform designed for rural healthcare, featuring unique NABHA Health Card system and multilingual AI support.

## 🌟 Features

- **NABHA Health Card System**: Unique QR code-based identity for patients
- **Multi-Role Support**: Patient, Doctor, ASHA Worker, Pharmacy, Admin
- **Multilingual Support**: Punjabi, Hindi, English
- **Offline-First Design**: SMS/USSD fallback for areas with poor internet
- **Medicine Sync**: Real-time pharmacy integration with delivery tracking
- **ASHA Worker Integration**: Support for non-digital patients

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

## 👥 User Roles

1. **Patient**: Register, view NABHA card, book consultations, view prescriptions
2. **Doctor**: Manage slots, view patient records, prescribe medications
3. **ASHA Worker**: Register offline patients, generate NABHA cards
4. **Pharmacy**: Manage stock, sync prescriptions, handle deliveries
5. **Admin**: User management, system monitoring, reports

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

## 📱 Demo Accounts

For testing purposes, you can use these demo accounts:

- **Patient**: `patient@demo.com` / `password123`
- **Doctor**: `doctor@demo.com` / `password123`
- **ASHA Worker**: `asha@demo.com` / `password123`
- **Pharmacy**: `pharmacy@demo.com` / `password123`
- **Admin**: `admin@demo.com` / `password123`

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
