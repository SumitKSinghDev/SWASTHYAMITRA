import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, Phone, User, Calendar, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

import { registerUser, clearError } from '../../store/slices/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    dateOfBirth: '',
    gender: '',
    aadhaarNumber: '',
    address: {
      street: '',
      city: '',
      state: 'Punjab',
      pincode: '',
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      console.error('Registration error from Redux:', error);
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== REGISTRATION DEBUG ===');
    console.log('Form data:', formData);
    console.log('Form validation state:', {
      firstName: !!formData.firstName,
      lastName: !!formData.lastName,
      email: !!formData.email,
      phone: !!formData.phone,
      aadhaarNumber: !!formData.aadhaarNumber,
      password: !!formData.password,
      confirmPassword: !!formData.confirmPassword
    });
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.aadhaarNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate Aadhaar number format
    if (!/^[0-9]{12}$/.test(formData.aadhaarNumber)) {
      toast.error('Aadhaar number must be exactly 12 digits');
      return;
    }

    // Validate phone number format
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number starting with 6-9');
      return;
    }

    // Note: Aadhaar uniqueness is enforced at database level
    // One Aadhaar number can only be used for one account

    // Remove confirmPassword from formData before sending
    const { confirmPassword, ...userData } = formData;

    // Clean optional fields to satisfy backend validators
    const payload = { ...userData };
    if (!payload.gender) delete payload.gender;
    if (!payload.dateOfBirth) delete payload.dateOfBirth;
    if (payload.address) {
      const { street, city, state, pincode } = payload.address;
      const allEmpty = [street, city, state, pincode].every(v => !v || String(v).trim() === '');
      if (allEmpty) delete payload.address;
    }
    // Ensure role isn't admin (disallowed server-side)
    if (payload.role === 'admin') payload.role = 'patient';
    
    console.log('Payload being sent:', payload);
    console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
    
    try {
      console.log('Dispatching registerUser...');
      const result = await dispatch(registerUser(payload));
      console.log('Registration result:', result);
      
      if (result.type === 'auth/registerUser/fulfilled') {
        toast.success('Registration successful! Please check your email for verification.');
      } else if (result.type === 'auth/registerUser/rejected') {
        console.error('Registration failed:', result.payload);
        toast.error(result.payload || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      patient: 'Access your health records, book appointments, and manage prescriptions',
      doctor: 'Manage appointments, view patient records, and prescribe medications',
      asha_worker: 'Register offline patients and help them access healthcare services',
      pharmacy: 'Manage prescriptions and medicine inventory',
      admin: 'Manage users, monitor system, and generate reports'
    };
    return descriptions[role] || '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Join SWASTHYAMITRA to access rural healthcare services.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['patient'].map((role) => (
              <label
                key={role}
                className={`relative flex cursor-pointer rounded-lg p-3 border-2 transition-colors ${
                  formData.role === role
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={formData.role === role}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {role.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getRoleDescription(role)}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                className="input pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                className="input pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={20} className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="input pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={20} className="text-gray-400" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="input pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Aadhaar Card Information */}
        <div>
          <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Aadhaar Number *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={20} className="text-gray-400" />
            </div>
            <input
              id="aadhaarNumber"
              name="aadhaarNumber"
              type="text"
              value={formData.aadhaarNumber}
              onChange={handleChange}
              placeholder="Enter your 12-digit Aadhaar number"
              className="input pl-10"
              maxLength="12"
              pattern="[0-9]{12}"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter your 12-digit Aadhaar number for identity verification
          </p>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={20} className="text-gray-400" />
              </div>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Address Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={20} className="text-gray-400" />
                </div>
                <input
                  id="address.street"
                  name="address.street"
                  type="text"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="Enter street address"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                id="address.city"
                name="address.city"
                type="text"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <input
                id="address.pincode"
                name="address.pincode"
                type="text"
                value={formData.address.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="input pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="input pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="loading-spinner mr-2"></div>
              Creating account...
            </div>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
