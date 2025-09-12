import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { downloadReport, downloadCSV, downloadJSON } from '../../utils/downloadUtils';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  FileText,
  Download,
  Filter,
  Calendar as CalendarIcon,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Stethoscope,
  Package,
  MapPin
} from 'lucide-react';

const AdminReports = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-01-31'
  });
  
  // Mock data - in real app, this would come from API calls
  const reportData = {
    overview: {
      totalUsers: 1247,
      totalAppointments: 3456,
      totalPrescriptions: 2890,
      totalRevenue: 125000,
      activeDoctors: 12,
      activePharmacies: 8,
      ashaWorkers: 25,
      patients: 1200
    },
    appointments: {
      total: 3456,
      confirmed: 2890,
      completed: 2456,
      cancelled: 234,
      pending: 566,
      byMonth: [
        { month: 'Jan', count: 1200, revenue: 45000 },
        { month: 'Feb', count: 1350, revenue: 52000 },
        { month: 'Mar', count: 906, revenue: 28000 }
      ],
      bySpecialization: [
        { specialization: 'General Medicine', count: 1200, percentage: 35 },
        { specialization: 'Cardiology', count: 890, percentage: 26 },
        { specialization: 'Pediatrics', count: 756, percentage: 22 },
        { specialization: 'Gynecology', count: 610, percentage: 17 }
      ]
    },
    prescriptions: {
      total: 2890,
      active: 1890,
      completed: 890,
      expired: 110,
      byMonth: [
        { month: 'Jan', count: 1000, revenue: 35000 },
        { month: 'Feb', count: 1100, revenue: 40000 },
        { month: 'Mar', count: 790, revenue: 25000 }
      ],
      topMedicines: [
        { name: 'Metformin 500mg', count: 450, revenue: 13500 },
        { name: 'Amlodipine 5mg', count: 320, revenue: 9600 },
        { name: 'Paracetamol 500mg', count: 280, revenue: 1680 },
        { name: 'Insulin Glargine', count: 150, revenue: 7500 }
      ]
    },
    users: {
      total: 1247,
      patients: 1200,
      doctors: 12,
      pharmacies: 8,
      ashaWorkers: 25,
      admins: 2,
      byMonth: [
        { month: 'Jan', count: 400 },
        { month: 'Feb', count: 450 },
        { month: 'Mar', count: 397 }
      ],
      activity: [
        { role: 'Patient', active: 1150, inactive: 50 },
        { role: 'Doctor', active: 11, inactive: 1 },
        { role: 'Pharmacy', active: 7, inactive: 1 },
        { role: 'ASHA Worker', active: 23, inactive: 2 }
      ]
    },
    revenue: {
      total: 125000,
      byMonth: [
        { month: 'Jan', revenue: 45000, appointments: 1200, prescriptions: 1000 },
        { month: 'Feb', revenue: 52000, appointments: 1350, prescriptions: 1100 },
        { month: 'Mar', revenue: 28000, appointments: 906, prescriptions: 790 }
      ],
      bySource: [
        { source: 'Appointments', amount: 75000, percentage: 60 },
        { source: 'Prescriptions', amount: 50000, percentage: 40 }
      ]
    }
  };

  const getCurrentReportData = () => {
    // Generate report data based on current selection
    const baseData = {
      reportType: selectedReport,
      period: selectedPeriod,
      dateRange: selectedPeriod === 'custom' ? dateRange : null,
      generatedAt: new Date().toISOString(),
      data: reportData[selectedReport] || {}
    };
    return baseData;
  };

  const getReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users size={24} className="text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalUsers.toLocaleString()}</p>
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
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Appointments</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalAppointments.toLocaleString()}</p>
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
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalPrescriptions.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <DollarSign size={24} className="text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{reportData.overview.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
                </div>
                <div className="card-content">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserCheck size={20} className="text-blue-600 mr-2" />
                        <span className="text-gray-700">Patients</span>
                      </div>
                      <span className="font-semibold text-gray-900">{reportData.overview.patients}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Stethoscope size={20} className="text-green-600 mr-2" />
                        <span className="text-gray-700">Doctors</span>
                      </div>
                      <span className="font-semibold text-gray-900">{reportData.overview.activeDoctors}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package size={20} className="text-purple-600 mr-2" />
                        <span className="text-gray-700">Pharmacies</span>
                      </div>
                      <span className="font-semibold text-gray-900">{reportData.overview.activePharmacies}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin size={20} className="text-orange-600 mr-2" />
                        <span className="text-gray-700">ASHA Workers</span>
                      </div>
                      <span className="font-semibold text-gray-900">{reportData.overview.ashaWorkers}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                </div>
                <div className="card-content">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Uptime</span>
                      <span className="font-semibold text-green-600">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Response Time</span>
                      <span className="font-semibold text-green-600">120ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Active Sessions</span>
                      <span className="font-semibold text-blue-600">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Database Size</span>
                      <span className="font-semibold text-gray-600">2.4 GB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            {/* Appointment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="card">
                <div className="card-content text-center">
                  <Calendar size={24} className="mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{reportData.appointments.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
              <div className="card">
                <div className="card-content text-center">
                  <CheckCircle size={24} className="mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{reportData.appointments.confirmed}</p>
                  <p className="text-sm text-gray-600">Confirmed</p>
                </div>
              </div>
              <div className="card">
                <div className="card-content text-center">
                  <CheckCircle size={24} className="mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{reportData.appointments.completed}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
              <div className="card">
                <div className="card-content text-center">
                  <AlertCircle size={24} className="mx-auto text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{reportData.appointments.cancelled}</p>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </div>
              </div>
              <div className="card">
                <div className="card-content text-center">
                  <Clock size={24} className="mx-auto text-yellow-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{reportData.appointments.pending}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Appointment Trends</h3>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {reportData.appointments.byMonth.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(month.count / 1400) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-16 text-right">{month.count}</span>
                        <span className="text-gray-600 w-20 text-right">₹{month.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* By Specialization */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Appointments by Specialization</h3>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {reportData.appointments.bySpecialization.map((spec, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{spec.specialization}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${spec.percentage}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-16 text-right">{spec.count}</span>
                        <span className="text-gray-600 w-12 text-right">{spec.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'prescriptions':
        return (
          <div className="space-y-6">
            {/* Prescription Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card">
                <div className="card-content text-center">
                  <FileText size={24} className="mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{reportData.prescriptions.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
              <div className="card">
                <div className="card-content text-center">
                  <CheckCircle size={24} className="mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{reportData.prescriptions.active}</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
              </div>
              <div className="card">
                <div className="card-content text-center">
                  <CheckCircle size={24} className="mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{reportData.prescriptions.completed}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
              <div className="card">
                <div className="card-content text-center">
                  <AlertCircle size={24} className="mx-auto text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{reportData.prescriptions.expired}</p>
                  <p className="text-sm text-gray-600">Expired</p>
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Prescription Trends</h3>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {reportData.prescriptions.byMonth.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${(month.count / 1200) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-16 text-right">{month.count}</span>
                        <span className="text-gray-600 w-20 text-right">₹{month.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Medicines */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Top Prescribed Medicines</h3>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {reportData.prescriptions.topMedicines.map((medicine, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{medicine.name}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${(medicine.count / 500) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-16 text-right">{medicine.count}</span>
                        <span className="text-gray-600 w-20 text-right">₹{medicine.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-6">
            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <div className="card-content text-center">
                  <DollarSign size={24} className="mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">₹{reportData.revenue.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
              <div className="card">
                <div className="card-content text-center">
                  <TrendingUp size={24} className="mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">+12.5%</p>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                </div>
              </div>
              <div className="card">
                <div className="card-content text-center">
                  <Activity size={24} className="mx-auto text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">₹4,167</p>
                  <p className="text-sm text-gray-600">Daily Average</p>
                </div>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Breakdown</h3>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {reportData.revenue.byMonth.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(month.revenue / 55000) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-20 text-right">₹{month.revenue.toLocaleString()}</span>
                        <span className="text-gray-600 w-16 text-right">{month.appointments} apps</span>
                        <span className="text-gray-600 w-16 text-right">{month.prescriptions} rx</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue by Source */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Revenue by Source</h3>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {reportData.revenue.bySource.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{source.source}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-20 text-right">₹{source.amount.toLocaleString()}</span>
                        <span className="text-gray-600 w-12 text-right">{source.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive insights into platform performance and usage</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button 
            onClick={() => {
              const reportData = getCurrentReportData();
              downloadReport(reportData, 'csv');
              alert('Report exported successfully!');
            }}
            className="btn btn-outline"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
          <button 
            onClick={() => {
              const reportData = getCurrentReportData();
              downloadReport(reportData, 'json');
              alert('Report generated and downloaded!');
            }}
            className="btn btn-primary"
          >
            <BarChart3 size={16} className="mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="input w-full"
              >
                <option value="overview">Overview</option>
                <option value="appointments">Appointments</option>
                <option value="prescriptions">Prescriptions</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input w-full"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            {selectedPeriod === 'custom' && (
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="input flex-1"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="input flex-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      {getReportContent()}
    </div>
  );
};

export default AdminReports;
