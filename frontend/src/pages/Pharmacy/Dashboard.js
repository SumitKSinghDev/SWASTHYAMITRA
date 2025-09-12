import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Package, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  MapPin,
  Phone,
  Calendar
} from 'lucide-react';

const PharmacyDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  
  // Mock data - in real app, this would come from API calls
  const stats = {
    totalPrescriptions: 89,
    pendingPrescriptions: 12,
    completedPrescriptions: 67,
    totalRevenue: 45600,
    lowStockItems: 5,
    todayPrescriptions: 8,
    monthlyRevenue: 45600,
    customerSatisfaction: 4.8
  };

  const recentPrescriptions = [
    {
      id: 1,
      prescriptionId: 'RX001234',
      patientName: 'Ram Singh',
      doctorName: 'Dr. Priya Sharma',
      date: '2024-01-20',
      status: 'pending',
      totalAmount: 450,
      medications: ['Metformin 500mg', 'Amlodipine 5mg']
    },
    {
      id: 2,
      prescriptionId: 'RX001235',
      patientName: 'Sunita Devi',
      doctorName: 'Dr. Rajesh Kumar',
      date: '2024-01-20',
      status: 'completed',
      totalAmount: 320,
      medications: ['Paracetamol 500mg', 'Ibuprofen 400mg']
    },
    {
      id: 3,
      prescriptionId: 'RX001236',
      patientName: 'Amit Kumar',
      doctorName: 'Dr. Priya Sharma',
      date: '2024-01-19',
      status: 'in_progress',
      totalAmount: 680,
      medications: ['Insulin Glargine', 'Metformin 1000mg']
    }
  ];

  const lowStockItems = [
    { name: 'Paracetamol 500mg', currentStock: 15, minStock: 50, status: 'critical' },
    { name: 'Amoxicillin 250mg', currentStock: 8, minStock: 30, status: 'critical' },
    { name: 'Metformin 500mg', currentStock: 25, minStock: 50, status: 'low' },
    { name: 'Ibuprofen 400mg', currentStock: 35, minStock: 50, status: 'low' },
    { name: 'Omeprazole 20mg', currentStock: 12, minStock: 30, status: 'critical' }
  ];

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
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-green-100">
          {user.pharmacyName} | Pharmacy Manager
        </p>
        <div className="flex items-center mt-2 text-green-100">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">Nabha, Punjab</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPrescriptions}</p>
                <p className="text-xs text-green-600">+8 today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPrescriptions}</p>
                <p className="text-xs text-yellow-600">Needs attention</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedPrescriptions}</p>
                <p className="text-xs text-green-600">75% completion rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12% this month</p>
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
              to="/pharmacy/prescriptions"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText size={24} className="text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">View Prescriptions</h3>
                <p className="text-sm text-gray-600">Manage all prescriptions</p>
              </div>
            </Link>

            <Link
              to="/pharmacy/inventory"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Package size={24} className="text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Inventory</h3>
                <p className="text-sm text-gray-600">Manage stock levels</p>
              </div>
            </Link>

            <div 
              onClick={() => console.log('Adding new medicine...')}
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <Users size={24} className="text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Add Medicine</h3>
                <p className="text-sm text-gray-600">Add new medicine</p>
              </div>
            </div>

            <div 
              onClick={() => console.log('Generating reports...')}
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <Calendar size={24} className="text-orange-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Reports</h3>
                <p className="text-sm text-gray-600">Generate reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Prescriptions */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Prescriptions</h2>
            <Link
              to="/pharmacy/prescriptions"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {recentPrescriptions.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">{prescription.prescriptionId}</h3>
                      <p className="text-sm text-gray-600">{prescription.patientName}</p>
                      <p className="text-xs text-gray-500">{prescription.doctorName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      prescription.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : prescription.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {prescription.status}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">₹{prescription.totalAmount}</p>
                    <p className="text-xs text-gray-500">{prescription.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            <span className="text-sm text-red-600 font-medium">{stats.lowStockItems} items</span>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle size={16} className="text-red-600 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-600">Current: {item.currentStock} | Min: {item.minStock}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.status === 'critical' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
        </div>
        <div className="card-content">
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp size={48} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Revenue chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
