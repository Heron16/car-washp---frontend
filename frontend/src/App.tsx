import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PerfilUsuario } from './types';

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

function RotaPrivada({ children, perfil }: { children: React.ReactNode; perfil?: PerfilUsuario }) {
  const { estaAutenticado, usuario } = useAuth();
  if (!estaAutenticado) return <Navigate to="/login" replace />;
  if (perfil && usuario?.perfil !== perfil)
    return <Navigate to={usuario?.perfil === 'admin' ? '/admin' : '/dashboard'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />

      <Route path="/dashboard" element={<RotaPrivada perfil="cliente"><DashboardLayout><DashboardHome /></DashboardLayout></RotaPrivada>} />
      <Route path="/dashboard/veiculos" element={<RotaPrivada perfil="cliente"><DashboardLayout><VehiclesPage /></DashboardLayout></RotaPrivada>} />
      <Route path="/dashboard/agendamentos" element={<RotaPrivada perfil="cliente"><DashboardLayout><AppointmentsPage /></DashboardLayout></RotaPrivada>} />
      <Route path="/dashboard/agendamentos/novo" element={<RotaPrivada perfil="cliente"><DashboardLayout><NewAppointmentPage /></DashboardLayout></RotaPrivada>} />
      <Route path="/dashboard/perfil" element={<RotaPrivada><DashboardLayout><ProfilePage /></DashboardLayout></RotaPrivada>} />

      <Route path="/admin" element={<RotaPrivada perfil="admin"><DashboardLayout><AdminDashboard /></DashboardLayout></RotaPrivada>} />
      <Route path="/admin/usuarios" element={<RotaPrivada perfil="admin"><DashboardLayout><AdminUsersPage /></DashboardLayout></RotaPrivada>} />
      <Route path="/admin/servicos" element={<RotaPrivada perfil="admin"><DashboardLayout><AdminServicesPage /></DashboardLayout></RotaPrivada>} />
      <Route path="/admin/veiculos" element={<RotaPrivada perfil="admin"><DashboardLayout><AdminVehiclesPage /></DashboardLayout></RotaPrivada>} />
      <Route path="/admin/agendamentos" element={<RotaPrivada perfil="admin"><DashboardLayout><AdminAppointmentsPage /></DashboardLayout></RotaPrivada>} />

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
