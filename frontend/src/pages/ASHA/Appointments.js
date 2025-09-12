import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus,
  Clock,
  User,
  Phone,
  MapPin,
  Video,
  PhoneCall,
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

const AshaAppointments = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Mock data - in real app, this would come from API calls
  const appointments = [
    {
      id: 1,
      patientName: 'Ram Singh',
      patientPhone: '9876543210',
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialization: 'General Medicine',
      scheduledDate: '2024-01-20',
      scheduledTime: '10:00 AM',
      consultationType: 'video',
      reason: 'Fever and cough',
      status: 'scheduled',
      notes: 'Patient has been experiencing symptoms for 3 days'
    },
    {
      id: 2,
      patientName: 'Sunita Devi',
      patientPhone: '9876543211',
      doctorName: 'Dr. Rajesh Kumar',
      doctorSpecialization: 'Cardiology',
      scheduledDate: '2024-01-21',
      scheduledTime: '2:30 PM',
      consultationType: 'in_person',
      reason: 'Chest pain',
      status: 'confirmed',
      notes: 'Follow-up appointment for heart condition'
    },
    {
      id: 3,
      patientName: 'Amit Kumar',
      patientPhone: '9876543212',
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialization: 'General Medicine',
      scheduledDate: '2024-01-19',
      scheduledTime: '11:00 AM',
      consultationType: 'audio',
      reason: 'Diabetes management',
      status: 'completed',
      notes: 'Regular checkup for diabetes control'
    },
    {
      id: 4,
      patientName: 'Priya Sharma',
      patientPhone: '9876543213',
      doctorName: 'Dr. Rajesh Kumar',
      doctorSpecialization: 'Cardiology',
      scheduledDate: '2024-01-18',
      scheduledTime: '3:00 PM',
      consultationType: 'video',
      reason: 'Blood pressure check',
      status: 'cancelled',
      notes: 'Patient cancelled due to emergency'
    }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patientPhone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesType = filterType === 'all' || appointment.consultationType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Click handlers
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleCall = (appointment) => {
    console.log('Calling patient:', appointment.patientPhone);
    // In real app, this would initiate a call
  };

  const handleMessage = (appointment) => {
    console.log('Messaging patient:', appointment.patientPhone);
    // In real app, this would open messaging interface
  };

  const handleConfirm = (appointment) => {
    console.log('Confirming appointment:', appointment.id);
    // In real app, this would update appointment status
  };

  const handleCancel = (appointment) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      console.log('Cancelling appointment:', appointment.id);
      // In real app, this would update appointment status
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={16} className="text-blue-600" />;
      case 'audio':
        return <PhoneCall size={16} className="text-green-600" />;
      case 'in_person':
        return <User size={16} className="text-purple-600" />;
      case 'chat':
        return <MessageSquare size={16} className="text-orange-600" />;
      default:
        return <Calendar size={16} className="text-gray-600" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'video':
        return 'Video Call';
      case 'audio':
        return 'Audio Call';
      case 'in_person':
        return 'In-Person';
      case 'chat':
        return 'Chat';
      default:
        return type;
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage appointments for your patients</p>
        </div>
        <Link
          to="/asha/appointments/book"
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus size={20} className="mr-2" />
          Book New Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar size={24} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock size={24} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle size={24} className="text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, doctor, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Types</option>
                <option value="video">Video Call</option>
                <option value="audio">Audio Call</option>
                <option value="in_person">In-Person</option>
                <option value="chat">Chat</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="card">
            <div className="card-content">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(appointment.consultationType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patientName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Doctor</p>
                          <p>{appointment.doctorName} - {appointment.doctorSpecialization}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Date & Time</p>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            {appointment.scheduledDate} at {appointment.scheduledTime}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Contact</p>
                          <div className="flex items-center">
                            <Phone size={16} className="mr-2" />
                            {appointment.patientPhone}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Type</p>
                          <div className="flex items-center">
                            {getTypeIcon(appointment.consultationType)}
                            <span className="ml-2">{getTypeLabel(appointment.consultationType)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="font-medium text-gray-900 mb-1">Reason</p>
                        <p className="text-sm text-gray-600">{appointment.reason}</p>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-900 mb-1">Notes</p>
                          <p className="text-sm text-gray-600">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewDetails(appointment)}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye size={16} className="mr-2" />
                      View
                    </button>
                    {appointment.status === 'scheduled' && (
                      <button 
                        onClick={() => handleConfirm(appointment)}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Confirm
                      </button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <button 
                        onClick={() => console.log('Completing appointment:', appointment.id)}
                        className="btn btn-success btn-sm"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by booking an appointment for your patient.'
            }
          </p>
          <Link
            to="/asha/appointments/book"
            className="btn btn-primary"
          >
            <Plus size={20} className="mr-2" />
            Book First Appointment
          </Link>
        </div>
      )}
    </div>
  );
};

export default AshaAppointments;
