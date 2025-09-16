import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { downloadPrescription, printDocument } from '../../utils/downloadUtils';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Printer,
  Send
} from 'lucide-react';

const DoctorPrescriptions = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchPrescriptions = async (resetPage = false) => {
    try {
      setLoading(true);
      setError('');
      const params = { page: resetPage ? 1 : page, limit: 10 };
      if (filterStatus !== 'all') params.status = filterStatus;
      const { data } = await axios.get(`${API_BASE}/doctors/prescriptions`, { params });
      const list = data?.data?.prescriptions || [];
      setPrescriptions(list.map(p => ({
        id: p._id,
        prescriptionId: p.prescriptionId || p._id?.slice(-8).toUpperCase(),
        patientName: `${p.patient?.firstName || ''} ${p.patient?.lastName || ''}`.trim(),
        patientPhone: p.patient?.phone || '',
        patientAge: p.patient?.dateOfBirth ? Math.max(0, Math.floor((Date.now() - new Date(p.patient.dateOfBirth)) / (365*24*60*60*1000))) : undefined,
        date: new Date(p.createdAt).toLocaleDateString(),
        status: p.status || 'active',
        medications: p.medications || [],
        diagnosis: p.diagnosis || '',
        notes: p.generalInstructions || '',
        followUpDate: p.followUpDate ? new Date(p.followUpDate).toLocaleDateString() : null,
      })));
      setTotalPages(data?.data?.pagination?.totalPages || 1);
      if (resetPage) setPage(1);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'doctor') fetchPrescriptions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  useEffect(() => {
    if (user?.role === 'doctor') fetchPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Click handlers
  const handleView = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handleEdit = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handlePrint = (prescription) => {
    const content = `
PRESCRIPTION
============

Prescription ID: ${prescription.prescriptionId}
Patient: ${prescription.patientName} (${prescription.patientPhone})
Doctor: ${prescription.doctorName}
Date: ${prescription.date}
Status: ${prescription.status}
Diagnosis: ${prescription.diagnosis}

Medications:
${prescription.medications.map(med => 
  `- ${med.name} (${med.dosage}) - ${med.frequency} for ${med.duration}`
).join('\n')}

Notes: ${prescription.notes || 'None'}
Follow-up: ${prescription.followUpDate || 'Not scheduled'}

Generated on: ${new Date().toLocaleString()}
    `.trim();
    
    printDocument(content, `Prescription ${prescription.prescriptionId}`);
  };

  const handleSend = (prescription) => {
    console.log('Sending prescription:', prescription.prescriptionId);
    // Download prescription as file for sending
    downloadPrescription(prescription);
    alert('Prescription downloaded! You can now send it via email or messaging.');
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
          <p className="text-gray-600">Manage patient prescriptions and medications</p>
        </div>
        <button
          onClick={() => setShowNewPrescription(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus size={20} className="mr-2" />
          New Prescription
        </button>
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
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 'active').length}
                </p>
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
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => p.status === 'expired').length}
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
                  placeholder="Search by patient name, prescription ID, or diagnosis..."
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
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {loading && (<div className="text-center text-gray-600">Loading...</div>)}
        {error && (<div className="text-center text-red-600">{error}</div>)}
        {!loading && !error && filteredPrescriptions.map((prescription) => (
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
                            <span>{prescription.patientName}, {prescription.patientAge} years</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {prescription.patientPhone}
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
                        
                        <div className="md:col-span-2">
                          <p className="font-medium text-gray-900 mb-1">Diagnosis</p>
                          <span className="text-sm">{prescription.diagnosis}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="font-medium text-gray-900 mb-2">Medications:</p>
                        <div className="space-y-2">
                          {prescription.medications.map((med, index) => (
                            <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                              <div>
                                <span className="font-medium text-gray-900">{med.name}</span>
                                <span className="text-gray-600 ml-2">({med.dosage})</span>
                              </div>
                              <div className="text-right text-xs text-gray-500">
                                <div>{med.frequency}</div>
                                <div>{med.duration}</div>
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
                      onClick={() => handleView(prescription)}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye size={16} className="mr-2" />
                      View
                    </button>
                    <button 
                      onClick={() => handleEdit(prescription)}
                      className="btn btn-outline btn-sm"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!loading && !error && prescriptions.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      )}

      {!loading && !error && filteredPrescriptions.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No prescriptions have been created yet.'
            }
          </p>
          <button
            onClick={() => setShowNewPrescription(true)}
            className="btn btn-primary"
          >
            <Plus size={20} className="mr-2" />
            Create First Prescription
          </button>
        </div>
      )}

      {/* New Prescription Modal */}
      {showNewPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Prescription</h3>
            <PrescriptionForm onClose={() => { setShowNewPrescription(false); fetchPrescriptions(true); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;

const PrescriptionForm = ({ onClose }) => {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [patientNabhaId, setPatientNabhaId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);

  const addMedication = () => setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  const updateMedication = (idx, field, value) => {
    const copy = medications.slice();
    copy[idx][field] = value;
    setMedications(copy);
  };
  const removeMedication = (idx) => setMedications(medications.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      // Resolve patientId via NABHA ID
      const patientLookup = await axios.get(`${API_BASE}/doctors/patients/${encodeURIComponent(patientNabhaId)}`);
      const patientId = patientLookup?.data?.data?.patient?.userId?._id;
      if (!patientId) throw new Error('Patient not found');

      const payload = {
        patientId,
        appointmentId,
        medications,
        diagnosis,
        generalInstructions,
        followUpRequired: !!followUpDate,
        followUpDate: followUpDate || undefined,
      };

      await axios.post(`${API_BASE}/doctors/prescriptions`, payload);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Patient NABHA ID</label>
          <input type="text" className="input w-full" value={patientNabhaId} onChange={(e) => setPatientNabhaId(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Appointment ID</label>
          <input type="text" className="input w-full" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
        <input type="text" className="input w-full" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
        <div className="space-y-2">
          {medications.map((med, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <input type="text" className="input" placeholder="Name" value={med.name} onChange={(e) => updateMedication(idx, 'name', e.target.value)} required />
              <input type="text" className="input" placeholder="Dosage" value={med.dosage} onChange={(e) => updateMedication(idx, 'dosage', e.target.value)} required />
              <input type="text" className="input" placeholder="Frequency" value={med.frequency} onChange={(e) => updateMedication(idx, 'frequency', e.target.value)} required />
              <input type="text" className="input" placeholder="Duration" value={med.duration} onChange={(e) => updateMedication(idx, 'duration', e.target.value)} required />
              <button type="button" className="btn btn-outline" onClick={() => removeMedication(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addMedication}>+ Add Medicine</button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">General Instructions</label>
        <textarea className="input w-full" rows={3} value={generalInstructions} onChange={(e) => setGeneralInstructions(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
        <input type="date" className="input w-full" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Prescription'}</button>
      </div>
    </form>
  );
};
