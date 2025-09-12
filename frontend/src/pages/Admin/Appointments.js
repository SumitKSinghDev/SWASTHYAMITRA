import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Calendar, 
  Search, 
  Filter, 
  Eye,
  User,
  Phone,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';

const AdminAppointments = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  
  // Mock data - in real app, this would come from API calls
  const appointments = [
    {
      id: 1,
      appointmentId: 'APT001234',
      patientName: 'Ram Singh',
      patientPhone: '9876543210',
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialization: 'General Medicine',
      appointmentDate: '2024-01-22',
      appointmentTime: '09:00',
      status: 'scheduled',
      type: 'consultation',
      reason: 'Regular checkup',
      nabhaCardId: 'NABHA001234',
      location: 'Clinic A',
      notes: 'Patient has diabetes, needs blood sugar monitoring',
      createdBy: 'patient',
      createdAt: '2024-01-20 14:30'
    },
    {
      id: 2,
      appointmentId: 'APT001235',
      patientName: 'Sunita Devi',
      patientPhone: '9876543211',
      doctorName: 'Dr. Rajesh Kumar',
      doctorSpecialization: 'Cardiology',
      appointmentDate: '2024-01-22',
      appointmentTime: '10:00',
      status: 'confirmed',
      type: 'follow_up',
      reason: 'Follow-up for hypertension',
      nabhaCardId: 'NABHA001235',
      location: 'Clinic B',
      notes: 'Blood pressure check required',
      createdBy: 'asha',
      createdAt: '2024-01-21 09:15'
    },
    {
      id: 3,
      appointmentId: 'APT001236',
      patientName: 'Amit Kumar',
      patientPhone: '9876543212',
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialization: 'General Medicine',
      appointmentDate: '2024-01-22',
      appointmentTime: '11:00',
      status: 'in_progress',
      type: 'consultation',
      reason: 'Chest pain',
      nabhaCardId: 'NABHA001236',
      location: 'Emergency Room',
      notes: 'Emergency consultation',
      createdBy: 'patient',
      createdAt: '2024-01-22 10:45'
    },
    {
      id: 4,
      appointmentId: 'APT001237',
      patientName: 'Priya Sharma',
      patientPhone: '9876543213',
      doctorName: 'Dr. Rajesh Kumar',
      doctorSpecialization: 'Cardiology',
      appointmentDate: '2024-01-21',
      appointmentTime: '14:00',
      status: 'completed',
      type: 'consultation',
      reason: 'General health check',
      nabhaCardId: 'NABHA001237',
      location: 'Clinic A',
      notes: 'Prescription given for vitamins',
      createdBy: 'patient',
      createdAt: '2024-01-20 16:20'
    },
    {
      id: 5,
      appointmentId: 'APT001238',
      patientName: 'Rajesh Kumar',
      patientPhone: '9876543214',
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialization: 'General Medicine',
      appointmentDate: '2024-01-21',
      appointmentTime: '15:00',
      status: 'cancelled',
      type: 'consultation',
      reason: 'Fever',
      nabhaCardId: 'NABHA001238',
      location: 'Clinic A',
      notes: 'Patient cancelled due to emergency',
      createdBy: 'asha',
      createdAt: '2024-01-21 08:30'
    }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.appointmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.nabhaCardId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesRole = filterRole === 'all' || appointment.createdBy === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Click handlers
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleViewPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionModal(true);
  };

  const handlePatientHistory = (appointment) => {
    setSelectedAppointment(appointment);
    setShowHistoryModal(true);
  };

  const handleAnalytics = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAnalyticsModal(true);
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
        return <CheckCircle size={16} className="text-gray-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Calendar size={16} className="text-gray-600" />;
    }
  };

  const getCreatedByColor = (createdBy) => {
    switch (createdBy) {
      case 'patient':
        return 'bg-orange-100 text-orange-800';
      case 'asha':
        return 'bg-purple-100 text-purple-800';
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600">Monitor and manage all appointments across the platform</p>
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
                  placeholder="Search by patient name, doctor, appointment ID, or NABHA card..."
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
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Creators</option>
                <option value="patient">Patient Created</option>
                <option value="asha">ASHA Created</option>
                <option value="doctor">Doctor Created</option>
                <option value="admin">Admin Created</option>
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
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.appointmentId}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCreatedByColor(appointment.createdBy)}`}>
                          Created by {appointment.createdBy}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Patient</p>
                          <div className="flex items-center">
                            <User size={16} className="mr-2" />
                            <span>{appointment.patientName}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Phone size={16} className="mr-2" />
                            <span>{appointment.patientPhone}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            NABHA: {appointment.nabhaCardId}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Doctor</p>
                          <div className="flex items-center">
                            <User size={16} className="mr-2" />
                            <span>{appointment.doctorName}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {appointment.doctorSpecialization}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Appointment</p>
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
                          <p className="font-medium text-gray-900 mb-1">Location</p>
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-2" />
                            <span>{appointment.location}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Type: {appointment.type}
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
                      
                      <div className="mt-3 text-xs text-gray-500">
                        Created: {appointment.createdAt}
                      </div>
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
                    <button 
                      onClick={() => handleViewPrescription(appointment)}
                      className="btn btn-outline btn-sm"
                    >
                      <FileText size={16} className="mr-2" />
                      View Prescription
                    </button>
                    <button 
                      onClick={() => handlePatientHistory(appointment)}
                      className="btn btn-outline btn-sm"
                    >
                      <Users size={16} className="mr-2" />
                      Patient History
                    </button>
                    <button 
                      onClick={() => handleAnalytics(appointment)}
                      className="btn btn-outline btn-sm"
                    >
                      <TrendingUp size={16} className="mr-2" />
                      Analytics
                    </button>
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
            {searchTerm || filterStatus !== 'all' || filterRole !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No appointments have been created yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
