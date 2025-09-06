import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout Components
import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';

// Auth Components
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Patient Pages
import PatientDashboard from './pages/Patient/Dashboard';
import PatientProfile from './pages/Patient/Profile';
import PatientAppointments from './pages/Patient/Appointments';
import PatientPrescriptions from './pages/Patient/Prescriptions';
import PatientHealthRecords from './pages/Patient/HealthRecords';
import PatientNabhaCard from './pages/Patient/NabhaCard';
import BookAppointment from './pages/Patient/BookAppointment';

// Doctor Pages
import DoctorDashboard from './pages/Doctor/Dashboard';
import DoctorProfile from './pages/Doctor/Profile';
import DoctorAppointments from './pages/Doctor/Appointments';
import DoctorPrescriptions from './pages/Doctor/Prescriptions';
import DoctorPatients from './pages/Doctor/Patients';
import DoctorSchedule from './pages/Doctor/Schedule';

// ASHA Worker Pages
import AshaDashboard from './pages/ASHA/Dashboard';
import AshaProfile from './pages/ASHA/Profile';
import AshaPatients from './pages/ASHA/Patients';
import AshaAppointments from './pages/ASHA/Appointments';
import RegisterOfflinePatient from './pages/ASHA/RegisterOfflinePatient';

// Pharmacy Pages
import PharmacyDashboard from './pages/Pharmacy/Dashboard';
import PharmacyProfile from './pages/Pharmacy/Profile';
import PharmacyPrescriptions from './pages/Pharmacy/Prescriptions';
import PharmacyInventory from './pages/Pharmacy/Inventory';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminAppointments from './pages/Admin/Appointments';
import AdminPrescriptions from './pages/Admin/Prescriptions';
import AdminReports from './pages/Admin/Reports';

// Common Pages
import NotFound from './pages/Common/NotFound';
import Unauthorized from './pages/Common/Unauthorized';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Patient Routes */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="appointments/book" element={<BookAppointment />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route path="health-records" element={<PatientHealthRecords />} />
          <Route path="nabha-card" element={<PatientNabhaCard />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="schedule" element={<DoctorSchedule />} />
        </Route>

        {/* ASHA Worker Routes */}
        <Route path="/asha" element={
          <ProtectedRoute allowedRoles={['asha_worker']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AshaDashboard />} />
          <Route path="profile" element={<AshaProfile />} />
          <Route path="patients" element={<AshaPatients />} />
          <Route path="patients/register" element={<RegisterOfflinePatient />} />
          <Route path="appointments" element={<AshaAppointments />} />
        </Route>

        {/* Pharmacy Routes */}
        <Route path="/pharmacy" element={
          <ProtectedRoute allowedRoles={['pharmacy']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PharmacyDashboard />} />
          <Route path="profile" element={<PharmacyProfile />} />
          <Route path="prescriptions" element={<PharmacyPrescriptions />} />
          <Route path="inventory" element={<PharmacyInventory />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="prescriptions" element={<AdminPrescriptions />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Default redirect based on user role */}
        <Route path="/" element={
          isAuthenticated ? (
            <Navigate to={`/${user?.role || 'patient'}/dashboard`} replace />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        } />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;