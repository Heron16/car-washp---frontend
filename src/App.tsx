import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProfilePage } from './pages/auth/ProfilePage';

import { DashboardHome } from './pages/client/DashboardHome';
import { VehiclesPage } from './pages/client/VehiclesPage';
import { AppointmentsPage } from './pages/client/AppointmentsPage';
import { NewAppointmentPage } from './pages/client/NewAppointmentPage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminVehiclesPage } from './pages/admin/AdminVehiclesPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';

function PrivateRoute({ children, role }: { children: React.ReactNode; role?: 'admin' | 'client' }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<PrivateRoute role="client"><DashboardLayout><DashboardHome /></DashboardLayout></PrivateRoute>} />
      <Route path="/dashboard/vehicles" element={<PrivateRoute role="client"><DashboardLayout><VehiclesPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/dashboard/appointments" element={<PrivateRoute role="client"><DashboardLayout><AppointmentsPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/dashboard/appointments/new" element={<PrivateRoute role="client"><DashboardLayout><NewAppointmentPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/dashboard/profile" element={<PrivateRoute><DashboardLayout><ProfilePage /></DashboardLayout></PrivateRoute>} />

      <Route path="/admin" element={<PrivateRoute role="admin"><DashboardLayout><AdminDashboard /></DashboardLayout></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute role="admin"><DashboardLayout><AdminUsersPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/admin/services" element={<PrivateRoute role="admin"><DashboardLayout><AdminServicesPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/admin/vehicles" element={<PrivateRoute role="admin"><DashboardLayout><AdminVehiclesPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/admin/appointments" element={<PrivateRoute role="admin"><DashboardLayout><AdminAppointmentsPage /></DashboardLayout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
