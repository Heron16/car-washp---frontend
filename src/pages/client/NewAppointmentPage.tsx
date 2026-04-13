import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Vehicle, Service, PaginatedResult, ApiError } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/validators';

export function NewAppointmentPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<PaginatedResult<Vehicle>>('/vehicles/mine?limit=50'),
      api.get<PaginatedResult<Service>>('/services?limit=50'),
    ]).then(([v, s]) => { setVehicles(v.data.data); setServices(s.data.data); }).catch(() => {});
  }, []);

  const selectedService = services.find((s) => s.id === serviceId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !serviceId || !scheduledAt) { toast.error('Preencha todos os campos obrigatórios'); return; }
    setLoading(true);
    try {
      await api.post('/appointments', { vehicleId, serviceId, scheduledAt, notes });
      toast.success('Agendamento realizado!');
      navigate('/dashboard/appointments');
    } catch (err: ApiError) {
      const msg = err?.response?.data?.message || 'Erro ao agendar';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Agendamento</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Veículo *</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                  <option value="">Selecione um veículo</option>
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate}</option>)}
                </select>
                {vehicles.length === 0 && <p className="text-xs text-orange-500">Cadastre um veículo primeiro</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Serviço *</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                  <option value="">Selecione um serviço</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Data e Hora *</label>
                <input type="datetime-local" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} min={new Date().toISOString().slice(0, 16)} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Observações</label>
                <textarea className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none" rows={3} placeholder="Alguma observação especial?" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => navigate('/dashboard/appointments')}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={loading}>Confirmar Agendamento</Button>
              </div>
            </form>
          </Card>
        </div>

        {selectedService && (
          <Card className="p-6 h-fit">
            <h3 className="font-semibold text-gray-900 mb-4">Resumo</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Serviço</span><span className="font-medium">{selectedService.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Duração</span><span>{selectedService.duration} min</span></div>
              <div className="border-t pt-3 flex justify-between"><span className="font-semibold">Total</span><span className="font-bold text-blue-600 text-lg">{formatCurrency(selectedService.price)}</span></div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
