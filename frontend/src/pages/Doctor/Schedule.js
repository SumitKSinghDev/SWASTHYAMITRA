import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Calendar, 
  Clock, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const DoctorSchedule = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Mock data - in real app, this would come from API calls
  const [scheduleSlots, setScheduleSlots] = useState([
    {
      id: 1,
      date: '2024-01-22',
      startTime: '09:00',
      endTime: '10:00',
      type: 'consultation',
      maxPatients: 4,
      currentBookings: 3,
      status: 'available',
      location: 'Clinic A',
      notes: 'General consultation'
    },
    {
      id: 2,
      date: '2024-01-22',
      startTime: '10:00',
      endTime: '11:00',
      type: 'consultation',
      maxPatients: 4,
      currentBookings: 4,
      status: 'full',
      location: 'Clinic A',
      notes: 'General consultation'
    },
    {
      id: 3,
      date: '2024-01-22',
      startTime: '11:00',
      endTime: '12:00',
      type: 'follow_up',
      maxPatients: 3,
      currentBookings: 2,
      status: 'available',
      location: 'Clinic A',
      notes: 'Follow-up appointments only'
    },
    {
      id: 4,
      date: '2024-01-22',
      startTime: '14:00',
      endTime: '15:00',
      type: 'consultation',
      maxPatients: 4,
      currentBookings: 1,
      status: 'available',
      location: 'Clinic A',
      notes: 'General consultation'
    },
    {
      id: 5,
      date: '2024-01-22',
      startTime: '15:00',
      endTime: '16:00',
      type: 'emergency',
      maxPatients: 2,
      currentBookings: 0,
      status: 'available',
      location: 'Emergency Room',
      notes: 'Emergency consultations'
    }
  ]);

  const [newSlot, setNewSlot] = useState({
    date: selectedDate,
    startTime: '',
    endTime: '',
    type: 'consultation',
    maxPatients: 4,
    location: 'Clinic A',
    notes: ''
  });

  const handleAddSlot = () => {
    const slot = {
      ...newSlot,
      id: Date.now(),
      currentBookings: 0,
      status: 'available'
    };
    setScheduleSlots([...scheduleSlots, slot]);
    setNewSlot({
      date: selectedDate,
      startTime: '',
      endTime: '',
      type: 'consultation',
      maxPatients: 4,
      location: 'Clinic A',
      notes: ''
    });
    setIsAddingSlot(false);
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
  };

  const handleUpdateSlot = () => {
    setScheduleSlots(scheduleSlots.map(slot => 
      slot.id === editingSlot.id ? editingSlot : slot
    ));
    setEditingSlot(null);
  };

  const handleDeleteSlot = (slotId) => {
    setScheduleSlots(scheduleSlots.filter(slot => slot.id !== slotId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'follow_up':
        return 'bg-purple-100 text-purple-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSlots = scheduleSlots.filter(slot => slot.date === selectedDate);

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
          <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600">Manage your availability and appointment slots</p>
        </div>
        <button
          onClick={() => setIsAddingSlot(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus size={20} className="mr-2" />
          Add Time Slot
        </button>
      </div>

      {/* Date Selector */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
            <div className="text-sm text-gray-600">
              {filteredSlots.length} slots scheduled
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Slots */}
      <div className="space-y-4">
        {filteredSlots.map((slot) => (
          <div key={slot.id} className="card">
            <div className="card-content">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {slot.startTime} - {slot.endTime}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(slot.status)}`}>
                          {slot.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(slot.type)}`}>
                          {slot.type.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Location</p>
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-2" />
                            <span>{slot.location}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Bookings</p>
                          <div className="flex items-center">
                            <Users size={16} className="mr-2" />
                            <span>{slot.currentBookings}/{slot.maxPatients} patients</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Date</p>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            <span>{new Date(slot.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Availability</p>
                          <div className="flex items-center">
                            {slot.status === 'available' ? (
                              <CheckCircle size={16} className="text-green-600 mr-2" />
                            ) : (
                              <AlertCircle size={16} className="text-red-600 mr-2" />
                            )}
                            <span>{slot.maxPatients - slot.currentBookings} slots available</span>
                          </div>
                        </div>
                      </div>
                      
                      {slot.notes && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-900 mb-1">Notes</p>
                          <p className="text-sm text-gray-600">{slot.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSlot(slot)}
                      className="btn btn-outline btn-sm"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="btn btn-outline btn-sm text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSlots.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No slots scheduled</h3>
          <p className="text-gray-600 mb-4">
            No time slots are scheduled for {new Date(selectedDate).toLocaleDateString()}.
          </p>
          <button
            onClick={() => setIsAddingSlot(true)}
            className="btn btn-primary"
          >
            <Plus size={20} className="mr-2" />
            Add First Slot
          </button>
        </div>
      )}

      {/* Add Slot Modal */}
      {isAddingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Time Slot</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddSlot(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newSlot.type}
                  onChange={(e) => setNewSlot({...newSlot, type: e.target.value})}
                  className="input w-full"
                >
                  <option value="consultation">General Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Patients
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newSlot.maxPatients}
                  onChange={(e) => setNewSlot({...newSlot, maxPatients: parseInt(e.target.value)})}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newSlot.location}
                  onChange={(e) => setNewSlot({...newSlot, location: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newSlot.notes}
                  onChange={(e) => setNewSlot({...newSlot, notes: e.target.value})}
                  className="input w-full"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingSlot(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Time Slot</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateSlot(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={editingSlot.date}
                  onChange={(e) => setEditingSlot({...editingSlot, date: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editingSlot.startTime}
                    onChange={(e) => setEditingSlot({...editingSlot, startTime: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editingSlot.endTime}
                    onChange={(e) => setEditingSlot({...editingSlot, endTime: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={editingSlot.type}
                  onChange={(e) => setEditingSlot({...editingSlot, type: e.target.value})}
                  className="input w-full"
                >
                  <option value="consultation">General Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Patients
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editingSlot.maxPatients}
                  onChange={(e) => setEditingSlot({...editingSlot, maxPatients: parseInt(e.target.value)})}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={editingSlot.location}
                  onChange={(e) => setEditingSlot({...editingSlot, location: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editingSlot.notes}
                  onChange={(e) => setEditingSlot({...editingSlot, notes: e.target.value})}
                  className="input w-full"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Save size={16} className="mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
