import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Calendar, 
  FileText, 
  Heart, 
  Clock, 
  Plus,
  QrCode
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  
  // Debug: Log user data
  console.log('PatientDashboard - User data:', user);

  // Mock data - in real app, this would come from API calls
  const stats = {
    totalAppointments: 12,
    upcomingAppointments: 3,
    prescriptions: 8,
    healthRecords: 15
  };

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Rajesh Kumar',
      specialization: 'Cardiology',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Video Consultation',
      status: 'confirmed'
    },
    {
      id: 2,
      doctor: 'Dr. Priya Sharma',
      specialization: 'General Practice',
      date: '2024-01-18',
      time: '2:30 PM',
      type: 'In-Person',
      status: 'scheduled'
    }
  ];

  const recentPrescriptions = [
    {
      id: 1,
      doctor: 'Dr. Rajesh Kumar',
      date: '2024-01-10',
      medications: ['Metformin 500mg', 'Amlodipine 5mg'],
      status: 'active'
    },
    {
      id: 2,
      doctor: 'Dr. Priya Sharma',
      date: '2024-01-08',
      medications: ['Paracetamol 500mg'],
      status: 'completed'
    }
  ];

  // Show loading if user data is not available
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-3">
          {t('welcome_back')}, {user?.firstName || 'User'}!
        </h1>
          <p className="text-blue-100 text-lg">
            {t('welcome_back_description')}
          </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/patient/appointments/book"
          className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">{t('book_appointment')}</p>
        </Link>
        
        <Link
          to="/patient/nabha-card"
          className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
            <QrCode className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">{t('nabha_health_card')}</p>
        </Link>
        
        <Link
          to="/patient/prescriptions"
          className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">{t('view_prescriptions')}</p>
        </Link>
        
        <Link
          to="/patient/health-records"
          className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center group"
        >
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
            <Heart className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">{t('health_records')}</p>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total Appointments</p>
              <p className="stats-value">{stats.totalAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Upcoming</p>
              <p className="stats-value">{stats.upcomingAppointments}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Prescriptions</p>
              <p className="stats-value">{stats.prescriptions}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Health Records</p>
              <p className="stats-value">{stats.healthRecords}</p>
            </div>
            <Heart className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h3>
              <Link
                to="/patient/appointments"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-5">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <div>
                      <p className="appointment-time">
                        {appointment.date} at {appointment.time}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {appointment.doctor} - {appointment.specialization}
                      </p>
                    </div>
                    <span className={`appointment-status ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Recent Prescriptions</h3>
              <Link
                to="/patient/prescriptions"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-5">
              {recentPrescriptions.map((prescription) => (
                <div key={prescription.id} className="prescription-card">
                  <div className="prescription-header">
                    <div>
                      <p className="prescription-id">RX{prescription.id.toString().padStart(6, '0')}</p>
                      <p className="text-sm text-gray-600">
                        {prescription.doctor} - {prescription.date}
                      </p>
                    </div>
                    <span className={`badge ${
                      prescription.status === 'active' ? 'badge-success' : 'badge-secondary'
                    }`}>
                      {prescription.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      {prescription.medications.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NABHA Card Preview */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your NABHA Health Card</h3>
        </div>
        <div className="card-content">
          <div className="nabha-card">
            <div className="nabha-card-header">
              <h4 className="nabha-card-title">NABHA Health Card</h4>
              <span className="nabha-card-id">NABHA123456</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-primary-800">
                  {user?.firstName || 'Demo'} {user?.lastName || 'User'}
                </p>
                <p className="text-sm text-primary-600">{user?.phone || '9876543210'}</p>
              </div>
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                <QrCode className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/patient/nabha-card"
                className="btn btn-outline btn-sm"
              >
                View Full Card
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
