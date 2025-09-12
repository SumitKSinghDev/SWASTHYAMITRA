import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Printer,
  Send,
  TrendingUp,
  Package,
  DollarSign
} from 'lucide-react';

const AdminPrescriptions = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  
  // Mock data - in real app, this would come from API calls
  const prescriptions = [
    {
      id: 1,
      prescriptionId: 'RX001234',
      patientName: 'Ram Singh',
      patientPhone: '9876543210',
      patientAge: 45,
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialization: 'General Medicine',
      date: '2024-01-22',
      status: 'active',
      type: 'consultation',
      medications: [
        { name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '30 days', price: 150 },
        { name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', price: 300 }
      ],
      diagnosis: 'Type 2 Diabetes, Hypertension',
      notes: 'Take with food. Monitor blood sugar regularly.',
      followUpDate: '2024-02-22',
      totalAmount: 450,
      pharmacyName: 'Nabha Medical Store',
      nabhaCardId: 'NABHA001234'
    },
    {
      id: 2,
      prescriptionId: 'RX001235',
      patientName: 'Sunita Devi',
      patientPhone: '9876543211',
      patientAge: 32,
      doctorName: 'Dr. Rajesh Kumar',
      doctorSpecialization: 'Cardiology',
      date: '2024-01-21',
      status: 'completed',
      type: 'follow_up',
      medications: [
        { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'As needed', duration: '7 days', price: 60 },
        { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '5 days', price: 100 }
      ],
      diagnosis: 'Fever, Body ache',
      notes: 'Take plenty of fluids. Rest well.',
      followUpDate: null,
      totalAmount: 160,
      pharmacyName: 'Nabha Medical Store',
      nabhaCardId: 'NABHA001235'
    },
    {
      id: 3,
      prescriptionId: 'RX001236',
      patientName: 'Amit Kumar',
      patientPhone: '9876543212',
      patientAge: 28,
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialization: 'General Medicine',
      date: '2024-01-20',
      status: 'active',
      type: 'consultation',
      medications: [
        { name: 'Insulin Glargine', dosage: '10 units', frequency: 'Once daily', duration: '30 days', price: 500 },
        { name: 'Metformin 1000mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '30 days', price: 180 }
      ],
      diagnosis: 'Type 1 Diabetes',
      notes: 'Store insulin in refrigerator. Monitor blood sugar before meals.',
      followUpDate: '2024-02-20',
      totalAmount: 680,
      pharmacyName: 'Nabha Medical Store',
      nabhaCardId: 'NABHA001236'
    },
    {
      id: 4,
      prescriptionId: 'RX001237',
      patientName: 'Priya Sharma',
      patientPhone: '9876543213',
      patientAge: 55,
      doctorName: 'Dr. Rajesh Kumar',
      doctorSpecialization: 'Cardiology',
      date: '2024-01-19',
      status: 'expired',
      type: 'consultation',
      medications: [
        { name: 'Atorvastatin 20mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', price: 250 }
      ],
      diagnosis: 'High Cholesterol',
      notes: 'Take at bedtime. Regular exercise recommended.',
      followUpDate: '2024-02-19',
      totalAmount: 250,
      pharmacyName: 'Nabha Medical Store',
      nabhaCardId: 'NABHA001237'
    }
  ];

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    const matchesDoctor = filterDoctor === 'all' || prescription.doctorName === filterDoctor;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  // Click handlers
  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handlePrint = (prescription) => {
    console.log('Printing prescription:', prescription.prescriptionId);
    // In real app, this would open print dialog
  };

  const handleSend = (prescription) => {
    console.log('Sending prescription:', prescription.prescriptionId);
    // In real app, this would send via email/SMS
  };

  const handleAnalytics = (prescription) => {
    console.log('Viewing analytics for prescription:', prescription.prescriptionId);
    // In real app, this would open analytics modal
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-blue-600" />;
      case 'expired':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'cancelled':
        return <AlertCircle size={16} className="text-gray-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const totalRevenue = prescriptions.reduce((sum, p) => sum + p.totalAmount, 0);
  const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
  const completedPrescriptions = prescriptions.filter(p => p.status === 'completed').length;
  const expiredPrescriptions = prescriptions.filter(p => p.status === 'expired').length;

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
          <h1 className="text-2xl font-bold text-gray-900">Prescription Management</h1>
          <p className="text-gray-600">Monitor and manage all prescriptions across the platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={24} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{activePrescriptions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle size={24} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedPrescriptions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign size={24} className="text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
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
                  placeholder="Search by patient name, doctor, prescription ID, or diagnosis..."
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
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Doctors</option>
                <option value="Dr. Priya Sharma">Dr. Priya Sharma</option>
                <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.map((prescription) => (
          <div key={prescription.id} className="card">
            <div className="card-content">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {getStatusIcon(prescription.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {prescription.prescriptionId}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                          {prescription.status}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {prescription.type}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Patient</p>
                          <div className="flex items-center">
                            <User size={16} className="mr-2" />
                            <span>{prescription.patientName}, {prescription.patientAge} years</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {prescription.patientPhone}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            NABHA: {prescription.nabhaCardId}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Doctor</p>
                          <div className="flex items-center">
                            <User size={16} className="mr-2" />
                            <span>{prescription.doctorName}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {prescription.doctorSpecialization}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Date</p>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            <span>{prescription.date}</span>
                          </div>
                          {prescription.followUpDate && (
                            <div className="flex items-center mt-1">
                              <Clock size={16} className="mr-2" />
                              <span className="text-xs">Follow-up: {prescription.followUpDate}</span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Pharmacy</p>
                          <div className="flex items-center">
                            <Package size={16} className="mr-2" />
                            <span>{prescription.pharmacyName}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Total: ₹{prescription.totalAmount}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="font-medium text-gray-900 mb-1">Diagnosis</p>
                        <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                      </div>
                      
                      <div className="mt-3">
                        <p className="font-medium text-gray-900 mb-2">Medications:</p>
                        <div className="space-y-1">
                          {prescription.medications.map((med, index) => (
                            <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                              <div>
                                <span className="font-medium text-gray-900">{med.name}</span>
                                <span className="text-gray-600 ml-2">({med.dosage})</span>
                              </div>
                              <div className="text-right text-xs text-gray-500">
                                <div>{med.frequency} - {med.duration}</div>
                                <div>₹{med.price}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {prescription.notes && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-900 mb-1">Notes</p>
                          <p className="text-sm text-gray-600">{prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => handleViewDetails(prescription)}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </button>
                    <button 
                      onClick={() => handlePrint(prescription)}
                      className="btn btn-outline btn-sm"
                    >
                      <Printer size={16} className="mr-2" />
                      Print
                    </button>
                    <button 
                      onClick={() => handleSend(prescription)}
                      className="btn btn-outline btn-sm"
                    >
                      <Send size={16} className="mr-2" />
                      Send
                    </button>
                    <button 
                      onClick={() => handleAnalytics(prescription)}
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

      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterDoctor !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No prescriptions have been created yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPrescriptions;
