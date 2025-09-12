import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Phone,
  MapPin,
  QrCode,
  Calendar,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const AshaPatients = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Mock data - in real app, this would come from API calls
  const patients = [
    {
      id: 1,
      name: 'Ram Singh',
      phone: '9876543210',
      village: 'Nabha Village',
      nabhaId: 'NABHA815959NTQK',
      registeredDate: '2024-01-15',
      status: 'active',
      age: 45,
      gender: 'male',
      lastVisit: '2024-01-18'
    },
    {
      id: 2,
      name: 'Sunita Devi',
      phone: '9876543211',
      village: 'Nabha Village',
      nabhaId: 'NABHA815959NTQL',
      registeredDate: '2024-01-14',
      status: 'active',
      age: 38,
      gender: 'female',
      lastVisit: '2024-01-17'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      phone: '9876543212',
      village: 'Nabha Village',
      nabhaId: 'NABHA815959NTQM',
      registeredDate: '2024-01-13',
      status: 'pending',
      age: 52,
      gender: 'male',
      lastVisit: null
    },
    {
      id: 4,
      name: 'Priya Sharma',
      phone: '9876543213',
      village: 'Nabha Village',
      nabhaId: 'NABHA815959NTQN',
      registeredDate: '2024-01-12',
      status: 'active',
      age: 29,
      gender: 'female',
      lastVisit: '2024-01-16'
    },
    {
      id: 5,
      name: 'Rajesh Kumar',
      phone: '9876543214',
      village: 'Nabha Village',
      nabhaId: 'NABHA815959NTQO',
      registeredDate: '2024-01-11',
      status: 'inactive',
      age: 61,
      gender: 'male',
      lastVisit: '2024-01-10'
    }
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm) ||
                         patient.nabhaId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Click handlers
  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleDelete = (patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.name}?`)) {
      console.log('Deleting patient:', patient.name);
      // In real app, this would make API call to delete
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
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
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-600">Manage and track your registered patients</p>
        </div>
        <Link
          to="/asha/register-offline-patient"
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus size={20} className="mr-2" />
          Register New Patient
        </Link>
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
                <Users size={24} className="text-green-600" />
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
                <Users size={24} className="text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <QrCode size={24} className="text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">NABHA Cards</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.nabhaId).length}
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
                  placeholder="Search patients by name, phone, or NABHA ID..."
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
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NABHA ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users size={20} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.age} years, {patient.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone size={16} className="mr-2 text-gray-400" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        {patient.village}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <QrCode size={16} className="mr-2 text-gray-400" />
                        {patient.nabhaId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.lastVisit ? (
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          {patient.lastVisit}
                        </div>
                      ) : (
                        <span className="text-gray-400">No visits</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewDetails(patient)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(patient)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Patient"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Patient"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by registering your first patient.'
            }
          </p>
          <Link
            to="/asha/register-offline-patient"
            className="btn btn-primary"
          >
            <Plus size={20} className="mr-2" />
            Register First Patient
          </Link>
        </div>
      )}
    </div>
  );
};

export default AshaPatients;
