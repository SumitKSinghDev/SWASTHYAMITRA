import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: localStorage.getItem('language') || 'punjabi', // Load from localStorage or default
  theme: 'light',
  sidebarOpen: false,
  sidebarCollapsed: false,
  notifications: [],
  loading: {
    global: false,
    auth: false,
    appointments: false,
    prescriptions: false,
    patients: false,
  },
  modals: {
    appointmentModal: false,
    prescriptionModal: false,
    patientModal: false,
    settingsModal: false,
  },
  filters: {
    appointments: {
      status: 'all',
      type: 'all',
      date: null,
    },
    prescriptions: {
      status: 'all',
      date: null,
    },
    patients: {
      search: '',
      role: 'all',
    },
  },
  pagination: {
    appointments: {
      page: 1,
      limit: 10,
      total: 0,
    },
    prescriptions: {
      page: 1,
      limit: 10,
      total: 0,
    },
    patients: {
      page: 1,
      limit: 10,
      total: 0,
    },
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    toggleModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = !state.modals[modalName];
    },
    setModalOpen: (state, action) => {
      const { modalName, isOpen } = action.payload;
      state.modals[modalName] = isOpen;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });
    },
    setFilter: (state, action) => {
      const { section, key, value } = action.payload;
      state.filters[section][key] = value;
    },
    clearFilters: (state, action) => {
      const section = action.payload;
      if (section) {
        state.filters[section] = initialState.filters[section];
      } else {
        state.filters = initialState.filters;
      }
    },
    setPagination: (state, action) => {
      const { section, key, value } = action.payload;
      state.pagination[section][key] = value;
    },
    resetPagination: (state, action) => {
      const section = action.payload;
      if (section) {
        state.pagination[section] = initialState.pagination[section];
      } else {
        state.pagination = initialState.pagination;
      }
    },
    resetUI: (state) => {
      return initialState;
    },
  },
});

export const {
  setLanguage,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapse,
  setSidebarCollapsed,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  setGlobalLoading,
  toggleModal,
  setModalOpen,
  closeAllModals,
  setFilter,
  clearFilters,
  setPagination,
  resetPagination,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
