import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, Stethoscope } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const BookAppointment = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    doctor: '',
    specialization: '',
    date: '',
    time: '',
    type: 'video',
    reason: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - in real app, this would come from API calls
  const doctors = [
    { id: 1, name: 'Dr. Rajesh Kumar', specialization: 'Cardiology', available: true },
    { id: 2, name: 'Dr. Priya Sharma', specialization: 'General Practice', available: true },
    { id: 3, name: 'Dr. Neha Gupta', specialization: 'Pediatrics', available: false },
    { id: 4, name: 'Dr. Amit Singh', specialization: 'Dermatology', available: true },
    { id: 5, name: 'Dr. Sunita Patel', specialization: 'Gynecology', available: true }
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Appointment booking data:', formData);
    alert('Appointment booked successfully!');
    setIsSubmitting(false);
  };

  const availableDoctors = doctors.filter(doctor => doctor.available);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Book Appointment</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Schedule your next medical consultation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Doctor Selection */}
                <div>
                  <label className="label">Select Doctor</label>
                  <div className="relative">
                    <select
                      name="doctor"
                      value={formData.doctor}
                      onChange={handleInputChange}
                      className="input pr-10"
                      required
                    >
                      <option value="">Choose a doctor</option>
                      {availableDoctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                    <Stethoscope className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Appointment Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="input pr-10"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="label">Time Slot</label>
                    <div className="relative">
                      <select
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="input pr-10"
                        required
                      >
                        <option value="">Select time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Appointment Type */}
                <div>
                  <label className="label">Appointment Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="type"
                        value="video"
                        checked={formData.type === 'video'}
                        onChange={handleInputChange}
                        className="text-primary-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Video Consultation</div>
                        <div className="text-sm text-gray-500">Online video call</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="type"
                        value="in-person"
                        checked={formData.type === 'in-person'}
                        onChange={handleInputChange}
                        className="text-primary-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900">In-Person Visit</div>
                        <div className="text-sm text-gray-500">Visit clinic/hospital</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="label">Reason for Visit</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Please describe your symptoms or reason for the appointment"
                    className="input min-h-[100px] resize-none"
                    required
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="label">Additional Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional information you'd like to share"
                    className="input min-h-[80px] resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="btn btn-secondary px-8"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary px-8"
                  >
                    {isSubmitting ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Quick Info</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Duration</div>
                  <div className="text-sm text-gray-500">30-45 minutes</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Availability</div>
                  <div className="text-sm text-gray-500">Mon-Fri, 9AM-5PM</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Support</div>
                  <div className="text-sm text-gray-500">24/7 helpline</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
            </div>
            <div className="card-content space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">support@code4care.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Available 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
