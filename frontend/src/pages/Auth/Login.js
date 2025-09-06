import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, Phone, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

import { loginUser, clearError, setDemoUser } from '../../store/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email', 'phone', 'nabha'

  const from = location.state?.from?.pathname || `/${user?.role || 'patient'}/dashboard`;

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.identifier || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check if it's demo credentials
    if (formData.identifier === 'patient@demo.com' && formData.password === 'password123') {
      dispatch(setDemoUser());
      toast.success('Logged in as demo patient!');
      return;
    }

    dispatch(loginUser(formData));
  };

  const getPlaceholder = () => {
    switch (loginMethod) {
      case 'email':
        return 'Enter your email address';
      case 'phone':
        return 'Enter your phone number';
      case 'nabha':
        return 'Enter your NABHA ID';
      default:
        return 'Enter your email address';
    }
  };

  const getIcon = () => {
    switch (loginMethod) {
      case 'email':
        return <Mail size={20} className="text-gray-400" />;
      case 'phone':
        return <Phone size={20} className="text-gray-400" />;
      case 'nabha':
        return <CreditCard size={20} className="text-gray-400" />;
      default:
        return <Mail size={20} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Please sign in to continue.
        </p>
      </div>

      {/* Login Method Selector */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setLoginMethod('email')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            loginMethod === 'email'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            loginMethod === 'phone'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Phone
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('nabha')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            loginMethod === 'nabha'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          NABHA ID
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identifier Field */}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
            {loginMethod === 'email' ? 'Email Address' : 
             loginMethod === 'phone' ? 'Phone Number' : 'NABHA ID'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {getIcon()}
            </div>
            <input
              id="identifier"
              name="identifier"
              type={loginMethod === 'phone' ? 'tel' : 'text'}
              value={formData.identifier}
              onChange={handleChange}
              placeholder={getPlaceholder()}
              className="input pl-10"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
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
              placeholder="Enter your password"
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

        {/* Forgot Password Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </Link>
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
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign up here
          </Link>
        </p>
      </div>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Patient:</strong> patient@demo.com / password123</p>
          <p><strong>Doctor:</strong> doctor@demo.com / password123</p>
          <p><strong>ASHA Worker:</strong> asha@demo.com / password123</p>
          <p><strong>Pharmacy:</strong> pharmacy@demo.com / password123</p>
          <p><strong>Admin:</strong> admin@demo.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
