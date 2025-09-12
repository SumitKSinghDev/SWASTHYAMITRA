import React, { createContext, useContext, useState, useCallback } from 'react';

const AppointmentContext = createContext();

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointment must be used within an AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    date: null,
    doctor: null,
    type: 'all'
  });

  const fetchAppointments = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API
      const response = await fetch('/api/appointments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (appointmentData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });
      
      if (response.ok) {
        const newAppointment = await response.json();
        setAppointments(prev => [...prev, newAppointment]);
        return newAppointment;
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAppointment = useCallback(async (id, updates) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const updatedAppointment = await response.json();
        setAppointments(prev => 
          prev.map(apt => apt.id === id ? updatedAppointment : apt)
        );
        return updatedAppointment;
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (id) => {
    return updateAppointment(id, { status: 'cancelled' });
  }, [updateAppointment]);

  const rescheduleAppointment = useCallback(async (id, newDateTime) => {
    return updateAppointment(id, { 
      appointmentDate: newDateTime.date,
      appointmentTime: newDateTime.time 
    });
  }, [updateAppointment]);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      date: null,
      doctor: null,
      type: 'all'
    });
  }, []);

  const getFilteredAppointments = useCallback(() => {
    return appointments.filter(appointment => {
      if (filters.status !== 'all' && appointment.status !== filters.status) {
        return false;
      }
      if (filters.type !== 'all' && appointment.type !== filters.type) {
        return false;
      }
      if (filters.date && appointment.appointmentDate !== filters.date) {
        return false;
      }
      if (filters.doctor && appointment.doctorId !== filters.doctor) {
        return false;
      }
      return true;
    });
  }, [appointments, filters]);

  const value = {
    appointments,
    selectedAppointment,
    isLoading,
    filters,
    setSelectedAppointment,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    rescheduleAppointment,
    setFilter,
    clearFilters,
    getFilteredAppointments
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};
