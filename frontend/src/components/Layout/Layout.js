import React, { useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { getCurrentUser } from '../../store/slices/authSlice';
import { setSidebarOpen, setTheme } from '../../store/slices/uiSlice';

const Layout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const { sidebarOpen, sidebarCollapsed } = useSelector((state) => state.ui);

  useEffect(() => {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    dispatch(setTheme(savedTheme));
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, [dispatch]);

  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Close sidebar on route change (mobile)
    if (window.innerWidth < 768) {
      dispatch(setSidebarOpen(false));
    }
  }, [location, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <div className="flex">
        <Sidebar />

        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        } ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-8 bg-white min-h-screen main-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
