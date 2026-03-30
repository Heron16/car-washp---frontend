import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Vehicle, PaginatedResult, VehicleType, ApiError } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';

const vehicleTypeLabels: Record<VehicleType, string> = {
  car: 'Carro', motorcycle: 'Moto', truck: 'Caminhão', suv: 'SUV',
};

interface VehicleForm {
  brand: string; model: string; year: string; plate: string; color: string; type: VehicleType;
}

const emptyForm: VehicleForm = { brand: '', model: '', year: '', plate: '', color: '', type: 'car' };

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const { page, limit, goToPage } = usePagination();

  const fetchVehicles = () => {
    api.get<PaginatedResult<Vehicle>>(`/vehicles/mine?page=${page}&limit=${limit}`)
      .then((r) => { setVehicles(r.data.data); setTotal(r.data.total); setTotalPages(r.data.totalPages); })
      .catch(() => toast.error('Erro ao carregar veículos'));
  };

  useEffect(() => { fetchVehicles(); }, [page]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (v: Vehicle) => { setEditing(v); setForm({ brand: v.brand, model: v.model, year: String(v.year), plate: v.plate, color: v.color, type: v.type }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.brand || !form.model || !form.year || !form.plate || !form.color) {
      toast.error('Preencha todos os campos'); return;
    }
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/vehicles/${editing.id}`, { ...form, year: Number(form.year) });
        toast.success('Veículo atualizado!');
      } else {
        await api.post('/vehicles', { ...form, year: Number(form.year) });
        toast.success('Veículo cadastrado!');
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err: ApiError) {
      const msg = err?.response?.data?.message || 'Erro ao salvar';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover veículo?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Veículo removido');
      fetchVehicles();
    } catch { toast.error('Erro ao remover'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Veículos</h1>
          <p className="text-gray-500 text-sm">{total} veículo(s) cadastrado(s)</p>
        </div>
        <Button onClick={openCreate}>+ Adicionar Veículo</Button>
      </div>

      {vehicles.length === 0 ? (
        <Card className="p-12 text-center text-gray-400">
          <p className="text-5xl mb-3">🚗</p>
          <p className="font-medium">Nenhum veículo cadastrado</p>
          <Button onClick={openCreate} className="mt-4">Adicionar primeiro veículo</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <Card key={v.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🚗</span>
                    <h3 className="font-semibold text-gray-900">{v.brand} {v.model}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{v.year} • {v.color} • {vehicleTypeLabels[v.type]}</p>
                  <span className="inline-block mt-2 bg-gray-100 text-gray-700 text-xs font-mono px-2 py-1 rounded">{v.plate}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(v)}>Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(v.id)}>Remover</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Veículo' : 'Novo Veículo'}>
        <div className="space-y-4">
          <Input label="Marca" placeholder="Toyota" value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
          <Input label="Modelo" placeholder="Corolla" value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ano" placeholder="2022" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} />
            <Input label="Cor" placeholder="Prata" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} />
          </div>
          <Input label="Placa" placeholder="ABC1234" value={form.plate} onChange={(e) => setForm((p) => ({ ...p, plate: e.target.value.toUpperCase() }))} disabled={!!editing} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as VehicleType }))}>
              {Object.entries(vehicleTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" loading={loading} onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
