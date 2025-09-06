import React, { useState } from 'react';
import { Heart, FileText, Activity, Download, Eye, Calendar, User, Filter, Search, TrendingUp, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const PatientHealthRecords = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  // Mock data - in real app, this would come from API calls
  const healthRecords = [
    {
      id: 1,
      type: 'lab_report',
      title: 'Blood Test Report',
      date: '2024-01-10',
      doctor: 'Dr. Rajesh Kumar',
      status: 'normal',
      description: 'Complete Blood Count (CBC) and Lipid Profile',
      results: [
        { parameter: 'Hemoglobin', value: '14.2 g/dL', normal: '12-16 g/dL', status: 'normal' },
        { parameter: 'Total Cholesterol', value: '180 mg/dL', normal: '<200 mg/dL', status: 'normal' },
        { parameter: 'LDL Cholesterol', value: '110 mg/dL', normal: '<100 mg/dL', status: 'high' },
        { parameter: 'HDL Cholesterol', value: '45 mg/dL', normal: '>40 mg/dL', status: 'normal' }
      ],
      notes: 'Overall health is good. Consider lifestyle changes to improve LDL levels.'
    },
    {
      id: 2,
      type: 'imaging',
      title: 'Chest X-Ray',
      date: '2024-01-08',
      doctor: 'Dr. Priya Sharma',
      status: 'normal',
      description: 'Chest X-Ray - PA and Lateral views',
      results: [
        { parameter: 'Lung Fields', value: 'Clear', normal: 'Clear', status: 'normal' },
        { parameter: 'Heart Size', value: 'Normal', normal: 'Normal', status: 'normal' },
        { parameter: 'Bone Structure', value: 'Intact', normal: 'Intact', status: 'normal' }
      ],
      notes: 'No acute findings. Lungs are clear bilaterally.'
    },
    {
      id: 3,
      type: 'vital_signs',
      title: 'Vital Signs Check',
      date: '2024-01-12',
      doctor: 'Dr. Amit Singh',
      status: 'normal',
      description: 'Routine vital signs measurement',
      results: [
        { parameter: 'Blood Pressure', value: '120/80 mmHg', normal: '<140/90 mmHg', status: 'normal' },
        { parameter: 'Heart Rate', value: '72 bpm', normal: '60-100 bpm', status: 'normal' },
        { parameter: 'Temperature', value: '98.6°F', normal: '97-99°F', status: 'normal' },
        { parameter: 'Oxygen Saturation', value: '98%', normal: '>95%', status: 'normal' }
      ],
      notes: 'All vital signs are within normal range.'
    },
    {
      id: 4,
      type: 'lab_report',
      title: 'Diabetes Screening',
      date: '2024-01-05',
      doctor: 'Dr. Neha Gupta',
      status: 'abnormal',
      description: 'Fasting Blood Glucose and HbA1c',
      results: [
        { parameter: 'Fasting Glucose', value: '110 mg/dL', normal: '<100 mg/dL', status: 'high' },
        { parameter: 'HbA1c', value: '6.2%', normal: '<5.7%', status: 'high' },
        { parameter: 'Random Glucose', value: '140 mg/dL', normal: '<140 mg/dL', status: 'normal' }
      ],
      notes: 'Prediabetes detected. Recommend dietary changes and regular monitoring.'
    }
  ];

  const filteredRecords = healthRecords.filter(record => {
    const matchesFilter = filter === 'all' || record.type === filter;
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lab_report':
        return <FileText size={20} className="text-blue-600" />;
      case 'imaging':
        return <Activity size={20} className="text-green-600" />;
      case 'vital_signs':
        return <Heart size={20} className="text-red-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
  };


  const getStatusColor = (status) => {
    const colors = {
      normal: 'badge-success',
      abnormal: 'badge-error',
      high: 'badge-warning',
      low: 'badge-warning'
    };
    return colors[status] || 'badge-secondary';
  };

  const getResultStatusIcon = (status) => {
    switch (status) {
      case 'normal':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'high':
      case 'abnormal':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'low':
        return <AlertCircle size={16} className="text-yellow-600" />;
      default:
        return <TrendingUp size={16} className="text-gray-600" />;
    }
  };

  const handleDownloadRecord = (recordId) => {
    // In a real app, this would download a PDF
    console.log('Downloading record:', recordId);
  };

  const handleViewRecord = (recordId) => {
    // In a real app, this would open a detailed view
    console.log('Viewing record:', recordId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
        <p className="text-gray-600">View your medical reports, test results, and health data</p>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title, doctor, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Records</option>
                <option value="lab_report">Lab Reports</option>
                <option value="imaging">Imaging</option>
                <option value="vital_signs">Vital Signs</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Health Records List */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <div key={record.id} className="card">
            <div className="card-header">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getTypeIcon(record.type)}
                  <div>
                    <h3 className="card-title">{record.title}</h3>
                    <p className="text-sm text-gray-600">{record.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                      <div className="flex items-center space-x-1">
                        <User size={16} />
                        <span>{record.doctor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                      <span className={`badge ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewRecord(record.id)}
                    className="btn btn-outline btn-sm flex items-center space-x-1"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDownloadRecord(record.id)}
                    className="btn btn-outline btn-sm flex items-center space-x-1"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="card-content">
              {/* Results */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Test Results</h5>
                <div className="space-y-2">
                  {record.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{result.parameter}</span>
                          {getResultStatusIcon(result.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>Value: <strong>{result.value}</strong></span>
                          <span>Normal: {result.normal}</span>
                        </div>
                      </div>
                      <span className={`badge ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {record.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h6 className="font-medium text-gray-900 mb-2">Doctor's Notes</h6>
                  <p className="text-sm text-gray-600">{record.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Records */}
      {filteredRecords.length === 0 && (
        <div className="card">
          <div className="card-content text-center py-12">
            <Heart size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No health records found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You don\'t have any health records yet.'
              }
            </p>
            <p className="text-sm text-gray-500">
              Health records will appear here after your medical tests and appointments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHealthRecords;