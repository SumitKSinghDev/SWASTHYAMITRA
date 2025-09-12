import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Phone, 
  Calendar, 
  MapPin, 
  Heart, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus
} from 'lucide-react';

const DoctorPatients = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);
  const [showBookAppointmentModal, setShowBookAppointmentModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  
  // Mock data - in real app, this would come from API calls
  const patients = [
    {
      id: 1,
      name: 'Ram Singh',
      phone: '9876543210',
      age: 45,
      gender: 'Male',
      nabhaCardId: 'NABHA001234',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-01-22',
      status: 'active',
      conditions: ['Diabetes', 'Hypertension'],
      emergencyContact: 'Sunita Singh (Wife) - 9876543211',
      address: '123 Main Street, Nabha, Punjab',
      bloodGroup: 'B+',
      allergies: 'None',
      totalVisits: 12,
      lastPrescription: 'RX001234'
    },
    {
      id: 2,
      name: 'Sunita Devi',
      phone: '9876543211',
      age: 32,
      gender: 'Female',
      nabhaCardId: 'NABHA001235',
      lastVisit: '2024-01-20',
      nextAppointment: '2024-02-20',
      status: 'active',
      conditions: ['Hypertension'],
      emergencyContact: 'Rajesh Kumar (Husband) - 9876543212',
      address: '456 Health Lane, Nabha, Punjab',
      bloodGroup: 'A+',
      allergies: 'Penicillin',
      totalVisits: 8,
      lastPrescription: 'RX001235'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      phone: '9876543212',
      age: 28,
      gender: 'Male',
      nabhaCardId: 'NABHA001236',
      lastVisit: '2024-01-18',
      nextAppointment: '2024-02-18',
      status: 'active',
      conditions: ['Type 1 Diabetes'],
      emergencyContact: 'Priya Sharma (Sister) - 9876543213',
      address: '789 Care Street, Nabha, Punjab',
      bloodGroup: 'O+',
      allergies: 'None',
      totalVisits: 15,
      lastPrescription: 'RX001236'
    },
    {
      id: 4,
      name: 'Priya Sharma',
      phone: '9876543213',
      age: 55,
      gender: 'Female',
      nabhaCardId: 'NABHA001237',
      lastVisit: '2024-01-10',
      nextAppointment: null,
      status: 'inactive',
      conditions: ['High Cholesterol'],
      emergencyContact: 'Amit Kumar (Son) - 9876543212',
      address: '321 Wellness Road, Nabha, Punjab',
      bloodGroup: 'AB+',
      allergies: 'None',
      totalVisits: 6,
      lastPrescription: 'RX001237'
    },
    {
      id: 5,
      name: 'Rajesh Kumar',
      phone: '9876543214',
      age: 40,
      gender: 'Male',
      nabhaCardId: 'NABHA001238',
      lastVisit: '2024-01-12',
      nextAppointment: '2024-01-25',
      status: 'active',
      conditions: ['Fever', 'Cough'],
      emergencyContact: 'Sunita Devi (Wife) - 9876543211',
      address: '654 Medical Avenue, Nabha, Punjab',
      bloodGroup: 'B-',
      allergies: 'Dust',
      totalVisits: 3,
      lastPrescription: 'RX001238'
    }
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.nabhaCardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Click handlers
  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleMedicalHistory = (patient) => {
    setSelectedPatient(patient);
    setShowMedicalHistoryModal(true);
  };

  const handleBookAppointment = (patient) => {
    setSelectedPatient(patient);
    setShowBookAppointmentModal(true);
  };

  const handleWritePrescription = (patient) => {
    setSelectedPatient(patient);
    setShowPrescriptionModal(true);
  };

  const handleAddPatient = () => {
    // Navigate to add patient page or show modal
    console.log('Add new patient');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'inactive':
        return <AlertCircle size={16} className="text-gray-600" />;
      case 'emergency':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage your patient records and medical history</p>
        </div>
        <button className="btn btn-primary mt-4 sm:mt-0">
          <UserPlus size={20} className="mr-2" />
          Add Patient
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar size={24} className="text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.nextAppointment).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText size={24} className="text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.reduce((sum, p) => sum + p.totalVisits, 0)}
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
                  placeholder="Search by patient name, NABHA card ID, or phone..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="space-y-4">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="card">
            <div className="card-content">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {getStatusIcon(patient.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {patient.age} years, {patient.gender}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Contact</p>
                          <div className="flex items-center">
                            <Phone size={16} className="mr-2" />
                            <span>{patient.phone}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin size={16} className="mr-2" />
                            <span className="text-xs">{patient.address}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Medical Info</p>
                          <div className="flex items-center">
                            <Heart size={16} className="mr-2" />
                            <span>Blood Group: {patient.bloodGroup}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Allergies: {patient.allergies}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">NABHA Card</p>
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {patient.nabhaCardId}
                          </span>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Visits</p>
                          <span className="text-sm">{patient.totalVisits} total visits</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="font-medium text-gray-900 mb-1">Medical Conditions</p>
                        <div className="flex flex-wrap gap-1">
                          {patient.conditions.map((condition, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Last Visit</p>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            <span>{patient.lastVisit}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Next Appointment</p>
                          <div className="flex items-center">
                            <Clock size={16} className="mr-2" />
                            <span>{patient.nextAppointment || 'Not scheduled'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="font-medium text-gray-900 mb-1">Emergency Contact</p>
                        <p className="text-sm text-gray-600">{patient.emergencyContact}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => handleViewDetails(patient)}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </button>
                    <button 
                      onClick={() => handleMedicalHistory(patient)}
                      className="btn btn-outline btn-sm"
                    >
                      <FileText size={16} className="mr-2" />
                      Medical History
                    </button>
                    <button 
                      onClick={() => handleBookAppointment(patient)}
                      className="btn btn-outline btn-sm"
                    >
                      <Calendar size={16} className="mr-2" />
                      Book Appointment
                    </button>
                    <button 
                      onClick={() => handleWritePrescription(patient)}
                      className="btn btn-outline btn-sm"
                    >
                      <FileText size={16} className="mr-2" />
                      Write Prescription
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No patients have been registered yet.'
            }
          </p>
          <button 
            onClick={handleAddPatient}
            className="btn btn-primary"
          >
            <UserPlus size={20} className="mr-2" />
            Add First Patient
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
