import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  UserPlus,
  MoreVertical
} from 'lucide-react';

const AdminUsers = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Mock data - in real app, this would come from API calls
  const users = [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@demo.com',
      phone: '+91 98765 43210',
      role: 'doctor',
      status: 'active',
      lastLogin: '2024-01-22 10:30',
      joinDate: '2024-01-01',
      specialization: 'General Medicine',
      address: '123 Health Lane, Nabha, Punjab',
      totalPatients: 150,
      totalAppointments: 230
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      email: 'pharmacy@demo.com',
      phone: '+91 98765 43211',
      role: 'pharmacy',
      status: 'active',
      lastLogin: '2024-01-22 09:15',
      joinDate: '2024-01-02',
      pharmacyName: 'Nabha Medical Store',
      address: '456 Main Street, Nabha, Punjab',
      totalPrescriptions: 89,
      totalRevenue: 45600
    },
    {
      id: 3,
      name: 'Sunita Devi',
      email: 'asha@demo.com',
      phone: '+91 98765 43212',
      role: 'asha',
      status: 'active',
      lastLogin: '2024-01-22 08:45',
      joinDate: '2024-01-03',
      area: 'Nabha Block A',
      address: '789 Care Street, Nabha, Punjab',
      totalPatients: 45,
      totalAppointments: 67
    },
    {
      id: 4,
      name: 'Amit Kumar',
      email: 'patient@demo.com',
      phone: '+91 98765 43213',
      role: 'patient',
      status: 'active',
      lastLogin: '2024-01-21 16:20',
      joinDate: '2024-01-04',
      nabhaCardId: 'NABHA001234',
      address: '321 Wellness Road, Nabha, Punjab',
      totalAppointments: 8,
      totalPrescriptions: 5
    },
    {
      id: 5,
      name: 'Admin User',
      email: 'admin@demo.com',
      phone: '+91 98765 43214',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-22 11:00',
      joinDate: '2024-01-01',
      permissions: 'Full Access',
      address: 'Admin Office, Nabha, Punjab',
      totalActions: 1250,
      systemAccess: '24/7'
    },
    {
      id: 6,
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@demo.com',
      phone: '+91 98765 43215',
      role: 'doctor',
      status: 'inactive',
      lastLogin: '2024-01-15 14:30',
      joinDate: '2024-01-05',
      specialization: 'Cardiology',
      address: '654 Medical Avenue, Nabha, Punjab',
      totalPatients: 75,
      totalAppointments: 120
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Click handlers
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleActivateUser = (user) => {
    console.log('Activating user:', user.name);
    // In real app, this would make an API call
  };

  const handleSuspendUser = (user) => {
    console.log('Suspending user:', user.name);
    // In real app, this would make an API call
  };

  const handleAddUser = () => {
    console.log('Adding new user');
    // In real app, this would open add user modal
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'pharmacy':
        return 'bg-green-100 text-green-800';
      case 'asha':
        return 'bg-purple-100 text-purple-800';
      case 'patient':
        return 'bg-orange-100 text-orange-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor':
        return <Shield size={16} className="text-blue-600" />;
      case 'pharmacy':
        return <Shield size={16} className="text-green-600" />;
      case 'asha':
        return <Shield size={16} className="text-purple-600" />;
      case 'patient':
        return <Shield size={16} className="text-orange-600" />;
      case 'admin':
        return <Shield size={16} className="text-red-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
    }
  };

  const getRoleStats = (role) => {
    const roleUsers = users.filter(u => u.role === role);
    return {
      total: roleUsers.length,
      active: roleUsers.filter(u => u.status === 'active').length,
      inactive: roleUsers.filter(u => u.status === 'inactive').length
    };
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users across the platform</p>
        </div>
        <button 
          onClick={handleAddUser}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <UserPlus size={20} className="mr-2" />
          Add User
        </button>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {['doctor', 'pharmacy', 'asha', 'patient', 'admin'].map((role) => {
          const stats = getRoleStats(role);
          return (
            <div key={role} className="card">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getRoleIcon(role)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 capitalize">{role}s</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-green-600">{stats.active} active</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Roles</option>
                <option value="doctor">Doctors</option>
                <option value="pharmacy">Pharmacies</option>
                <option value="asha">ASHA Workers</option>
                <option value="patient">Patients</option>
                <option value="admin">Admins</option>
              </select>
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
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users size={20} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </span>
                      {user.specialization && (
                        <div className="text-xs text-gray-500 mt-1">
                          {user.specialization}
                        </div>
                      )}
                      {user.pharmacyName && (
                        <div className="text-xs text-gray-500 mt-1">
                          {user.pharmacyName}
                        </div>
                      )}
                      {user.area && (
                        <div className="text-xs text-gray-500 mt-1">
                          {user.area}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span>{user.lastLogin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.role === 'doctor' && (
                        <div>
                          <div className="text-xs text-gray-500">Patients: {user.totalPatients}</div>
                          <div className="text-xs text-gray-500">Appointments: {user.totalAppointments}</div>
                        </div>
                      )}
                      {user.role === 'pharmacy' && (
                        <div>
                          <div className="text-xs text-gray-500">Prescriptions: {user.totalPrescriptions}</div>
                          <div className="text-xs text-gray-500">Revenue: ₹{user.totalRevenue?.toLocaleString()}</div>
                        </div>
                      )}
                      {user.role === 'asha' && (
                        <div>
                          <div className="text-xs text-gray-500">Patients: {user.totalPatients}</div>
                          <div className="text-xs text-gray-500">Appointments: {user.totalAppointments}</div>
                        </div>
                      )}
                      {user.role === 'patient' && (
                        <div>
                          <div className="text-xs text-gray-500">Appointments: {user.totalAppointments}</div>
                          <div className="text-xs text-gray-500">Prescriptions: {user.totalPrescriptions}</div>
                        </div>
                      )}
                      {user.role === 'admin' && (
                        <div>
                          <div className="text-xs text-gray-500">Actions: {user.totalActions}</div>
                          <div className="text-xs text-gray-500">Access: {user.systemAccess}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleActivateUser(user)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Activate User"
                        >
                          <UserCheck size={16} />
                        </button>
                        <button 
                          onClick={() => handleSuspendUser(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Suspend User"
                        >
                          <UserX size={16} />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          title="More Options"
                        >
                          <MoreVertical size={16} />
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

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No users have been registered yet.'
            }
          </p>
          <button 
            onClick={handleAddUser}
            className="btn btn-primary"
          >
            <UserPlus size={20} className="mr-2" />
            Add First User
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
