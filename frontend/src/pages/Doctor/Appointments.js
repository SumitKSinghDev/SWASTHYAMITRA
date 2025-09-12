import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  MapPin,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

const DoctorAppointments = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  
  // Mock data - in real app, this would come from API calls
  const appointments = [
    {
      id: 1,
      patientName: 'Ram Singh',
      patientPhone: '9876543210',
      patientAge: 45,
      appointmentDate: '2024-01-22',
      appointmentTime: '09:00',
      status: 'scheduled',
      type: 'consultation',
      reason: 'Regular checkup',
      notes: 'Patient has diabetes, needs blood sugar monitoring',
      nabhaCardId: 'NABHA001234'
    },
    {
      id: 2,
      patientName: 'Sunita Devi',
      patientPhone: '9876543211',
      patientAge: 32,
      appointmentDate: '2024-01-22',
      appointmentTime: '10:00',
      status: 'confirmed',
      type: 'follow_up',
      reason: 'Follow-up for hypertension',
      notes: 'Blood pressure check required',
      nabhaCardId: 'NABHA001235'
    },
    {
      id: 3,
      patientName: 'Amit Kumar',
      patientPhone: '9876543212',
      patientAge: 28,
      appointmentDate: '2024-01-22',
      appointmentTime: '11:00',
      status: 'in_progress',
      type: 'consultation',
      reason: 'Chest pain',
      notes: 'Emergency consultation',
      nabhaCardId: 'NABHA001236'
    },
    {
      id: 4,
      patientName: 'Priya Sharma',
      patientPhone: '9876543213',
      patientAge: 55,
      appointmentDate: '2024-01-22',
      appointmentTime: '14:00',
      status: 'completed',
      type: 'consultation',
      reason: 'General health check',
      notes: 'Prescription given for vitamins',
      nabhaCardId: 'NABHA001237'
    },
    {
      id: 5,
      patientName: 'Rajesh Kumar',
      patientPhone: '9876543214',
      patientAge: 40,
      appointmentDate: '2024-01-22',
      appointmentTime: '15:00',
      status: 'cancelled',
      type: 'consultation',
      reason: 'Fever',
      notes: 'Patient cancelled due to emergency',
      nabhaCardId: 'NABHA001238'
    }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.nabhaCardId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesDate = appointment.appointmentDate === selectedDate;
    return matchesSearch && matchesFilter && matchesDate;
  });

  // Click handlers
  const handleStatusChange = (appointmentId, newStatus) => {
    console.log(`Changing appointment ${appointmentId} status to ${newStatus}`);
    // In real app, this would make an API call
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleWritePrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Calendar size={16} className="text-blue-600" />;
      case 'confirmed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'in_progress':
        return <Clock size={16} className="text-yellow-600" />;
      case 'completed':
        return <CheckCircle2 size={16} className="text-gray-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Calendar size={16} className="text-gray-600" />;
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
          <p className="text-gray-600">Manage your patient appointments and consultations</p>
        </div>
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle2 size={24} className="text-gray-600" />
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
                  placeholder="Search by patient name or NABHA card ID..."
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
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="sm:w-48">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input w-full"
              />
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
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patientName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {appointment.type}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Patient Details</p>
                          <div className="flex items-center">
                            <User size={16} className="mr-2" />
                            <span>{appointment.patientName}, {appointment.patientAge} years</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Phone size={16} className="mr-2" />
                            <span>{appointment.patientPhone}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Appointment Details</p>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            <span>{appointment.appointmentDate}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock size={16} className="mr-2" />
                            <span>{appointment.appointmentTime}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">NABHA Card</p>
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {appointment.nabhaCardId}
                          </span>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Reason</p>
                          <span className="text-sm">{appointment.reason}</span>
                        </div>
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
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => handleViewDetails(appointment)}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </button>
                    {appointment.status === 'scheduled' && (
                      <button 
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                        className="btn btn-success btn-sm"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Confirm
                      </button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <button 
                        onClick={() => handleStatusChange(appointment.id, 'in_progress')}
                        className="btn btn-primary btn-sm"
                      >
                        <Clock size={16} className="mr-2" />
                        Start
                      </button>
                    )}
                    {appointment.status === 'in_progress' && (
                      <button 
                        onClick={() => handleStatusChange(appointment.id, 'completed')}
                        className="btn btn-success btn-sm"
                      >
                        <CheckCircle2 size={16} className="mr-2" />
                        Complete
                      </button>
                    )}
                    {appointment.status === 'completed' && (
                      <button 
                        onClick={() => handleWritePrescription(appointment)}
                        className="btn btn-outline btn-sm"
                      >
                        <FileText size={16} className="mr-2" />
                        Write Prescription
                      </button>
                    )}
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                      <button 
                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        className="btn btn-outline btn-sm text-red-600 hover:text-red-700"
                      >
                        <X size={16} className="mr-2" />
                        Cancel
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
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : `No appointments are scheduled for ${new Date(selectedDate).toLocaleDateString()}.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
