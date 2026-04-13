import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/Badge';
import { Appointment, PaginatedResult } from '../../types';
import { formatCurrency, formatDate } from '../../utils/validators';

export function DashboardHome() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    api.get<PaginatedResult<Appointment>>('/appointments/mine?limit=5').then((r) => setAppointments(r.data.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Bem-vindo à sua área de cliente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Meus Veículos', icon: '🚗', to: '/dashboard/vehicles', color: 'from-blue-500 to-blue-600' },
          { label: 'Agendar Lavagem', icon: '📅', to: '/dashboard/appointments/new', color: 'from-cyan-500 to-cyan-600' },
          { label: 'Meu Perfil', icon: '👤', to: '/dashboard/profile', color: 'from-indigo-500 to-indigo-600' },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className={`p-6 bg-gradient-to-br ${item.color} text-white hover:shadow-lg transition-all hover:-translate-y-1`}>
              <span className="text-3xl">{item.icon}</span>
              <p className="font-semibold mt-3">{item.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Últimos Agendamentos</h2>
          <Link to="/dashboard/appointments" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
        </div>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-2">📅</p>
            <p>Nenhum agendamento ainda</p>
            <Link to="/dashboard/appointments/new" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Agendar agora</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {a.service?.name || 'Serviço'}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(a.scheduledAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-blue-600">{formatCurrency(a.totalPrice)}</span>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
