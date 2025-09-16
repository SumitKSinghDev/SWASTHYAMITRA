import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Users, FileText, Video, Clock, CheckCircle, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchAppointments, getTodayAppointments, getUpcomingAppointments, updateAppointmentStatus } from '../../store/slices/appointmentSlice';

const DoctorDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const { 
    todayAppointments, 
    upcomingAppointments, 
    appointments, 
    isLoading, 
    error, 
    stats 
  } = useSelector((state) => state.appointments);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'doctor') {
      dispatch(getTodayAppointments());
      dispatch(getUpcomingAppointments());
      dispatch(fetchAppointments({ status: 'scheduled,confirmed' }));
    }
  }, [dispatch, user?.role]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await dispatch(updateAppointmentStatus({ 
        appointmentId, 
        status: newStatus 
      })).unwrap();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Confirmed</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Cancelled</span>;
      case 'no_show':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700">No Show</span>;
      case 'scheduled':
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Scheduled</span>;
    }
  };

  const formatTime = (timeString) => {
    return timeString || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getConsultationTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Phone className="h-4 w-4" />;
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      case 'chat':
        return <FileText className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
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
              <p className="text-2xl font-bold text-gray-900">{stats.today || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.upcoming || 0}</p>
              <p className="text-gray-600">{t('upcoming_appointments')}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.completed || 0}</p>
              <p className="text-gray-600">{t('completed_appointments')}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Video className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              <p className="text-gray-600">{t('total_appointments')}</p>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading appointments...</span>
            </div>
          ) : todayAppointments.length === 0 ? (
            <p className="text-sm text-gray-600">{t('no_appointments_yet')}</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {todayAppointments.map(appointment => (
                <div key={appointment._id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </p>
                        {appointment.patient?.nabhaId && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {appointment.patient.nabhaId}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center space-x-4 mt-1">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(appointment.scheduledTime)}
                        </span>
                        <span className="flex items-center">
                          {getConsultationTypeIcon(appointment.consultationType)}
                          <span className="ml-1 capitalize">{appointment.consultationType?.replace('_', ' ')}</span>
                        </span>
                        {appointment.patient?.phone && (
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {appointment.patient.phone}
                          </span>
                        )}
                      </div>
                      {appointment.reason && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-md">
                          {appointment.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusChip(appointment.status)}
                    <div className="flex space-x-2">
                      {appointment.status === 'scheduled' && (
                        <button 
                          onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                          className="btn btn-outline btn-sm text-green-600 hover:bg-green-50"
                        >
                          Confirm
                        </button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button 
                          onClick={() => handleStatusUpdate(appointment._id, 'in_progress')}
                          className="btn btn-primary btn-sm"
                        >
                          Start
                        </button>
                      )}
                      {appointment.status === 'in_progress' && (
                        <button 
                          onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                          className="btn btn-success btn-sm"
                        >
                          Complete
                        </button>
                      )}
                      <button className="btn btn-outline btn-sm">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('upcoming_appointments')}</h3>
          </div>
          <div className="card-content">
            <div className="divide-y divide-gray-100">
              {upcomingAppointments.slice(0, 5).map(appointment => (
                <div key={appointment._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                      </p>
                      <div className="text-sm text-gray-600 flex items-center space-x-3">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(appointment.scheduledDate)} at {formatTime(appointment.scheduledTime)}
                        </span>
                        <span className="flex items-center">
                          {getConsultationTypeIcon(appointment.consultationType)}
                          <span className="ml-1 capitalize">{appointment.consultationType?.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusChip(appointment.status)}
                    <button className="btn btn-outline btn-sm">{t('view')}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
