import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Users, 
  Calendar, 
  FileText, 
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  QrCode,
  BarChart3,
  Settings
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  
  // Initialize stats to zero for fresh systems or new tenants; replace with API data when available
  const stats = {
    totalUsers: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    totalNabhaCards: 0,
    activeUsers: 0,
    pendingVerifications: 0,
    todayAppointments: 0,
    systemHealth: 100
  };

  const userStats = [];

  const recentActivity = [];

  const systemAlerts = [];

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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-purple-100">
          System Administrator | SWASTHYAMITRA Platform
        </p>
        <div className="flex items-center mt-2 text-purple-100">
          <Activity size={16} className="mr-1" />
          <span className="text-sm">System Health: {stats.systemHealth}%</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">+12 this week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                <p className="text-xs text-green-600">+8 today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPrescriptions}</p>
                <p className="text-xs text-green-600">+5 today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <QrCode size={24} className="text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">NABHA Cards</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNabhaCards}</p>
                <p className="text-xs text-green-600">+3 today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Users size={24} className="text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage all users</p>
              </div>
            </Link>

            <Link
              to="/admin/appointments"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Calendar size={24} className="text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Appointments</h3>
                <p className="text-sm text-gray-600">Monitor all appointments</p>
              </div>
            </Link>

            <Link
              to="/admin/prescriptions"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FileText size={24} className="text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Prescriptions</h3>
                <p className="text-sm text-gray-600">Track all prescriptions</p>
              </div>
            </Link>

            <Link
              to="/admin/reports"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <BarChart3 size={24} className="text-orange-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Reports</h3>
                <p className="text-sm text-gray-600">Generate system reports</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Statistics */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">User Distribution</h2>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {userStats.map((stat) => (
                <div key={stat.role} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full bg-${stat.color}-500 mr-3`}></div>
                    <span className="text-sm font-medium text-gray-900">{stat.role}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{stat.percentage}%</span>
                    <span className="text-sm font-semibold text-gray-900">{stat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                  alert.type === 'error' ? 'border-red-400 bg-red-50' :
                  alert.type === 'success' ? 'border-green-400 bg-green-50' :
                  'border-blue-400 bg-blue-50'
                }`}>
                  <div className="flex items-start">
                    <AlertCircle size={16} className={`mt-0.5 mr-2 ${
                      alert.type === 'warning' ? 'text-yellow-600' :
                      alert.type === 'error' ? 'text-red-600' :
                      alert.type === 'success' ? 'text-green-600' :
                      'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link
            to="/admin/activity"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <activity.icon size={16} className={activity.color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
