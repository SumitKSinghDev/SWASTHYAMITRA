import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

import { logoutUser } from '../../store/slices/authSlice';
import { toggleSidebar, setTheme } from '../../store/slices/uiSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen, theme } = useSelector((state) => state.ui);
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/auth/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', theme, 'to', newTheme);
    dispatch(setTheme(newTheme));
    // Save theme to localStorage
    localStorage.setItem('theme', newTheme);
    // Apply theme to document
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    console.log('Document classes after toggle:', document.documentElement.classList.toString());
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      patient: 'Patient',
      doctor: 'Doctor',
      asha_worker: 'ASHA Worker',
      pharmacy: 'Pharmacy',
      admin: 'Administrator'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      patient: 'bg-blue-100 text-blue-800',
      doctor: 'bg-green-100 text-green-800',
      asha_worker: 'bg-purple-100 text-purple-800',
      pharmacy: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <nav className="navbar">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <Link to="/" className="flex items-center space-x-2">
            {/* Prefer custom brand logo if available in public/brand-logo.png */}
            <img
              src="/SWASTHYA.png"
              alt="SwasthyaMitra"
              className="h-8 w-8 rounded-lg object-contain hidden sm:block"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            {/* Fallback mark */}
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm sm:hidden">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="text-xl font-bold logo-text">SWASTHYAMITRA</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Home link (always visible) */}
          <Link to="/" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
            Home
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors"
            >
              <Bell size={20} />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Notifications</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No new notifications
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {getRoleDisplayName(user?.role)}
                </p>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
                <div className="py-1">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user?.role)}`}>
                      {getRoleDisplayName(user?.role)}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <Link
                    to={`/${user?.role}/profile`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={16} className="mr-3" />
                    Profile
                  </Link>
                  
                  <Link
                    to={`/${user?.role}/settings`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={16} className="mr-3" />
                    Settings
                  </Link>

                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
