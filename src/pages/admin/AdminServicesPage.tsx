import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Service, PaginatedResult, VehicleType, ApiError } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { formatCurrency } from '../../utils/validators';

interface ServiceForm {
  name: string; description: string; price: string; duration: string; vehicleTypes: VehicleType[]; active: boolean;
}

const emptyForm: ServiceForm = { name: '', description: '', price: '', duration: '', vehicleTypes: ['car'], active: true };
const allTypes: VehicleType[] = ['car', 'motorcycle', 'truck', 'suv'];
const typeLabels: Record<VehicleType, string> = { car: 'Carro', motorcycle: 'Moto', truck: 'Caminhão', suv: 'SUV' };

export function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const { page, limit, goToPage } = usePagination();

  const fetchServices = () => {
    api.get<PaginatedResult<Service>>(`/services/admin/all?page=${page}&limit=${limit}`)
      .then((r) => { setServices(r.data.data); setTotal(r.data.total); setTotalPages(r.data.totalPages); })
      .catch(() => toast.error('Erro ao carregar serviços'));
  };

  useEffect(() => { fetchServices(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ name: s.name, description: s.description, price: String(s.price), duration: String(s.duration), vehicleTypes: typeof s.vehicleTypes === 'string' ? (s.vehicleTypes as string).split(',') as VehicleType[] : s.vehicleTypes, active: s.active }); setModalOpen(true); };

  const toggleType = (t: VehicleType) => setForm((p) => ({ ...p, vehicleTypes: p.vehicleTypes.includes(t) ? p.vehicleTypes.filter((x) => x !== t) : [...p.vehicleTypes, t] }));

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price || !form.duration) { toast.error('Preencha todos os campos'); return; }
    if (form.vehicleTypes.length === 0) { toast.error('Selecione ao menos um tipo de veículo'); return; }
    setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price), duration: Number(form.duration) };
      if (editing) { await api.put(`/services/${editing.id}`, payload); toast.success('Serviço atualizado!'); }
      else { await api.post('/services', payload); toast.success('Serviço criado!'); }
      setModalOpen(false);
      fetchServices();
    } catch (err: ApiError) {
      const msg = err?.response?.data?.message || 'Erro ao salvar';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover serviço?')) return;
    try { await api.delete(`/services/${id}`); toast.success('Serviço removido'); fetchServices(); }
    catch { toast.error('Erro ao remover'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500 text-sm">{total} serviço(s)</p>
        </div>
        <Button onClick={openCreate}>+ Novo Serviço</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🧹</div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {s.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{s.name}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-blue-600">{formatCurrency(s.price)}</span>
              <span className="text-xs text-gray-400">{s.duration} min</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEdit(s)}>Editar</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)}>✕</Button>
            </div>
          </Card>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Serviço' : 'Novo Serviço'}>
        <div className="space-y-4">
          <Input label="Nome" placeholder="Lavagem Completa" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Preço (R$)" type="number" placeholder="50" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            <Input label="Duração (min)" type="number" placeholder="60" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Tipos de veículo</label>
            <div className="flex flex-wrap gap-2">
              {allTypes.map((t) => (
                <button key={t} type="button" onClick={() => toggleType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition ${form.vehicleTypes.includes(t) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  {typeLabels[t]}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="rounded" />
            <span className="text-sm text-gray-700">Serviço ativo</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" loading={loading} onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
