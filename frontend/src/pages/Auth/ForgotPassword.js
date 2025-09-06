import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Phone, CreditCard, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

import { forgotPassword } from '../../store/slices/authSlice';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  
  const [identifier, setIdentifier] = useState('');
  const [method, setMethod] = useState('email');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!identifier) {
      toast.error('Please enter your email, phone, or NABHA ID');
      return;
    }

    dispatch(forgotPassword(identifier));
    setSubmitted(true);
  };

  const getPlaceholder = () => {
    switch (method) {
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
    switch (method) {
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

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Check your {method === 'email' ? 'email' : 'phone'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent password reset instructions to your {method === 'email' ? 'email address' : 'phone number'}.
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/auth/login"
            className="btn btn-primary"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Forgot your password?</h2>
        <p className="mt-2 text-sm text-gray-600">
          No worries! Enter your email, phone, or NABHA ID and we'll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Method Selection */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMethod('email')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              method === 'email'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setMethod('phone')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              method === 'phone'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Phone
          </button>
          <button
            type="button"
            onClick={() => setMethod('nabha')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              method === 'nabha'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            NABHA ID
          </button>
        </div>

        {/* Identifier Field */}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
            {method === 'email' ? 'Email Address' : 
             method === 'phone' ? 'Phone Number' : 'NABHA ID'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {getIcon()}
            </div>
            <input
              id="identifier"
              type={method === 'phone' ? 'tel' : 'text'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={getPlaceholder()}
              className="input pl-10"
              required
            />
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
              Sending...
            </div>
          ) : (
            'Send Reset Instructions'
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          to="/auth/login"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
