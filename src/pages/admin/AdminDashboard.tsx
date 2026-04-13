import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { PaginatedResult, Appointment, User, Service } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/validators';

interface Stats {
  users: number;
  services: number;
  appointments: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, services: 0, appointments: 0 });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<PaginatedResult<User>>('/users?limit=1'),
      api.get<PaginatedResult<Service>>('/services/admin/all?limit=1'),
      api.get<PaginatedResult<Appointment>>('/appointments?limit=5'),
    ]).then(([u, s, a]) => {
      setStats({ users: u.data.total, services: s.data.total, appointments: a.data.total });
      setRecentAppointments(a.data.data);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Usuários', value: stats.users, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Serviços', value: stats.services, icon: '🧹', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Agendamentos', value: stats.appointments, icon: '📅', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s) => (
          <Card key={s.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center text-2xl`}>{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Agendamentos Recentes</h2>
        {recentAppointments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhum agendamento</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Serviço</th>
                  <th className="pb-3 font-medium">Data</th>
                  <th className="pb-3 font-medium">Valor</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentAppointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium">{a.service?.name || '-'}</td>
                    <td className="py-3 text-gray-500">{formatDate(a.scheduledAt)}</td>
                    <td className="py-3 font-semibold text-blue-600">{formatCurrency(a.totalPrice)}</td>
                    <td className="py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
