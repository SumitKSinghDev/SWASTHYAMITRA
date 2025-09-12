import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Settings,
  Edit,
  Save,
  X,
  Activity,
  Users,
  Calendar as CalendarIcon,
  FileText,
  TrendingUp
} from 'lucide-react';

const AdminProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || 'Admin',
    lastName: user?.lastName || 'User',
    email: user?.email || 'admin@demo.com',
    phone: user?.phone || '+91 98765 43210',
    address: '123 Admin Street, Nabha, Punjab 147201',
    department: 'System Administration',
    role: 'Super Admin',
    permissions: ['user_management', 'system_settings', 'reports', 'analytics'],
    joinDate: '2024-01-01',
    lastLogin: '2024-01-22 14:30',
    totalActions: 1250,
    systemAccess: 'Full Access'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Profile updated:', formData);
      setIsSubmitting(false);
      setIsEditing(false);
    }, 1000);
  };

  const stats = [
    { label: 'Total Users Managed', value: 1247, icon: Users, color: 'blue' },
    { label: 'System Actions', value: 1250, icon: Activity, color: 'green' },
    { label: 'Reports Generated', value: 45, icon: FileText, color: 'purple' },
    { label: 'Days Active', value: 22, icon: CalendarIcon, color: 'orange' }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600">Manage your administrative account and system settings</p>
        </div>
        <div className="mt-4 sm:mt-0">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline"
            >
              <Edit size={20} className="mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-outline"
              >
                <X size={20} className="mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                  <stat.icon size={24} className={`text-${stat.color}-600`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          </div>
          <div className="card-content">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="input w-full"
                    required
                  />
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <User size={20} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail size={20} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{formData.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone size={20} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{formData.phone}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin size={20} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">{formData.address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Administrative Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Administrative Information</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium text-gray-900">{formData.role}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Settings size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium text-gray-900">{formData.department}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Join Date</p>
                  <p className="font-medium text-gray-900">{formData.joinDate}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Activity size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-medium text-gray-900">{formData.lastLogin}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">System Permissions</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {formData.permissions.map((permission, index) => (
              <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {permission.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Access */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">System Access</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Access Level</p>
              <p className="text-lg font-semibold text-green-600">{formData.systemAccess}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Actions</p>
              <p className="text-lg font-semibold text-blue-600">{formData.totalActions.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
