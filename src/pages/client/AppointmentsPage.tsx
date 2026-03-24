import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Appointment, PaginatedResult } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { formatCurrency, formatDate } from '../../utils/validators';

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { page, limit, goToPage } = usePagination();

  const fetchAppointments = () => {
    api.get<PaginatedResult<Appointment>>(`/appointments/mine?page=${page}&limit=${limit}`)
      .then((r) => { setAppointments(r.data.data); setTotalPages(r.data.totalPages); setTotal(r.data.total); })
      .catch(() => toast.error('Erro ao carregar agendamentos'));
  };

  useEffect(() => { fetchAppointments(); }, [page, limit]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancelar agendamento?')) return;
    try {
      await api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
      toast.success('Agendamento cancelado');
      fetchAppointments();
    } catch { toast.error('Erro ao cancelar'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h1>
          <p className="text-gray-500 text-sm">{total} agendamento(s)</p>
        </div>
        <Link to="/dashboard/appointments/new">
          <Button>+ Novo Agendamento</Button>
        </Link>
      </div>

      {appointments.length === 0 ? (
        <Card className="p-12 text-center text-gray-400">
          <p className="text-5xl mb-3">📅</p>
          <p className="font-medium">Nenhum agendamento</p>
          <Link to="/dashboard/appointments/new">
            <Button className="mt-4">Agendar agora</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((a) => {
            const vehicle = a.vehicle;
            const service = a.service;
            return (
              <Card key={a.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{service?.name || 'Serviço'}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      🚗 {vehicle?.brand} {vehicle?.model} • {vehicle?.plate}
                    </p>
                    <p className="text-sm text-gray-500">📅 {formatDate(a.scheduledAt)}</p>
                    {a.notes && <p className="text-sm text-gray-400 italic">"{a.notes}"</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-blue-600">{formatCurrency(a.totalPrice)}</span>
                    {a.status === 'pending' && (
                      <Button variant="danger" size="sm" onClick={() => handleCancel(a.id)}>Cancelar</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}
