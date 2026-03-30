import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { User, PaginatedResult } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { page, limit, goToPage } = usePagination();

  const fetchUsers = () => {
    api.get<PaginatedResult<User>>(`/users?page=${page}&limit=${limit}`)
      .then((r) => { setUsers(r.data.data as User[]); setTotal(r.data.total); setTotalPages(r.data.totalPages); })
      .catch(() => toast.error('Erro ao carregar usuários'));
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remover usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Usuário removido');
      fetchUsers();
    } catch { toast.error('Erro ao remover'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-500 text-sm">{total} usuário(s) cadastrado(s)</p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">E-mail</th>
                <th className="px-6 py-4 font-medium">Perfil</th>
                <th className="px-6 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-semibold">{u.name[0].toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(u.id)}>Remover</Button>
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
