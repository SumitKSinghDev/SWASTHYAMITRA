import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Users, 
  Calendar, 
  UserPlus, 
  QrCode, 
  MapPin,
  Phone,
  Clock,
  CheckCircle
} from 'lucide-react';

const AshaDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  
  // Initialize stats to zero for new users; replace with API data when available
  const stats = {
    totalPatients: 0,
    newPatientsThisMonth: 0,
    appointmentsBooked: 0,
    nabhaCardsGenerated: 0
  };

  const recentPatients = [];

  const upcomingAppointments = [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {t('welcome_back')}, {user.firstName}!
        </h1>
        <p className="text-blue-100">
          {t('asha_worker')} - {user.area} | {user.village}
        </p>
        <div className="flex items-center mt-2 text-blue-100">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">Nabha, Punjab</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('total_patients')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('new_this_month')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newPatientsThisMonth}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('appointments')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appointmentsBooked}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <QrCode size={24} className="text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('nabha_cards')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.nabhaCardsGenerated}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">{t('quick_actions')}</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/asha/register-offline-patient"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <UserPlus size={24} className="text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">{t('register_patient')}</h3>
                <p className="text-sm text-gray-600">{t('add_new_offline_patient')}</p>
              </div>
            </Link>

            <Link
              to="/asha/patients"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users size={24} className="text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">{t('view_patients')}</h3>
                <p className="text-sm text-gray-600">{t('manage_patient_records')}</p>
              </div>
            </Link>

            <Link
              to="/asha/appointments"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Calendar size={24} className="text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">{t('book_appointment')}</h3>
                <p className="text-sm text-gray-600">{t('schedule_consultations')}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Patients */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">{t('recent_patients')}</h2>
            <Link
              to="/asha/patients"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {t('view_all')}
            </Link>
          </div>
          <div className="card-content">
            {recentPatients.length === 0 ? (
              <p className="text-sm text-gray-600">{t('no_recent_patients_yet')}</p>
            ) : (
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users size={20} className="text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                        <p className="text-xs text-gray-500">{patient.village}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        patient.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {patient.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{patient.registeredDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">{t('upcoming_appointments')}</h2>
            <Link
              to="/asha/appointments"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {t('view_all')}
            </Link>
          </div>
          <div className="card-content">
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-gray-600">{t('no_upcoming_appointments')}</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar size={20} className="text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                        <p className="text-xs text-gray-500">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{appointment.date}</p>
                      <p className="text-sm text-gray-600">{appointment.time}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AshaDashboard;
