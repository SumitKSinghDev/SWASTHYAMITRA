import React from 'react';
import { Calendar, Users, FileText, Video, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const DoctorDashboard = () => {
  const { t } = useTranslation();
  const stats = {
    todayAppointments: 0,
    upcoming: 0,
    patientsThisMonth: 0,
    pendingPrescriptions: 0,
  };

  const todayAppointments = [];

  const getStatusChip = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Confirmed</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">In Progress</span>;
      case 'scheduled':
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">Scheduled</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('doctor_dashboard')}</h1>
        <p className="text-gray-600">{t('doctor_dashboard_description')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              <p className="text-gray-600">{t('today_appointments')}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.patientsThisMonth}</p>
              <p className="text-gray-600">{t('patients_this_month')}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPrescriptions}</p>
              <p className="text-gray-600">{t('pending_prescriptions')}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Video className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              <p className="text-gray-600">{t('upcoming_calls')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today Appointments */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t('todays_appointments')}</h3>
        </div>
        <div className="card-content">
          {todayAppointments.length === 0 ? (
            <p className="text-sm text-gray-600">{t('no_appointments_yet')}</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {todayAppointments.map(appt => (
                <div key={appt.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appt.patient}</p>
                      <div className="text-sm text-gray-600 flex items-center space-x-3">
                        <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{appt.time}</span>
                        <span>{appt.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusChip(appt.status)}
                    <button className="btn btn-outline btn-sm">{t('view')}</button>
                    <button className="btn btn-primary btn-sm">{t('start')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t('quick_actions')}</h3>
        </div>
        <div className="card-content grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn btn-outline w-full">{t('new_prescription')}</button>
          <button className="btn btn-outline w-full">{t('schedule_slot')}</button>
          <button className="btn btn-outline w-full">{t('create_call')}</button>
          <button className="btn btn-outline w-full">{t('view_reports')}</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
