import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Calendar, Clock, MapPin, Video, Phone, Plus, Filter, Search } from 'lucide-react';

const PatientAppointments = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  // Click handlers
  const handleReschedule = (appointment) => {
    console.log('Rescheduling appointment:', appointment.id);
    // In real app, this would open reschedule modal
  };

  const handleCancel = (appointment) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      console.log('Cancelling appointment:', appointment.id);
      // In real app, this would make API call to cancel
    }
  };

  const handleViewPrescription = (appointment) => {
    console.log('Viewing prescription for appointment:', appointment.id);
    // In real app, this would navigate to prescription details
  };

  const handleBookFollowUp = (appointment) => {
    console.log('Booking follow-up for appointment:', appointment.id);
    // In real app, this would navigate to book appointment page
  };

  // Start with no appointments; populate via API when available
  const appointments = [];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'badge-success',
      scheduled: 'badge-primary',
      completed: 'badge-secondary',
      cancelled: 'badge-error'
    };
    return colors[status] || 'badge-secondary';
  };

  const getTypeIcon = (type) => {
    return type === 'Video Consultation' ? Video : Phone;
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && (apt.status === 'confirmed' || apt.status === 'scheduled');
    });
  };

  const getPastAppointments = () => {
    const today = new Date();
    return filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled';
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your healthcare appointments</p>
        </div>
        <Link
          to="/patient/appointments/book"
          className="btn btn-primary group px-6 py-3"
        >
          <Plus size={16} />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by doctor or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Appointments</option>
                <option value="confirmed">Confirmed</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {getUpcomingAppointments().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Appointments</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {getUpcomingAppointments().map((appointment) => {
                const TypeIcon = getTypeIcon(appointment.type);
                return (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-header">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <TypeIcon size={20} className="text-primary-600" />
                          <h4 className="font-medium text-gray-900">{appointment.doctor}</h4>
                          <span className={`badge ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{appointment.specialization}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin size={16} />
                            <span>{appointment.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{appointment.duration}</p>
                        <p className="text-xs text-gray-400">{appointment.type}</p>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    )}
                    <div className="mt-3 flex space-x-2">
                      <button 
                        onClick={() => handleReschedule(appointment)}
                        className="btn btn-outline btn-sm"
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => handleCancel(appointment)}
                        className="btn btn-outline btn-sm text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {getPastAppointments().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Past Appointments</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {getPastAppointments().map((appointment) => {
                const TypeIcon = getTypeIcon(appointment.type);
                return (
                  <div key={appointment.id} className="appointment-card opacity-75">
                    <div className="appointment-header">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <TypeIcon size={20} className="text-gray-500" />
                          <h4 className="font-medium text-gray-700">{appointment.doctor}</h4>
                          <span className={`badge ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{appointment.specialization}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin size={16} />
                            <span>{appointment.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">{appointment.duration}</p>
                        <p className="text-xs text-gray-300">{appointment.type}</p>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500">{appointment.notes}</p>
                      </div>
                    )}
                    {appointment.status === 'completed' && (
                      <div className="mt-3 flex space-x-2">
                        <button 
                          onClick={() => handleViewPrescription(appointment)}
                          className="btn btn-outline btn-sm"
                        >
                          View Prescription
                        </button>
                        <button 
                          onClick={() => handleBookFollowUp(appointment)}
                          className="btn btn-outline btn-sm"
                        >
                          Book Follow-up
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* No Appointments */}
      {filteredAppointments.length === 0 && (
        <div className="card">
          <div className="card-content text-center py-12">
            <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You don\'t have any appointments yet.'
              }
            </p>
            <Link
              to="/patient/appointments/book"
              className="btn btn-primary group px-6 py-3"
            >
              Book Your First Appointment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;