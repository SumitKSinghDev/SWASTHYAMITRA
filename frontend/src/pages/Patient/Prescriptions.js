import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, User, Pill, Clock, Filter, Search, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const PatientPrescriptions = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  // Mock data - in real app, this would come from API calls
  const prescriptions = [
    {
      id: 1,
      prescriptionId: 'RX000001',
      doctor: 'Dr. Rajesh Kumar',
      specialization: 'Cardiology',
      date: '2024-01-10',
      status: 'active',
      medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with food'
        },
        {
          name: 'Amlodipine',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take at bedtime'
        }
      ],
      notes: 'Continue current medication. Follow up in 2 weeks.',
      nextRefill: '2024-02-10'
    },
    {
      id: 2,
      prescriptionId: 'RX000002',
      doctor: 'Dr. Priya Sharma',
      specialization: 'General Practice',
      date: '2024-01-08',
      status: 'completed',
      medications: [
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'As needed',
          duration: '7 days',
          instructions: 'Take for fever or pain'
        }
      ],
      notes: 'For fever and body ache. Complete the course.',
      nextRefill: null
    },
    {
      id: 3,
      prescriptionId: 'RX000003',
      doctor: 'Dr. Amit Singh',
      specialization: 'Dermatology',
      date: '2024-01-12',
      status: 'active',
      medications: [
        {
          name: 'Clobetasol Cream',
          dosage: '0.05%',
          frequency: 'Twice daily',
          duration: '14 days',
          instructions: 'Apply thin layer on affected area'
        },
        {
          name: 'Cetirizine',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '14 days',
          instructions: 'Take at bedtime'
        }
      ],
      notes: 'For skin condition. Avoid direct sunlight.',
      nextRefill: '2024-01-26'
    },
    {
      id: 4,
      prescriptionId: 'RX000004',
      doctor: 'Dr. Neha Gupta',
      specialization: 'Pediatrics',
      date: '2024-01-05',
      status: 'expired',
      medications: [
        {
          name: 'Amoxicillin',
          dosage: '250mg',
          frequency: 'Three times daily',
          duration: '10 days',
          instructions: 'Take with food'
        }
      ],
      notes: 'For bacterial infection. Complete full course.',
      nextRefill: null
    }
  ];

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesFilter = filter === 'all' || prescription.status === filter;
    const matchesSearch = prescription.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      active: 'badge-success',
      completed: 'badge-secondary',
      expired: 'badge-error'
    };
    return colors[status] || 'badge-secondary';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Clock size={16} className="text-green-600" />;
      case 'completed':
        return <FileText size={16} className="text-gray-600" />;
      case 'expired':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const handleDownloadPrescription = (prescriptionId) => {
    // In a real app, this would download a PDF
    console.log('Downloading prescription:', prescriptionId);
  };

  const handleViewPrescription = (prescriptionId) => {
    // In a real app, this would open a detailed view
    console.log('Viewing prescription:', prescriptionId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
        <p className="text-gray-500 text-lg">View and manage your medication prescriptions</p>
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
                  placeholder="Search by doctor, specialization, or prescription ID..."
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
                <option value="all">All Prescriptions</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-6">
        {filteredPrescriptions.map((prescription) => (
          <div key={prescription.id} className="prescription-card">
            <div className="prescription-header">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(prescription.status)}
                  <h4 className="font-medium text-gray-900">{prescription.prescriptionId}</h4>
                  <span className={`badge ${getStatusColor(prescription.status)}`}>
                    {prescription.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center space-x-1">
                    <User size={16} />
                    <span>{prescription.doctor}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{new Date(prescription.date).toLocaleDateString()}</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span>{prescription.specialization}</span>
                </div>
                {prescription.nextRefill && (
                  <div className="flex items-center space-x-1 text-sm text-blue-600">
                    <Clock size={16} />
                    <span>Next refill: {new Date(prescription.nextRefill).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewPrescription(prescription.prescriptionId)}
                  className="btn btn-outline btn-sm flex items-center space-x-1"
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleDownloadPrescription(prescription.prescriptionId)}
                  className="btn btn-outline btn-sm flex items-center space-x-1"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Medications */}
            <div className="mt-4 space-y-3">
              <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                <Pill size={16} />
                <span>Medications</span>
              </h5>
              <div className="space-y-2">
                {prescription.medications.map((medication, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900">{medication.name}</h6>
                        <p className="text-sm text-gray-600">{medication.dosage}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{medication.frequency}</span>
                          <span>•</span>
                          <span>{medication.duration}</span>
                        </div>
                        {medication.instructions && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            Instructions: {medication.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {prescription.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h6 className="font-medium text-gray-900 mb-1">Doctor's Notes</h6>
                <p className="text-sm text-gray-600">{prescription.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Prescriptions */}
      {filteredPrescriptions.length === 0 && (
        <div className="card">
          <div className="card-content text-center py-12">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You don\'t have any prescriptions yet.'
              }
            </p>
            <p className="text-sm text-gray-500">
              Prescriptions will appear here after your doctor appointments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;