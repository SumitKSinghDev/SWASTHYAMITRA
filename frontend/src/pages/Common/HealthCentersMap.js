import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Search, 
  Filter, 
  Navigation, 
  Users,
  Shield,
  Activity,
  Heart,
  Baby,
  Stethoscope,
  AlertCircle
} from 'lucide-react';

const HealthCentersMap = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [showMap, setShowMap] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const centerTypes = [
    { value: 'all', label: 'All Types', icon: MapPin },
    { value: 'primary_health_center', label: 'Primary Health Center', icon: Stethoscope },
    { value: 'community_health_center', label: 'Community Health Center', icon: Heart },
    { value: 'sub_center', label: 'Sub Center', icon: Activity },
    { value: 'asha_center', label: 'ASHA Center', icon: Users },
    { value: 'mini_health_center', label: 'Mini Health Center', icon: Shield }
  ];

  const services = [
    { value: 'all', label: 'All Services' },
    { value: 'general_consultation', label: 'General Consultation' },
    { value: 'maternal_health', label: 'Maternal Health' },
    { value: 'child_health', label: 'Child Health' },
    { value: 'immunization', label: 'Immunization' },
    { value: 'emergency_care', label: 'Emergency Care' },
    { value: 'laboratory_tests', label: 'Laboratory Tests' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'telemedicine', label: 'Telemedicine' }
  ];

  // Sample data for demonstration
  const sampleCenters = [
    {
      _id: '1',
      name: 'Nabha Primary Health Center',
      centerCode: 'NPC001',
      type: 'primary_health_center',
      address: {
        street: 'Main Road, Near Bus Stand',
        city: 'Nabha',
        state: 'Punjab',
        pincode: '147201',
        coordinates: {
          latitude: 30.3753,
          longitude: 76.1521
        }
      },
      contact: {
        phone: '+91-9876543210',
        email: 'npc@health.gov.in'
      },
      timings: {
        openTime: '08:00',
        closeTime: '18:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      services: ['general_consultation', 'maternal_health', 'child_health', 'immunization', 'pharmacy'],
      staff: { doctors: 3, nurses: 5, asha_workers: 2, other_staff: 4 },
      facilities: {
        hasPharmacy: true,
        hasLaboratory: true,
        hasEmergency: true,
        hasTelemedicine: true,
        hasAmbulance: true,
        hasWheelchairAccess: true,
        hasParking: true
      },
      rating: { average: 4.2, count: 45 },
      distance: 0.5
    },
    {
      _id: '2',
      name: 'Nabha Community Health Center',
      centerCode: 'NCC001',
      type: 'community_health_center',
      address: {
        street: 'Railway Road',
        city: 'Nabha',
        state: 'Punjab',
        pincode: '147201',
        coordinates: {
          latitude: 30.3800,
          longitude: 76.1500
        }
      },
      contact: {
        phone: '+91-9876543211',
        email: 'ncc@health.gov.in'
      },
      timings: {
        openTime: '07:00',
        closeTime: '19:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      services: ['general_consultation', 'maternal_health', 'child_health', 'immunization', 'emergency_care', 'laboratory_tests', 'pharmacy', 'telemedicine'],
      staff: { doctors: 5, nurses: 8, asha_workers: 4, other_staff: 6 },
      facilities: {
        hasPharmacy: true,
        hasLaboratory: true,
        hasEmergency: true,
        hasTelemedicine: true,
        hasAmbulance: true,
        hasWheelchairAccess: true,
        hasParking: true
      },
      rating: { average: 4.5, count: 78 },
      distance: 1.2
    },
    {
      _id: '3',
      name: 'Village Sub Center - Nabha',
      centerCode: 'NSC001',
      type: 'sub_center',
      address: {
        street: 'Village Road',
        city: 'Nabha',
        state: 'Punjab',
        pincode: '147201',
        coordinates: {
          latitude: 30.3700,
          longitude: 76.1400
        }
      },
      contact: {
        phone: '+91-9876543212',
        email: 'nsc@health.gov.in'
      },
      timings: {
        openTime: '09:00',
        closeTime: '17:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      services: ['general_consultation', 'maternal_health', 'child_health', 'immunization'],
      staff: { doctors: 1, nurses: 2, asha_workers: 3, other_staff: 1 },
      facilities: {
        hasPharmacy: false,
        hasLaboratory: false,
        hasEmergency: false,
        hasTelemedicine: true,
        hasAmbulance: false,
        hasWheelchairAccess: false,
        hasParking: true
      },
      rating: { average: 3.8, count: 23 },
      distance: 2.1
    },
    {
      _id: '4',
      name: 'ASHA Worker Center - Nabha',
      centerCode: 'AWC001',
      type: 'asha_center',
      address: {
        street: 'Community Center',
        city: 'Nabha',
        state: 'Punjab',
        pincode: '147201',
        coordinates: {
          latitude: 30.3850,
          longitude: 76.1550
        }
      },
      contact: {
        phone: '+91-9876543213',
        email: 'awc@health.gov.in'
      },
      timings: {
        openTime: '08:00',
        closeTime: '16:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      services: ['maternal_health', 'child_health', 'immunization', 'health_education', 'nutrition_counseling'],
      staff: { doctors: 0, nurses: 1, asha_workers: 5, other_staff: 2 },
      facilities: {
        hasPharmacy: false,
        hasLaboratory: false,
        hasEmergency: false,
        hasTelemedicine: true,
        hasAmbulance: false,
        hasWheelchairAccess: true,
        hasParking: false
      },
      rating: { average: 4.0, count: 34 },
      distance: 1.8
    }
  ];

  useEffect(() => {
    setCenters(sampleCenters);
    setFilteredCenters(sampleCenters);
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    filterCenters();
  }, [searchTerm, selectedType, selectedService, sortBy, centers]);

  const filterCenters = () => {
    let filtered = [...centers];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.services.some(service => 
          services.find(s => s.value === service)?.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(center => center.type === selectedType);
    }

    // Filter by service
    if (selectedService !== 'all') {
      filtered = filtered.filter(center => center.services.includes(selectedService));
    }

    // Sort
    if (sortBy === 'distance') {
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredCenters(filtered);
  };

  const getTypeIcon = (type) => {
    const typeData = centerTypes.find(t => t.value === type);
    return typeData?.icon || MapPin;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'primary_health_center': return 'text-blue-600 bg-blue-100';
      case 'community_health_center': return 'text-green-600 bg-green-100';
      case 'sub_center': return 'text-yellow-600 bg-yellow-100';
      case 'asha_center': return 'text-purple-600 bg-purple-100';
      case 'mini_health_center': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case 'general_consultation': return <Stethoscope size={14} />;
      case 'maternal_health': return <Heart size={14} />;
      case 'child_health': return <Baby size={14} />;
      case 'immunization': return <Shield size={14} />;
      case 'emergency_care': return <AlertCircle size={14} />;
      default: return <Activity size={14} />;
    }
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Locate Health Centers
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Find nearby health centers, ASHA worker centers, and mini health facilities. 
          Get directions, check services, and contact information.
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search health centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {centerTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              {services.map(service => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="distance">Sort by Distance</option>
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowMap(!showMap)}
          className="btn btn-outline flex items-center space-x-2"
        >
          <MapPin size={16} />
          <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
        </button>
      </div>

      {/* Map Placeholder */}
      {showMap && (
        <div className="card">
          <div className="card-content">
            <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map</h3>
                <p className="text-gray-600 mb-4">
                  Map integration would show health centers with markers and directions
                </p>
                <div className="flex gap-2 justify-center">
                  <button className="btn btn-primary btn-sm">
                    Get Directions
                  </button>
                  <button className="btn btn-outline btn-sm">
                    Share Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Centers List */}
      <div className="space-y-4">
        {filteredCenters.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No health centers found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedService('all');
              }}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredCenters.map((center) => {
            const TypeIcon = getTypeIcon(center.type);
            const typeData = centerTypes.find(t => t.value === center.type);
            
            return (
              <div key={center._id} className="card hover:shadow-lg transition-shadow">
                <div className="card-content">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${getTypeColor(center.type)} flex items-center justify-center`}>
                        <TypeIcon size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {center.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(center.type)}`}>
                            {typeData?.label}
                          </span>
                          {center.distance && (
                            <span className="text-sm text-gray-600">
                              {formatDistance(center.distance)} away
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Star size={14} className="text-yellow-500" />
                            <span>{center.rating?.average?.toFixed(1) || 0}</span>
                            <span>({center.rating?.count || 0})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users size={14} />
                            <span>{center.staff.doctors} doctors</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button className="btn btn-outline btn-sm">
                        <Navigation size={14} />
                        Directions
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedCenter(center)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>{center.address.street}, {center.address.city}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{center.contact.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{center.timings.openTime} - {center.timings.closeTime}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Available Services</h4>
                      <div className="flex flex-wrap gap-1">
                        {center.services.slice(0, 4).map((service) => (
                          <span
                            key={service}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {getServiceIcon(service)}
                            <span>{services.find(s => s.value === service)?.label}</span>
                          </span>
                        ))}
                        {center.services.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{center.services.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Facilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(center.facilities).map(([key, value]) => (
                        value && (
                          <span key={key} className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            {key.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Center Detail Modal */}
      {selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCenter.name}
                </h2>
                <button
                  onClick={() => setSelectedCenter(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-gray-900">
                        {selectedCenter.address.street}, {selectedCenter.address.city}, 
                        {selectedCenter.address.state} - {selectedCenter.address.pincode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="text-gray-900">{selectedCenter.contact.phone}</p>
                      {selectedCenter.contact.email && (
                        <p className="text-gray-900">{selectedCenter.contact.email}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Timings</p>
                      <p className="text-gray-900">
                        {selectedCenter.timings.openTime} - {selectedCenter.timings.closeTime}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedCenter.timings.workingDays.join(', ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="text-yellow-500" />
                        <span className="text-gray-900">
                          {selectedCenter.rating?.average?.toFixed(1) || 0} 
                          ({selectedCenter.rating?.count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Available</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedCenter.services.map((service) => (
                      <div key={service} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        {getServiceIcon(service)}
                        <span className="text-sm text-gray-700">
                          {services.find(s => s.value === service)?.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Staff */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Staff</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <Stethoscope className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-blue-900">{selectedCenter.staff.doctors}</div>
                      <div className="text-xs text-blue-700">Doctors</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <Heart className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-green-900">{selectedCenter.staff.nurses}</div>
                      <div className="text-xs text-green-700">Nurses</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-purple-900">{selectedCenter.staff.asha_workers}</div>
                      <div className="text-xs text-purple-700">ASHA Workers</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <Activity className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-orange-900">{selectedCenter.staff.other_staff}</div>
                      <div className="text-xs text-orange-700">Other Staff</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button className="btn btn-primary flex-1">
                    <Navigation size={16} />
                    Get Directions
                  </button>
                  <button className="btn btn-outline flex-1">
                    <Phone size={16} />
                    Call Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCentersMap;
