import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Vehicle, PaginatedResult, VehicleType } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';

const typeLabels: Record<VehicleType, string> = { car: 'Carro', motorcycle: 'Moto', truck: 'Caminhão', suv: 'SUV' };

export function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { page, limit, goToPage } = usePagination();

  const fetchVehicles = () => {
    api.get<PaginatedResult<Vehicle>>(`/vehicles?page=${page}&limit=${limit}`)
      .then((r) => { setVehicles(r.data.data); setTotal(r.data.total); setTotalPages(r.data.totalPages); })
      .catch(() => toast.error('Erro ao carregar veículos'));
  };

  useEffect(() => { fetchVehicles(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remover veículo?')) return;
    try { await api.delete(`/vehicles/${id}`); toast.success('Veículo removido'); fetchVehicles(); }
    catch { toast.error('Erro ao remover'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veículos</h1>
          <p className="text-gray-500 text-sm">{total} veículo(s) cadastrado(s)</p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-6 py-4 font-medium">Veículo</th>
                <th className="px-6 py-4 font-medium">Placa</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Ano</th>
                <th className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚗</span>
                      <div>
                        <p className="font-medium text-gray-900">{v.brand} {v.model}</p>
                        <p className="text-xs text-gray-400">{v.color}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-700">{v.plate}</td>
                  <td className="px-6 py-4 text-gray-500">{typeLabels[v.type]}</td>
                  <td className="px-6 py-4 text-gray-500">{v.year}</td>
                  <td className="px-6 py-4">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(v.id)}>Remover</Button>
                  </td>
                </tr>
              ))}
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
