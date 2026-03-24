import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Appointment, PaginatedResult, ServiceStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { formatCurrency, formatDate } from '../../utils/validators';

const statusOptions: { value: ServiceStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

export function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { page, limit, goToPage } = usePagination();

  const fetchAppointments = () => {
    api.get<PaginatedResult<Appointment>>(`/appointments?page=${page}&limit=${limit}`)
      .then((r) => { setAppointments(r.data.data); setTotal(r.data.total); setTotalPages(r.data.totalPages); })
      .catch(() => toast.error('Erro ao carregar agendamentos'));
  };

  useEffect(() => { fetchAppointments(); }, [page]);

  const handleStatusChange = async (id: string, status: ServiceStatus) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      toast.success('Status atualizado');
      fetchAppointments();
    } catch { toast.error('Erro ao atualizar status'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover agendamento?')) return;
    try { await api.delete(`/appointments/${id}`); toast.success('Removido'); fetchAppointments(); }
    catch { toast.error('Erro ao remover'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-500 text-sm">{total} agendamento(s)</p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-6 py-4 font-medium">Serviço</th>
                <th className="px-6 py-4 font-medium">Veículo</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Valor</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((a) => {
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{a.service?.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{a.vehicle?.brand} {a.vehicle?.model}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(a.scheduledAt)}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">{formatCurrency(a.totalPrice)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.id, e.target.value as ServiceStatus)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                      >
                        {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="danger" size="sm" onClick={() => handleDelete(a.id)}>Remover</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      </Card>
    </div>
  );
}
