import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import AdminShell from './components/layout/AdminShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import UserDashboard from './pages/user/UserDashboard';
import StationsPage from './pages/user/StationsPage';
import BookingsPage from './pages/user/BookingsPage';
import PaymentsPage from './pages/user/PaymentsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStationsPage from './pages/admin/AdminStationsPage';
import AdminChargersPage from './pages/admin/AdminChargersPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminMaintenancePage from './pages/admin/AdminMaintenancePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute type="user">
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="stations" element={<StationsPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute type="admin">
                <AdminShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="stations" element={<AdminStationsPage />} />
            <Route path="chargers" element={<AdminChargersPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="maintenance" element={<AdminMaintenancePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

