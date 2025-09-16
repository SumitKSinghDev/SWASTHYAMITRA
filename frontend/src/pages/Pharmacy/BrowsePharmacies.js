import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Phone, Star, Clock, Truck, Package, Search, Filter } from 'lucide-react';

const BrowsePharmacies = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState('');
  const [sort, setSort] = useState('rating');
  const [order, setOrder] = useState('desc');

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchPharmacies = async (resetPage = false) => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: resetPage ? 1 : page,
        limit: 12,
        sort,
        order,
      };
      if (search) params.search = search;
      if (city) params.city = city;
      if (service) params.service = service;

      const { data } = await axios.get(`${API_BASE}/pharmacies`, { params });
      setPharmacies(data?.data?.pharmacies || []);
      setTotalPages(data?.data?.pagination?.totalPages || 1);
      if (resetPage) setPage(1);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, service, sort, order]);

  useEffect(() => {
    fetchPharmacies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPharmacies(true);
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case 'home_delivery': return <Truck size={16} className="text-green-600" />;
      case 'pickup': return <Package size={16} className="text-blue-600" />;
      case 'online_consultation': return <Phone size={16} className="text-purple-600" />;
      case 'medicine_advice': return <Search size={16} className="text-orange-600" />;
      default: return <Package size={16} className="text-gray-600" />;
    }
  };

  const getServiceLabel = (service) => {
    switch (service) {
      case 'home_delivery': return 'Home Delivery';
      case 'pickup': return 'Pickup';
      case 'online_consultation': return 'Online Consultation';
      case 'medicine_advice': return 'Medicine Advice';
      default: return service;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find a Pharmacy</h1>
        <p className="text-gray-600">Browse verified pharmacies with medicine availability</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <form className="flex flex-col md:flex-row gap-4" onSubmit={handleSearch}>
            <div className="flex-1 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Search medicines or pharmacy..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">All Cities</option>
                <option value="nabha">Nabha</option>
                <option value="patiala">Patiala</option>
                <option value="amritsar">Amritsar</option>
                <option value="ludhiana">Ludhiana</option>
                <option value="chandigarh">Chandigarh</option>
              </select>
              <select
                className="input"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">All Services</option>
                <option value="home_delivery">Home Delivery</option>
                <option value="pickup">Pickup</option>
                <option value="online_consultation">Online Consultation</option>
                <option value="medicine_advice">Medicine Advice</option>
              </select>
            </div>
            <div className="flex gap-3">
              <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="rating">Rating</option>
                <option value="pharmacyName">Name</option>
                <option value="createdAt">Newest</option>
              </select>
              <select className="input" value={order} onChange={(e) => setOrder(e.target.value)}>
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
              <button className="btn btn-primary" type="submit">
                <Filter size={16} />
                Filter
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="col-span-full text-center text-red-600">{error}</div>
        ) : pharmacies.length === 0 ? (
          <div className="col-span-full text-center text-gray-600">No pharmacies found.</div>
        ) : (
          pharmacies.map((pharmacy) => (
            <div key={pharmacy._id} className="card hover:shadow-lg transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {pharmacy.pharmacyName}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Star size={14} className="text-yellow-500" />
                      <span>{pharmacy.rating?.average?.toFixed(1) || 0}</span>
                      <span>({pharmacy.rating?.count || 0} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {pharmacy.deliveryFee > 0 ? `₹${pharmacy.deliveryFee} delivery` : 'Free delivery'}
                    </div>
                    {pharmacy.minimumOrderAmount > 0 && (
                      <div className="text-xs text-gray-500">
                        Min. order ₹{pharmacy.minimumOrderAmount}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span>
                      {pharmacy.address?.street}, {pharmacy.address?.city}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone size={14} />
                    <span>{pharmacy.contact?.phone}</span>
                  </div>
                  {pharmacy.timings && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>
                        {pharmacy.timings.openTime} - {pharmacy.timings.closeTime}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {pharmacy.services?.map((service) => (
                      <span
                        key={service}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {getServiceIcon(service)}
                        <span>{getServiceLabel(service)}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm flex-1">
                    View Medicines
                  </button>
                  <button className="btn btn-primary btn-sm flex-1">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pharmacies.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <button
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            className="btn btn-outline btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowsePharmacies;
