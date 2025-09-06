import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AuthLayout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Redirect authenticated users to their dashboard
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">C4C</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            CODE4CARE
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Telemedicine Platform for Rural Healthcare
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>© 2024 CODE4CARE. All rights reserved.</p>
          <p className="mt-1">Empowering rural healthcare through technology</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
