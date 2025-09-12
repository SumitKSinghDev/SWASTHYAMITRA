import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Package, 
  Search, 
  Filter, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

const PharmacyInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Mock data - in real app, this would come from API calls
  const inventory = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      currentStock: 15,
      minStock: 50,
      maxStock: 200,
      unitPrice: 2.50,
      expiryDate: '2025-12-31',
      status: 'critical',
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      name: 'Amoxicillin 250mg',
      category: 'Antibiotic',
      currentStock: 8,
      minStock: 30,
      maxStock: 100,
      unitPrice: 5.00,
      expiryDate: '2025-06-30',
      status: 'critical',
      lastUpdated: '2024-01-14'
    },
    {
      id: 3,
      name: 'Metformin 500mg',
      category: 'Diabetes',
      currentStock: 25,
      minStock: 50,
      maxStock: 150,
      unitPrice: 3.00,
      expiryDate: '2025-09-15',
      status: 'low',
      lastUpdated: '2024-01-16'
    },
    {
      id: 4,
      name: 'Ibuprofen 400mg',
      category: 'Pain Relief',
      currentStock: 35,
      minStock: 50,
      maxStock: 120,
      unitPrice: 4.00,
      expiryDate: '2025-11-20',
      status: 'low',
      lastUpdated: '2024-01-17'
    },
    {
      id: 5,
      name: 'Omeprazole 20mg',
      category: 'Gastrointestinal',
      currentStock: 12,
      minStock: 30,
      maxStock: 80,
      unitPrice: 6.50,
      expiryDate: '2025-08-10',
      status: 'critical',
      lastUpdated: '2024-01-13'
    },
    {
      id: 6,
      name: 'Amlodipine 5mg',
      category: 'Cardiovascular',
      currentStock: 65,
      minStock: 40,
      maxStock: 100,
      unitPrice: 8.00,
      expiryDate: '2025-10-25',
      status: 'good',
      lastUpdated: '2024-01-18'
    },
    {
      id: 7,
      name: 'Insulin Glargine',
      category: 'Diabetes',
      currentStock: 5,
      minStock: 10,
      maxStock: 25,
      unitPrice: 500.00,
      expiryDate: '2024-12-31',
      status: 'low',
      lastUpdated: '2024-01-19'
    },
    {
      id: 8,
      name: 'Atorvastatin 20mg',
      category: 'Cardiovascular',
      currentStock: 45,
      minStock: 30,
      maxStock: 80,
      unitPrice: 12.00,
      expiryDate: '2025-07-15',
      status: 'good',
      lastUpdated: '2024-01-20'
    }
  ];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Click handlers
  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setShowEditModal(true);
  };

  const handleAddStock = (medicine) => {
    console.log('Adding stock for:', medicine.name);
    // In real app, this would open add stock modal
  };

  const handleRemoveStock = (medicine) => {
    console.log('Removing stock for:', medicine.name);
    // In real app, this would open remove stock modal
  };

  const handleDelete = (medicine) => {
    if (window.confirm(`Are you sure you want to delete ${medicine.name}?`)) {
      console.log('Deleting medicine:', medicine.name);
      // In real app, this would make API call to delete
    }
  };

  const handleAddMedicine = () => {
    setShowAddForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'good':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'low':
        return <TrendingDown size={16} className="text-yellow-600" />;
      case 'good':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <Package size={16} className="text-gray-600" />;
    }
  };

  const getStockPercentage = (current, min, max) => {
    const range = max - min;
    const currentRelative = current - min;
    return Math.max(0, Math.min(100, (currentRelative / range) * 100));
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your pharmacy stock and medications</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus size={20} className="mr-2" />
          Add Medicine
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package size={24} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Critical Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventory.filter(item => item.status === 'critical').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingDown size={24} className="text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventory.filter(item => item.status === 'low').length}
                </p>
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
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Good Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventory.filter(item => item.status === 'good').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by medicine name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Status</option>
                <option value="critical">Critical</option>
                <option value="low">Low Stock</option>
                <option value="good">Good Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package size={20} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {item.id.toString().padStart(3, '0')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${
                              item.status === 'critical' ? 'bg-red-500' :
                              item.status === 'low' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${getStockPercentage(item.currentStock, item.minStock, item.maxStock)}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-900">
                          {item.currentStock}/{item.maxStock}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Min: {item.minStock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">{item.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.expiryDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Medicine"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleAddStock(item)}
                          className="text-green-600 hover:text-green-900"
                          title="Add Stock"
                        >
                          <Plus size={16} />
                        </button>
                        <button 
                          onClick={() => handleRemoveStock(item)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Remove Stock"
                        >
                          <Minus size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Medicine"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by adding your first medicine to the inventory.'
            }
          </p>
          <button 
            onClick={handleAddMedicine}
            className="btn btn-primary"
          >
            <Plus size={20} className="mr-2" />
            Add First Medicine
          </button>
        </div>
      )}

      {/* Add Medicine Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Medicine</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine Name
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Enter medicine name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select className="input w-full">
                  <option value="">Select Category</option>
                  <option value="Pain Relief">Pain Relief</option>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input w-full"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  className="input w-full"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyInventory;
