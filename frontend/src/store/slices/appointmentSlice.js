import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.date) params.append('date', filters.date);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axios.get(`${API_BASE_URL}/appointments?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch appointments'
      );
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateAppointmentStatus',
  async ({ appointmentId, status, notes }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update appointment status'
      );
    }
  }
);

export const getTodayAppointments = createAsyncThunk(
  'appointments/getTodayAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API_BASE_URL}/appointments?date=${today}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch today\'s appointments'
      );
    }
  }
);

export const getUpcomingAppointments = createAsyncThunk(
  'appointments/getUpcomingAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments?status=scheduled,confirmed`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch upcoming appointments'
      );
    }
  }
);

const initialState = {
  appointments: [],
  todayAppointments: [],
  upcomingAppointments: [],
  isLoading: false,
  error: null,
  stats: {
    total: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  }
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAppointments: (state) => {
      state.appointments = [];
      state.todayAppointments = [];
      state.upcomingAppointments = [];
      state.stats = {
        total: 0,
        today: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload.data.appointments;
        state.stats.total = action.payload.data.total;
        state.error = null;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get today's appointments
      .addCase(getTodayAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTodayAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayAppointments = action.payload.data.appointments;
        state.stats.today = action.payload.data.total;
        state.error = null;
      })
      .addCase(getTodayAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get upcoming appointments
      .addCase(getUpcomingAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUpcomingAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.upcomingAppointments = action.payload.data.appointments;
        state.stats.upcoming = action.payload.data.total;
        state.error = null;
      })
      .addCase(getUpcomingAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update appointment status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedAppointment = action.payload.data.appointment;
        
        // Update in all appointment arrays
        state.appointments = state.appointments.map(apt => 
          apt._id === updatedAppointment._id ? updatedAppointment : apt
        );
        state.todayAppointments = state.todayAppointments.map(apt => 
          apt._id === updatedAppointment._id ? updatedAppointment : apt
        );
        state.upcomingAppointments = state.upcomingAppointments.map(apt => 
          apt._id === updatedAppointment._id ? updatedAppointment : apt
        );
        
        state.error = null;
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearAppointments } = appointmentSlice.actions;
export default appointmentSlice.reducer;
