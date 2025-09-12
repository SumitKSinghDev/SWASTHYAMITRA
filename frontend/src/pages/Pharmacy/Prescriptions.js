import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Package,
  User,
  Calendar,
  Phone,
  AlertCircle
} from 'lucide-react';

const PharmacyPrescriptions = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  
  // Mock data - in real app, this would come from API calls
  const prescriptions = [
    {
      id: 1,
      prescriptionId: 'RX001234',
      patientName: 'Ram Singh',
      patientPhone: '9876543210',
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialization: 'General Medicine',
      date: '2024-01-20',
      status: 'pending',
      totalAmount: 450,
      medications: [
        { name: 'Metformin 500mg', quantity: 30, price: 150 },
        { name: 'Amlodipine 5mg', quantity: 15, price: 300 }
      ],
      notes: 'Take with food'
    },
    {
      id: 2,
      prescriptionId: 'RX001235',
      patientName: 'Sunita Devi',
      patientPhone: '9876543211',
      doctorName: 'Dr. Rajesh Kumar',
      doctorSpecialization: 'Cardiology',
      date: '2024-01-20',
      status: 'completed',
      totalAmount: 320,
      medications: [
        { name: 'Paracetamol 500mg', quantity: 20, price: 120 },
        { name: 'Ibuprofen 400mg', quantity: 10, price: 200 }
      ],
      notes: 'As needed for pain'
    },
    {
      id: 3,
      prescriptionId: 'RX001236',
      patientName: 'Amit Kumar',
      patientPhone: '9876543212',
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialization: 'General Medicine',
      date: '2024-01-19',
      status: 'in_progress',
      totalAmount: 680,
      medications: [
        { name: 'Insulin Glargine', quantity: 1, price: 500 },
        { name: 'Metformin 1000mg', quantity: 30, price: 180 }
      ],
      notes: 'Store insulin in refrigerator'
    },
    {
      id: 4,
      prescriptionId: 'RX001237',
      patientName: 'Priya Sharma',
      patientPhone: '9876543213',
      doctorName: 'Dr. Rajesh Kumar',
      doctorSpecialization: 'Cardiology',
      date: '2024-01-18',
      status: 'cancelled',
      totalAmount: 250,
      medications: [
        { name: 'Atorvastatin 20mg', quantity: 15, price: 250 }
      ],
      notes: 'Patient cancelled order'
    }
  ];

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Click handlers
  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handleStartFulfilling = (prescription) => {
    console.log('Starting to fulfill prescription:', prescription.prescriptionId);
    // In real app, this would update prescription status
  };

  const handleMarkComplete = (prescription) => {
    console.log('Marking prescription as complete:', prescription.prescriptionId);
    // In real app, this would update prescription status
  };

  const handleViewInvoice = (prescription) => {
    console.log('Viewing invoice for prescription:', prescription.prescriptionId);
    // In real app, this would open invoice modal
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'in_progress':
        return <Package size={16} className="text-blue-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600">Manage and fulfill prescription orders</p>
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 'pending').length}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package size={24} className="text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 'in_progress').length}
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
                  placeholder="Search by patient name, prescription ID, or doctor..."
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
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Patient</p>
                          <div className="flex items-center">
                            <User size={16} className="mr-2" />
                            <span>{prescription.patientName}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Phone size={16} className="mr-2" />
                            <span>{prescription.patientPhone}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Doctor</p>
                          <p>{prescription.doctorName}</p>
                          <p className="text-xs text-gray-500">{prescription.doctorSpecialization}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Date</p>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            <span>{prescription.date}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Total Amount</p>
                          <p className="text-lg font-semibold text-green-600">₹{prescription.totalAmount}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="font-medium text-gray-900 mb-2">Medications:</p>
                        <div className="space-y-1">
                          {prescription.medications.map((med, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{med.name} x{med.quantity}</span>
                              <span className="text-gray-500">₹{med.price}</span>
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
                    {prescription.status === 'pending' && (
                      <button 
                        onClick={() => handleStartFulfilling(prescription)}
                        className="btn btn-primary btn-sm"
                      >
                        <Package size={16} className="mr-2" />
                        Start Fulfilling
                      </button>
                    )}
                    {prescription.status === 'in_progress' && (
                      <button 
                        onClick={() => handleMarkComplete(prescription)}
                        className="btn btn-success btn-sm"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Mark Complete
                      </button>
                    )}
                    {prescription.status === 'completed' && (
                      <button 
                        onClick={() => handleViewInvoice(prescription)}
                        className="btn btn-outline btn-sm"
                      >
                        <Package size={16} className="mr-2" />
                        View Invoice
                      </button>
                    )}
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
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No prescriptions have been assigned to your pharmacy yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PharmacyPrescriptions;
