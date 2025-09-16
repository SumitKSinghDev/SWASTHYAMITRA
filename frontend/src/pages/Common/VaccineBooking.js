import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  Shield, 
  Search, 
  Filter,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowRight,
  User,
  Calendar as CalendarIcon
} from 'lucide-react';

const VaccineBooking = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vaccines, setVaccines] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedVaccine, setSelectedVaccine] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    doseNumber: 1,
    patientDetails: {
      name: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      gender: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    },
    medicalHistory: {
      allergies: [],
      currentMedications: [],
      chronicConditions: [],
      previousVaccinations: []
    }
  });

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Sample vaccines data (in real app, this would come from API)
  const sampleVaccines = [
    {
      _id: '1',
      name: 'COVID-19 Booster',
      description: 'COVID-19 vaccine booster dose',
      ageGroup: { minAge: 18, maxAge: 100 },
      doses: [
        { doseNumber: 1, name: 'First Booster', intervalDays: 0 },
        { doseNumber: 2, name: 'Second Booster', intervalDays: 180 }
      ]
    },
    {
      _id: '2',
      name: 'Hepatitis B',
      description: 'Hepatitis B vaccination',
      ageGroup: { minAge: 0, maxAge: 100 },
      doses: [
        { doseNumber: 1, name: 'First Dose', intervalDays: 0 },
        { doseNumber: 2, name: 'Second Dose', intervalDays: 30 },
        { doseNumber: 3, name: 'Third Dose', intervalDays: 180 }
      ]
    },
    {
      _id: '3',
      name: 'Polio',
      description: 'Polio vaccination',
      ageGroup: { minAge: 0, maxAge: 5 },
      doses: [
        { doseNumber: 1, name: 'First Dose', intervalDays: 0 },
        { doseNumber: 2, name: 'Second Dose', intervalDays: 30 },
        { doseNumber: 3, name: 'Third Dose', intervalDays: 60 }
      ]
    },
    {
      _id: '4',
      name: 'MMR',
      description: 'Measles, Mumps, Rubella vaccine',
      ageGroup: { minAge: 12, maxAge: 100 },
      doses: [
        { doseNumber: 1, name: 'First Dose', intervalDays: 0 },
        { doseNumber: 2, name: 'Second Dose', intervalDays: 90 }
      ]
    }
  ];

  // Sample centers data
  const sampleCenters = [
    {
      _id: '1',
      name: 'Nabha Primary Health Center',
      centerCode: 'NPC001',
      address: {
        street: 'Main Road, Near Bus Stand',
        city: 'Nabha',
        state: 'Punjab',
        pincode: '147201'
      },
      contact: {
        phone: '+91-9876543210',
        email: 'npc@health.gov.in'
      },
      timings: {
        openTime: '09:00',
        closeTime: '17:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      rating: { average: 4.2, count: 45 },
      availableVaccines: [
        { vaccine: '1', isAvailable: true, stock: 50 },
        { vaccine: '2', isAvailable: true, stock: 30 },
        { vaccine: '3', isAvailable: true, stock: 100 }
      ]
    },
    {
      _id: '2',
      name: 'Nabha Community Health Center',
      centerCode: 'NCC001',
      address: {
        street: 'Railway Road',
        city: 'Nabha',
        state: 'Punjab',
        pincode: '147201'
      },
      contact: {
        phone: '+91-9876543211',
        email: 'ncc@health.gov.in'
      },
      timings: {
        openTime: '08:00',
        closeTime: '18:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      rating: { average: 4.5, count: 78 },
      availableVaccines: [
        { vaccine: '1', isAvailable: true, stock: 75 },
        { vaccine: '2', isAvailable: true, stock: 40 },
        { vaccine: '3', isAvailable: true, stock: 120 },
        { vaccine: '4', isAvailable: true, stock: 25 }
      ]
    }
  ];

  useEffect(() => {
    setVaccines(sampleVaccines);
    setCenters(sampleCenters);
    
    // Pre-fill patient details if user is authenticated
    if (isAuthenticated && user) {
      setBookingData(prev => ({
        ...prev,
        patientDetails: {
          ...prev.patientDetails,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone || '',
          email: user.email || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || '',
          address: user.address || prev.patientDetails.address
        }
      }));
    }
  }, [isAuthenticated, user]);

  const handleVaccineSelect = (vaccineId) => {
    setSelectedVaccine(vaccineId);
    setSelectedCenter('');
    setSelectedDate('');
    setSelectedTimeSlot('');
    setAvailableSlots([]);
    setShowBookingForm(false);
  };

  const handleCenterSelect = (centerId) => {
    setSelectedCenter(centerId);
    setSelectedDate('');
    setSelectedTimeSlot('');
    setAvailableSlots([]);
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot('');
    
    if (selectedCenter && selectedVaccine) {
      try {
        setLoading(true);
        // In real app, this would be an API call
        // const { data } = await axios.get(`${API_BASE}/vaccines/centers/${selectedCenter}/slots`, {
        //   params: { date, vaccineId: selectedVaccine }
        // });
        
        // Mock slots data
        const mockSlots = [
          { startTime: '09:00', endTime: '09:30', availableSlots: 5, totalSlots: 10 },
          { startTime: '09:30', endTime: '10:00', availableSlots: 3, totalSlots: 10 },
          { startTime: '10:00', endTime: '10:30', availableSlots: 8, totalSlots: 10 },
          { startTime: '10:30', endTime: '11:00', availableSlots: 2, totalSlots: 10 },
          { startTime: '11:00', endTime: '11:30', availableSlots: 6, totalSlots: 10 },
          { startTime: '11:30', endTime: '12:00', availableSlots: 4, totalSlots: 10 },
          { startTime: '14:00', endTime: '14:30', availableSlots: 7, totalSlots: 10 },
          { startTime: '14:30', endTime: '15:00', availableSlots: 1, totalSlots: 10 },
          { startTime: '15:00', endTime: '15:30', availableSlots: 9, totalSlots: 10 },
          { startTime: '15:30', endTime: '16:00', availableSlots: 3, totalSlots: 10 }
        ];
        
        setAvailableSlots(mockSlots);
      } catch (error) {
        setError('Failed to load available slots');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    try {
      setLoading(true);
      // In real app, this would be an API call
      // const { data } = await axios.post(`${API_BASE}/vaccines/book`, {
      //   centerId: selectedCenter,
      //   vaccineId: selectedVaccine,
      //   doseNumber: bookingData.doseNumber,
      //   bookingDate: selectedDate,
      //   timeSlot: selectedTimeSlot,
      //   patientDetails: bookingData.patientDetails,
      //   medicalHistory: bookingData.medicalHistory
      // }, {
      //   headers: { Authorization: `Bearer ${user.token}` }
      // });

      // Mock successful booking
      alert('Vaccine appointment booked successfully! You will receive a confirmation SMS.');
      
      // Reset form
      setSelectedVaccine('');
      setSelectedCenter('');
      setSelectedDate('');
      setSelectedTimeSlot('');
      setAvailableSlots([]);
      setShowBookingForm(false);
      
    } catch (error) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDoses = (vaccine) => {
    if (!vaccine) return [];
    return vaccine.doses.map(dose => ({
      value: dose.doseNumber,
      label: `${dose.name} (Dose ${dose.doseNumber})`
    }));
  };

  const getNextAvailableDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return dates;
  };

  const selectedVaccineData = vaccines.find(v => v._id === selectedVaccine);
  const selectedCenterData = centers.find(c => c._id === selectedCenter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Government Vaccine Booking
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Book your free government vaccination appointments at nearby health centers. 
          Safe, reliable, and completely free for all citizens.
        </p>
      </div>

      {/* Step 1: Select Vaccine */}
      <div className="card">
        <div className="card-content">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            Step 1: Select Vaccine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vaccines.map((vaccine) => (
              <div
                key={vaccine._id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedVaccine === vaccine._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleVaccineSelect(vaccine._id)}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{vaccine.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{vaccine.description}</p>
                <p className="text-xs text-gray-500">
                  Age: {vaccine.ageGroup.minAge}-{vaccine.ageGroup.maxAge} years
                </p>
                {selectedVaccine === vaccine._id && (
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Select Center */}
      {selectedVaccine && (
        <div className="card">
          <div className="card-content">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-6 h-6 text-green-600 mr-2" />
              Step 2: Select Health Center
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {centers
                .filter(center => 
                  center.availableVaccines.some(av => 
                    av.vaccine === selectedVaccine && av.isAvailable
                  )
                )
                .map((center) => (
                <div
                  key={center._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCenter === center._id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleCenterSelect(center._id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{center.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">
                        {center.rating.average} ({center.rating.count})
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{center.address.street}, {center.address.city}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{center.contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{center.timings.openTime} - {center.timings.closeTime}</span>
                    </div>
                  </div>
                  {selectedCenter === center._id && (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Select Date */}
      {selectedCenter && (
        <div className="card">
          <div className="card-content">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-6 h-6 text-purple-600 mr-2" />
              Step 3: Select Date
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {getDateOptions().map((date) => (
                <button
                  key={date.value}
                  className={`p-3 text-sm border rounded-lg transition-colors ${
                    selectedDate === date.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleDateSelect(date.value)}
                >
                  {date.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Select Time Slot */}
      {selectedDate && availableSlots.length > 0 && (
        <div className="card">
          <div className="card-content">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-6 h-6 text-orange-600 mr-2" />
              Step 4: Select Time Slot
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  className={`p-3 text-sm border rounded-lg transition-colors ${
                    selectedTimeSlot === slot
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : slot.availableSlots > 0
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => slot.availableSlots > 0 && handleTimeSlotSelect(slot)}
                  disabled={slot.availableSlots <= 0}
                >
                  <div className="font-medium">{slot.startTime} - {slot.endTime}</div>
                  <div className="text-xs">
                    {slot.availableSlots > 0 
                      ? `${slot.availableSlots} slots available`
                      : 'Fully booked'
                    }
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h2>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vaccine:</span>
                      <span className="font-medium">{selectedVaccineData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Center:</span>
                      <span className="font-medium">{selectedCenterData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dose Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Dose Number
                  </label>
                  <select
                    className="input"
                    value={bookingData.doseNumber}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      doseNumber: parseInt(e.target.value)
                    }))}
                  >
                    {getAvailableDoses(selectedVaccineData).map((dose) => (
                      <option key={dose.value} value={dose.value}>
                        {dose.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Patient Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={bookingData.patientDetails.name}
                        onChange={(e) => setBookingData(prev => ({
                          ...prev,
                          patientDetails: {
                            ...prev.patientDetails,
                            name: e.target.value
                          }
                        }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        className="input"
                        value={bookingData.patientDetails.phone}
                        onChange={(e) => setBookingData(prev => ({
                          ...prev,
                          patientDetails: {
                            ...prev.patientDetails,
                            phone: e.target.value
                          }
                        }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="input"
                        value={bookingData.patientDetails.email}
                        onChange={(e) => setBookingData(prev => ({
                          ...prev,
                          patientDetails: {
                            ...prev.patientDetails,
                            email: e.target.value
                          }
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        className="input"
                        value={bookingData.patientDetails.dateOfBirth}
                        onChange={(e) => setBookingData(prev => ({
                          ...prev,
                          patientDetails: {
                            ...prev.patientDetails,
                            dateOfBirth: e.target.value
                          }
                        }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Medical History */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Medical History (Optional)</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies (comma-separated)
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Penicillin, Shellfish"
                      value={bookingData.medicalHistory.allergies.join(', ')}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        medicalHistory: {
                          ...prev.medicalHistory,
                          allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                        }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Medications (comma-separated)
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Blood pressure medication, Insulin"
                      value={bookingData.medicalHistory.currentMedications.join(', ')}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        medicalHistory: {
                          ...prev.medicalHistory,
                          currentMedications: e.target.value.split(',').map(m => m.trim()).filter(m => m)
                        }
                      }))}
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quick Info */}
      <div className="card">
        <div className="card-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Free for All</h4>
                  <p className="text-sm text-gray-600">All government vaccines are completely free for citizens</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Safe & Tested</h4>
                  <p className="text-sm text-gray-600">All vaccines are approved by health authorities</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Bring ID</h4>
                  <p className="text-sm text-gray-600">Carry valid government ID and NABHA Card</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Arrive on Time</h4>
                  <p className="text-sm text-gray-600">Please arrive 15 minutes before your appointment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccineBooking;
