import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar, toggleSidebarCollapse } from '../../store/slices/uiSlice';
import { useTranslation } from '../../hooks/useTranslation';
import {
  Home,
  User,
  Calendar,
  FileText,
  Heart,
  CreditCard,
  Users,
  BarChart3,
  UserPlus,
  Package as PackageIcon,
  Menu,
  Video
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen, sidebarCollapsed } = useSelector((state) => state.ui);
  const { t } = useTranslation();

  const getNavigationItems = (role) => {
    const baseItems = [
      {
        name: t('dashboard'),
        href: `/${role}/dashboard`,
        icon: Home,
        current: location.pathname === `/${role}/dashboard`,
      },
      {
        name: t('profile'),
        href: `/${role}/profile`,
        icon: User,
        current: location.pathname === `/${role}/profile`,
      },
    ];

    // Add role-specific items
    switch (role) {
      case 'patient':
        return [
          ...baseItems,
          {
            name: t('nabha_card'),
            href: '/patient/nabha-card',
            icon: CreditCard,
            current: location.pathname === '/patient/nabha-card',
          },
          {
            name: t('appointments'),
            href: '/patient/appointments',
            icon: Calendar,
            current: location.pathname === '/patient/appointments',
          },
          {
            name: 'Video Call',
            href: '/patient/video-call',
            icon: Video,
            current: location.pathname === '/patient/video-call',
          },
          {
            name: t('prescriptions'),
            href: '/patient/prescriptions',
            icon: FileText,
            current: location.pathname === '/patient/prescriptions',
          },
          {
            name: t('health_records'),
            href: '/patient/health-records',
            icon: Heart,
            current: location.pathname === '/patient/health-records',
          },
          {
            name: 'Medicine Orders',
            href: '/patient/medicine-orders',
            icon: PackageIcon,
            current: location.pathname === '/patient/medicine-orders',
          },
        ];

      case 'doctor':
        return [
          ...baseItems,
          {
            name: 'Appointments',
            href: '/doctor/appointments',
            icon: Calendar,
            current: location.pathname === '/doctor/appointments',
          },
          {
            name: 'Video Consultation',
            href: '/doctor/video-consultation',
            icon: Video,
            current: location.pathname === '/doctor/video-consultation',
          },
          {
            name: 'Prescriptions',
            href: '/doctor/prescriptions',
            icon: FileText,
            current: location.pathname === '/doctor/prescriptions',
          },
          {
            name: 'Patients',
            href: '/doctor/patients',
            icon: Users,
            current: location.pathname === '/doctor/patients',
          },
          {
            name: 'Schedule',
            href: '/doctor/schedule',
            icon: Calendar,
            current: location.pathname === '/doctor/schedule',
          },
        ];

      case 'asha':
        return [
          ...baseItems,
          {
            name: 'Patients',
            href: '/asha/patients',
            icon: Users,
            current: location.pathname === '/asha/patients',
          },
          {
            name: 'Register Patient',
            href: '/asha/patients/register',
            icon: UserPlus,
            current: location.pathname === '/asha/patients/register',
          },
          {
            name: 'Appointments',
            href: '/asha/appointments',
            icon: Calendar,
            current: location.pathname === '/asha/appointments',
          },
        ];

      case 'pharmacy':
        return [
          ...baseItems,
          {
            name: 'Prescriptions',
            href: '/pharmacy/prescriptions',
            icon: FileText,
            current: location.pathname === '/pharmacy/prescriptions',
          },
          {
            name: 'Inventory',
            href: '/pharmacy/inventory',
            icon: PackageIcon,
            current: location.pathname === '/pharmacy/inventory',
          },
        ];

      case 'admin':
        return [
          ...baseItems,
          {
            name: 'Users',
            href: '/admin/users',
            icon: Users,
            current: location.pathname === '/admin/users',
          },
          {
            name: 'Appointments',
            href: '/admin/appointments',
            icon: Calendar,
            current: location.pathname === '/admin/appointments',
          },
          {
            name: 'Prescriptions',
            href: '/admin/prescriptions',
            icon: FileText,
            current: location.pathname === '/admin/prescriptions',
          },
          {
            name: 'Reports',
            href: '/admin/reports',
            icon: BarChart3,
            current: location.pathname === '/admin/reports',
          },
        ];

      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems(user?.role);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''} hidden md:block`}>
        <div className="flex h-full flex-col">
          {/* Menu Toggle Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-bold text-gray-900 dark:text-gray-100 sidebar-text ${sidebarCollapsed ? 'hidden' : ''}`}>Menu</h2>
            <button
              onClick={() => dispatch(toggleSidebarCollapse())}
              className="p-2 rounded-md text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-800 border-r-4 border-primary-600 dark:bg-primary-900/20 dark:text-primary-200 dark:border-primary-400 shadow-sm'
                        : 'text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                    }`
                  }
                >
                  <Icon
                    size={20}
                    className={`sidebar-icon flex-shrink-0 ${
                      sidebarCollapsed ? 'mx-auto' : 'mr-3'
                    } ${
                      item.current
                        ? 'text-primary-600 dark:text-primary-300'
                        : 'text-gray-600 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-100'
                    }`}
                  />
                  <span className={`sidebar-text font-medium ${sidebarCollapsed ? 'hidden' : ''}`}>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-800 dark:text-gray-200 text-center space-y-1">
              <p className={`sidebar-text font-medium ${sidebarCollapsed ? 'hidden' : ''}`}>v1.0.0</p>
              <p className={`sidebar-text font-medium ${sidebarCollapsed ? 'hidden' : ''}`}>Rural Healthcare</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} md:hidden`}>
        <div className="flex h-full flex-col">
          {/* Menu Toggle Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Menu</h2>
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 rounded-md text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Close Sidebar"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-800 border-r-4 border-primary-600 dark:bg-primary-900/20 dark:text-primary-200 dark:border-primary-400 shadow-sm'
                        : 'text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                    }`
                  }
                >
                  <Icon
                    size={20}
                    className={`mr-3 flex-shrink-0 ${
                      item.current
                        ? 'text-primary-600 dark:text-primary-300'
                        : 'text-gray-600 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-100'
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-800 dark:text-gray-200 text-center space-y-1">
              <p className="font-medium">v1.0.0</p>
              <p className="font-medium">Rural Healthcare</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;