import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


// Context Providers
import {
  ThemeProvider,
  NotificationProvider,
  VideoCallProvider,
  HealthAssistantProvider,
  AppointmentProvider
} from './contexts';

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
import PatientReviews from './pages/Patient/Reviews';
import MedicineOrders from './pages/Patient/MedicineOrders';
import BookAppointment from './pages/Patient/BookAppointment';
import PatientVideoCall from './pages/Patient/VideoCall';

// Doctor Pages
import DoctorDashboard from './pages/Doctor/Dashboard';
import BrowseDoctors from './pages/Doctor/BrowseDoctors';
import DoctorProfile from './pages/Doctor/Profile';
import DoctorAppointments from './pages/Doctor/Appointments';
import DoctorPrescriptions from './pages/Doctor/Prescriptions';
import DoctorPatients from './pages/Doctor/Patients';
import DoctorSchedule from './pages/Doctor/Schedule';
import DoctorVideoConsultation from './pages/Doctor/VideoConsultation';

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
import BrowsePharmacies from './pages/Pharmacy/BrowsePharmacies';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProfile from './pages/Admin/Profile';
import AdminUsers from './pages/Admin/Users';
import AdminAppointments from './pages/Admin/Appointments';
import AdminPrescriptions from './pages/Admin/Prescriptions';
import AdminReports from './pages/Admin/Reports';

// Common Pages
import NotFound from './pages/Common/NotFound';
import Home from './pages/Common/Home';
import Tutorials from './pages/Common/Tutorials';
import HealthProblems from './pages/Common/HealthProblems';
import VaccineBooking from './pages/Common/VaccineBooking';
import HealthCentersMap from './pages/Common/HealthCentersMap';
import HealthAssistant from './pages/Common/HealthAssistant';
import Unauthorized from './pages/Common/Unauthorized';
import JoinCall from './components/VideoCall/JoinCall';
import VideoCallTest from './pages/Test/VideoCallTest';
import SimpleVideoTest from './pages/Test/SimpleVideoTest';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <VideoCallProvider>
          <HealthAssistantProvider>
            <AppointmentProvider>
              <div className="App">
                <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Friendly auth aliases */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />

        {/* Public Call Route */}
        <Route path="/call/:channelId" element={<JoinCall />} />
        
        {/* Test Routes */}
        <Route path="/test/video-call" element={<VideoCallTest />} />
        <Route path="/test/simple" element={<SimpleVideoTest />} />

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
          <Route path="reviews" element={<PatientReviews />} />
          <Route path="medicine-orders" element={<MedicineOrders />} />
          <Route path="video-call" element={<PatientVideoCall />} />
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
          <Route path="video-consultation" element={<DoctorVideoConsultation />} />
        </Route>

        {/* Public Doctors browse */}
        <Route path="/doctors" element={<BrowseDoctors />} />

        {/* Public Pharmacies browse */}
        <Route path="/pharmacies" element={<BrowsePharmacies />} />

        {/* ASHA Worker Routes */}
        <Route path="/asha" element={
          <ProtectedRoute allowedRoles={['asha']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AshaDashboard />} />
          <Route path="profile" element={<AshaProfile />} />
          <Route path="patients" element={<AshaPatients />} />
          <Route path="patients/register" element={<RegisterOfflinePatient />} />
          <Route path="register-offline-patient" element={<RegisterOfflinePatient />} />
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
          <Route path="profile" element={<AdminProfile />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="prescriptions" element={<AdminPrescriptions />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Public Home (always visible) */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Tutorials */}
        <Route path="/tutorials" element={<Tutorials />} />

        {/* Health Problems */}
        <Route path="/health-problems" element={<HealthProblems />} />

        {/* Vaccine Booking */}
        <Route path="/vaccines" element={<VaccineBooking />} />

        {/* Health Centers Map */}
        <Route path="/health-centers" element={<HealthCentersMap />} />

        {/* AI Health Assistant */}
        <Route path="/health-assistant" element={<HealthAssistant />} />

        {/* Unified dashboard entry */}
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Navigate to={`/dashboard/${user?.role || 'patient'}`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/dashboard/patient" element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="/dashboard/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="/dashboard/asha" element={<Navigate to="/asha/dashboard" replace />} />
        <Route path="/dashboard/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
              </div>
            </AppointmentProvider>
          </HealthAssistantProvider>
        </VideoCallProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;