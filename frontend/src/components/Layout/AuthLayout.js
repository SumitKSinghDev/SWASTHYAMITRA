import React from 'react';
import { Outlet, Link } from 'react-router-dom';
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
          <Link to="/" className="inline-block">
            <img src="/SWASTHYA.png" alt="SwasthyaMitra" className="mx-auto h-16 w-16 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            SWASTHYAMITRA
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
          <p>© 2025 SWASTHYAMITRA. All rights reserved.</p>
          <p className="text-xs text-gray-400 mt-1">Empowering rural healthcare through technology — made by TEAM CODE4SEHAT</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
