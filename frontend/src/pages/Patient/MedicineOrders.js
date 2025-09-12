import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Star,
  MapPin,
  Phone,
  Search,
  Filter,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react';

const MedicineOrders = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  // Sample data for demonstration
  const sampleOrders = [
    {
      _id: '1',
      orderNumber: 'MO241201ABC123',
      pharmacy: {
        _id: '1',
        pharmacyName: 'Nabha Medical Store',
        address: {
          street: 'Main Road, Near Bus Stand',
          city: 'Nabha',
          state: 'Punjab'
        },
        contact: {
          phone: '+91-9876543210'
        },
        rating: { average: 4.2, count: 45 }
      },
      items: [
        {
          medicine: {
            name: 'Paracetamol 500mg',
            dosage: '500mg',
            form: 'tablet',
            manufacturer: 'ABC Pharma'
          },
          quantity: 2,
          unitPrice: 5,
          totalPrice: 10
        },
        {
          medicine: {
            name: 'Amoxicillin 250mg',
            dosage: '250mg',
            form: 'capsule',
            manufacturer: 'XYZ Pharma'
          },
          quantity: 1,
          unitPrice: 15,
          totalPrice: 15
        }
      ],
      status: 'delivered',
      deliveryType: 'home_delivery',
      deliveryAddress: {
        street: '123 Main Street',
        city: 'Nabha',
        state: 'Punjab',
        pincode: '147201'
      },
      pricing: {
        subtotal: 25,
        deliveryFee: 10,
        tax: 2,
        total: 37
      },
      payment: {
        method: 'cash_on_delivery',
        status: 'completed'
      },
      timeline: [
        { status: 'pending', timestamp: '2024-12-01T10:00:00Z', note: 'Order placed' },
        { status: 'confirmed', timestamp: '2024-12-01T10:30:00Z', note: 'Order confirmed by pharmacy' },
        { status: 'preparing', timestamp: '2024-12-01T11:00:00Z', note: 'Medicines being prepared' },
        { status: 'out_for_delivery', timestamp: '2024-12-01T14:00:00Z', note: 'Out for delivery' },
        { status: 'delivered', timestamp: '2024-12-01T16:30:00Z', note: 'Delivered successfully' }
      ],
      rating: {
        overall: 5,
        delivery: 5,
        medicine: 4,
        comment: 'Great service, medicines delivered on time'
      },
      createdAt: '2024-12-01T10:00:00Z'
    },
    {
      _id: '2',
      orderNumber: 'MO241201DEF456',
      pharmacy: {
        _id: '2',
        pharmacyName: 'City Pharmacy',
        address: {
          street: 'Railway Road',
          city: 'Nabha',
          state: 'Punjab'
        },
        contact: {
          phone: '+91-9876543211'
        },
        rating: { average: 4.5, count: 78 }
      },
      items: [
        {
          medicine: {
            name: 'Vitamin D3',
            dosage: '1000 IU',
            form: 'tablet',
            manufacturer: 'Health Plus'
          },
          quantity: 1,
          unitPrice: 120,
          totalPrice: 120
        }
      ],
      status: 'ready_for_pickup',
      deliveryType: 'pickup',
      deliveryAddress: {
        street: '456 Park Avenue',
        city: 'Nabha',
        state: 'Punjab',
        pincode: '147201'
      },
      pricing: {
        subtotal: 120,
        deliveryFee: 0,
        tax: 6,
        total: 126
      },
      payment: {
        method: 'online',
        status: 'completed'
      },
      timeline: [
        { status: 'pending', timestamp: '2024-12-02T09:00:00Z', note: 'Order placed' },
        { status: 'confirmed', timestamp: '2024-12-02T09:15:00Z', note: 'Order confirmed' },
        { status: 'preparing', timestamp: '2024-12-02T09:30:00Z', note: 'Preparing order' },
        { status: 'ready_for_pickup', timestamp: '2024-12-02T10:00:00Z', note: 'Ready for pickup' }
      ],
      createdAt: '2024-12-02T09:00:00Z'
    }
  ];

  const samplePharmacies = [
    {
      _id: '1',
      pharmacyName: 'Nabha Medical Store',
      address: {
        street: 'Main Road, Near Bus Stand',
        city: 'Nabha',
        state: 'Punjab'
      },
      contact: {
        phone: '+91-9876543210'
      },
      rating: { average: 4.2, count: 45 },
      deliveryFee: 10,
      minimumOrderAmount: 50,
      services: ['home_delivery', 'pickup']
    },
    {
      _id: '2',
      pharmacyName: 'City Pharmacy',
      address: {
        street: 'Railway Road',
        city: 'Nabha',
        state: 'Punjab'
      },
      contact: {
        phone: '+91-9876543211'
      },
      rating: { average: 4.5, count: 78 },
      deliveryFee: 15,
      minimumOrderAmount: 100,
      services: ['home_delivery', 'pickup']
    }
  ];

  useEffect(() => {
    setOrders(sampleOrders);
    setPharmacies(samplePharmacies);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'preparing': return <Package className="w-5 h-5 text-orange-500" />;
      case 'ready_for_pickup': return <Package className="w-5 h-5 text-purple-500" />;
      case 'out_for_delivery': return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'ready_for_pickup': return 'text-purple-600 bg-purple-100';
      case 'out_for_delivery': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.pharmacy.pharmacyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      // In real app, this would be an API call
      // await axios.put(`${API_BASE}/medicine-orders/${orderId}/cancel`, {
      //   reason: 'User requested cancellation'
      // }, {
      //   headers: { Authorization: `Bearer ${user.token}` }
      // });

      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: 'cancelled' }
          : order
      ));
    } catch (error) {
      setError('Failed to cancel order');
    }
  };

  const handleRateOrder = async (orderId, rating) => {
    try {
      // In real app, this would be an API call
      // await axios.post(`${API_BASE}/medicine-orders/${orderId}/rate`, rating, {
      //   headers: { Authorization: `Bearer ${user.token}` }
      // });

      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, rating }
          : order
      ));
    } catch (error) {
      setError('Failed to rate order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Orders</h1>
          <p className="text-gray-600">Track and manage your medicine orders</p>
        </div>
        <button
          onClick={() => setShowOrderForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>New Order</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Place your first medicine order'}
            </p>
            <button
              onClick={() => setShowOrderForm(true)}
              className="btn btn-primary"
            >
              Place Order
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="card hover:shadow-lg transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{order.pharmacy.pharmacyName}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock size={14} />
                          <span>Ordered on {formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{order.pricing.total}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.deliveryType === 'home_delivery' ? 'Home Delivery' : 'Pickup'}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium text-gray-900">{item.medicine.name}</span>
                          <span className="text-gray-600 ml-2">
                            {item.quantity} x ₹{item.unitPrice}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">₹{item.totalPrice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn btn-outline btn-sm flex items-center space-x-1"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                    
                    {order.status === 'delivered' && !order.rating && (
                      <button
                        onClick={() => {
                          const rating = prompt('Rate this order (1-5):');
                          if (rating && rating >= 1 && rating <= 5) {
                            handleRateOrder(order._id, {
                              overall: parseInt(rating),
                              delivery: parseInt(rating),
                              medicine: parseInt(rating)
                            });
                          }
                        }}
                        className="btn btn-outline btn-sm flex items-center space-x-1"
                      >
                        <Star size={14} />
                        <span>Rate Order</span>
                      </button>
                    )}

                    {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="btn btn-outline btn-sm text-red-600 hover:text-red-700"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="btn btn-outline btn-sm">
                      <Phone size={14} />
                      <span>Call Pharmacy</span>
                    </button>
                    {order.status === 'ready_for_pickup' && (
                      <button className="btn btn-primary btn-sm">
                        <MapPin size={14} />
                        <span>Get Directions</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details - {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusLabel(selectedOrder.status)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span>{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Type:</span>
                        <span>{selectedOrder.deliveryType === 'home_delivery' ? 'Home Delivery' : 'Pickup'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="capitalize">{selectedOrder.payment.method.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pharmacy Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin size={14} />
                        <span>{selectedOrder.pharmacy.pharmacyName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone size={14} />
                        <span>{selectedOrder.pharmacy.contact.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star size={14} />
                        <span>{selectedOrder.pharmacy.rating.average} ({selectedOrder.pharmacy.rating.count} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h3>
                    <div className="text-sm text-gray-600">
                      <p>{selectedOrder.deliveryAddress.street}</p>
                      <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}</p>
                      <p>{selectedOrder.deliveryAddress.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Timeline</h3>
                  <div className="space-y-3">
                    {selectedOrder.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getStatusIcon(event.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {getStatusLabel(event.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                          {event.note && (
                            <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{selectedOrder.pricing.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span>₹{selectedOrder.pricing.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>₹{selectedOrder.pricing.tax}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>₹{selectedOrder.pricing.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineOrders;
