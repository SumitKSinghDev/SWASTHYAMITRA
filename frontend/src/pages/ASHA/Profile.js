import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Award,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

const AshaProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    ashaId: user?.ashaId || '',
    area: user?.area || '',
    village: user?.village || '',
    address: user?.address || {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = () => {
    // In real app, this would make an API call to update the profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
    // Show success message
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      email: user?.email || '',
      ashaId: user?.ashaId || '',
      area: user?.area || '',
      village: user?.village || '',
      address: user?.address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: ''
      }
    });
    setIsEditing(false);
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
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your ASHA worker profile information</p>
        </div>
        <div className="mt-4 sm:mt-0">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              <Edit size={20} className="mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="btn btn-success"
              >
                <Save size={20} className="mr-2" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-outline"
              >
                <X size={20} className="mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-content text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={48} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 mb-4">ASHA Worker</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <Award size={16} className="mr-2" />
                  <span>ASHA ID: {user.ashaId}</span>
                </div>
                <div className="flex items-center justify-center">
                  <MapPin size={16} className="mr-2" />
                  <span>{user.area}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Users size={16} className="mr-2" />
                  <span>{user.village}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Patients</span>
                  <span className="font-semibold text-gray-900">45</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Appointments Booked</span>
                  <span className="font-semibold text-gray-900">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">NABHA Cards Generated</span>
                  <span className="font-semibold text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-semibold text-gray-900">2+ years</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-gray-900">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-gray-900">{user.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Phone size={16} className="mr-2 text-gray-400" />
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-gray-400" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ASHA ID
                  </label>
                  <div className="flex items-center">
                    <Award size={16} className="mr-2 text-gray-400" />
                    <span className="text-gray-900 font-mono">{user.ashaId}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NABHA ID
                  </label>
                  <div className="flex items-center">
                    <Award size={16} className="mr-2 text-gray-400" />
                    <span className="text-gray-900 font-mono">{user.nabhaId}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-gray-400" />
                      <span className="text-gray-900">{user.area}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Village
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-gray-400" />
                      <span className="text-gray-900">{user.village}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address?.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address?.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address?.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address?.pincode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address?.country}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <CheckCircle size={20} className="text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Account Status</p>
                    <p className="text-sm text-gray-600">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <CheckCircle size={20} className="text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Verification Status</p>
                    <p className="text-sm text-gray-600">
                      {user.isVerified ? 'Verified' : 'Pending Verification'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar size={20} className="text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Member Since</p>
                    <p className="text-sm text-gray-600">January 2024</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock size={20} className="text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-600">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AshaProfile;
