import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      // Transform email to identifier for backend compatibility
      const loginData = {
        identifier: credentials.email,
        password: credentials.password
      };
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
      const { token, data } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      const { token, data } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      return response.data.data;
    } catch (error) {
      // Remove invalid token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user data'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/update-profile`, profileData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/change-password`, passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change password'
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (identifier, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { identifier });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send reset email'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, resetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reset password'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear token and authorization header
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }
);

// Demo user data for testing
const demoUsers = {
  patient: {
    _id: 'demo-patient-id',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'patient@demo.com',
    phone: '9876543210',
    role: 'patient',
    nabhaId: 'NABHA815959NTQF',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    address: {
      street: '123 Main Street',
      city: 'Nabha',
      state: 'Punjab',
      pincode: '147201',
      country: 'India'
    },
    isActive: true,
    isVerified: true
  },
  doctor: {
    _id: 'demo-doctor-id',
    firstName: 'Dr. Priya',
    lastName: 'Sharma',
    email: 'doctor@demo.com',
    phone: '9876543211',
    role: 'doctor',
    nabhaId: 'NABHA815959NTQG',
    specialization: 'General Medicine',
    licenseNumber: 'PUNJAB123456',
    experience: 8,
    consultationFee: 500,
    address: {
      street: '456 Hospital Road',
      city: 'Nabha',
      state: 'Punjab',
      pincode: '147201',
      country: 'India'
    },
    isActive: true,
    isVerified: true
  },
  asha: {
    _id: 'demo-asha-id',
    firstName: 'Sunita',
    lastName: 'Devi',
    email: 'asha@demo.com',
    phone: '9876543212',
    role: 'asha',
    nabhaId: 'NABHA815959NTQH',
    ashaId: 'ASHA123456',
    area: 'Nabha Block 1',
    village: 'Nabha Village',
    address: {
      street: '789 Village Road',
      city: 'Nabha',
      state: 'Punjab',
      pincode: '147201',
      country: 'India'
    },
    isActive: true,
    isVerified: true
  },
  pharmacy: {
    _id: 'demo-pharmacy-id',
    firstName: 'Amit',
    lastName: 'Singh',
    email: 'pharmacy@demo.com',
    phone: '9876543213',
    role: 'pharmacy',
    nabhaId: 'NABHA815959NTQI',
    pharmacyName: 'Nabha Medical Store',
    licenseNumber: 'PHAR123456',
    address: {
      street: '321 Market Street',
      city: 'Nabha',
      state: 'Punjab',
      pincode: '147201',
      country: 'India'
    },
    isActive: true,
    isVerified: true
  },
  admin: {
    _id: 'demo-admin-id',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@demo.com',
    phone: '9876543214',
    role: 'admin',
    nabhaId: 'NABHA815959NTQJ',
    department: 'System Administration',
    address: {
      street: '654 Admin Building',
      city: 'Nabha',
      state: 'Punjab',
      pincode: '147201',
      country: 'India'
    },
    isActive: true,
    isVerified: true
  }
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  success: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.success = null;
    },
    setDemoUser: (state, action) => {
      const role = action.payload || 'patient';
      state.user = demoUsers[role] || demoUsers.patient;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.success = 'Profile updated successfully';
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.success = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.success = null;
      });
  },
});

export const { clearError, clearSuccess, clearAuth, setDemoUser } = authSlice.actions;
export default authSlice.reducer;
