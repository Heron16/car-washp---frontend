import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const clientNav: NavItem[] = [
  { to: '/dashboard', label: 'Início', icon: '🏠' },
  { to: '/dashboard/vehicles', label: 'Meus Veículos', icon: '🚗' },
  { to: '/dashboard/appointments', label: 'Agendamentos', icon: '📅' },
  { to: '/dashboard/profile', label: 'Meu Perfil', icon: '👤' },
];

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/users', label: 'Usuários', icon: '👥' },
  { to: '/admin/services', label: 'Serviços', icon: '🧹' },
  { to: '/admin/vehicles', label: 'Veículos', icon: '🚗' },
  { to: '/admin/appointments', label: 'Agendamentos', icon: '📅' },
];

export function Sidebar() {
  const { user } = useAuth();
  const navItems = user?.role === 'admin' ? adminNav : clientNav;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-4">
      <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{user?.name[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard' || item.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
