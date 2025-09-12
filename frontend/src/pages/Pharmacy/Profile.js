import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Star,
  Users,
  Package,
  TrendingUp
} from 'lucide-react';

const PharmacyProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pharmacyName: user?.pharmacyName || 'Nabha Medical Store',
    ownerName: user?.firstName + ' ' + user?.lastName || 'Rajesh Kumar',
    licenseNumber: 'PUN/PH/2024/001234',
    phone: user?.phone || '+91 9876543210',
    email: user?.email || 'pharmacy@demo.com',
    address: {
      street: '123 Main Street',
      city: 'Nabha',
      state: 'Punjab',
      pincode: '147201',
      country: 'India'
    },
    timings: {
      monday: '9:00 AM - 9:00 PM',
      tuesday: '9:00 AM - 9:00 PM',
      wednesday: '9:00 AM - 9:00 PM',
      thursday: '9:00 AM - 9:00 PM',
      friday: '9:00 AM - 9:00 PM',
      saturday: '9:00 AM - 9:00 PM',
      sunday: '10:00 AM - 8:00 PM'
    },
    services: [
      'Prescription Filling',
      'Medicine Delivery',
      'Health Consultations',
      'Emergency Medicine',
      'Chronic Disease Management'
    ],
    specialties: [
      'General Medicine',
      'Diabetes Care',
      'Cardiovascular',
      'Pediatric Medicine'
    ]
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
    } else if (name.startsWith('timings.')) {
      const timingField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        timings: {
          ...prev.timings,
          [timingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Updating pharmacy profile:', formData);
      setIsSubmitting(false);
      setIsEditing(false);
    }, 2000);
  };

  const stats = {
    totalCustomers: 1250,
    monthlyOrders: 89,
    averageRating: 4.8,
    yearsInBusiness: 15,
    totalMedicines: 450,
    activePrescriptions: 67
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
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Profile</h1>
          <p className="text-gray-600">Manage your pharmacy information and settings</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyOrders}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}/5.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pharmacy Name
                </label>
                <input
                  type="text"
                  name="pharmacyName"
                  value={formData.pharmacyName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input w-full"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Address Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input w-full"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Operating Hours</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(formData.timings).map(([day, time]) => (
              <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900 capitalize">{day}</span>
                {isEditing ? (
                  <input
                    type="text"
                    name={`timings.${day}`}
                    value={time}
                    onChange={handleChange}
                    className="input w-32 text-sm"
                  />
                ) : (
                  <span className="text-sm text-gray-600">{time}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services and Specialties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Services Offered</h2>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              {formData.services.map((service, index) => (
                <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                  <CheckCircle size={16} className="text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Specialties</h2>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              {formData.specialties.map((specialty, index) => (
                <div key={index} className="flex items-center p-2 bg-blue-50 rounded-lg">
                  <Star size={16} className="text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">{specialty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Years in Business</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.yearsInBusiness}+</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package size={24} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Total Medicines</h3>
              <p className="text-2xl font-bold text-orange-600">{stats.totalMedicines}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Active Prescriptions</h3>
              <p className="text-2xl font-bold text-green-600">{stats.activePrescriptions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyProfile;
