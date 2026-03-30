import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { validateCPF, validatePassword, formatCPF } from '../../utils/validators';
import { EditUserForm, User, ApiError } from '../../types';

type FormErrors = Partial<Record<keyof EditUserForm, string>>;

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState<EditUserForm>({
    name: user?.name || '',
    cpf: user?.cpf || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof EditUserForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'cpf' ? formatCPF(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (form.cpf && !validateCPF(form.cpf)) errs.cpf = 'CPF inválido';
    if (form.password && !validatePassword(form.password)) errs.password = 'Senha fraca';
    if (form.password && form.password !== form.confirmPassword) errs.confirmPassword = 'Senhas não coincidem';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: Partial<EditUserForm> = { name: form.name, phone: form.phone };
      if (form.cpf) payload.cpf = form.cpf.replace(/\D/g, '');
      if (form.password) payload.password = form.password;

      const { data } = await api.put<User>(`/users/${user?.id}`, payload);
      updateUser({ ...data, id: data.id || user!.id });
      toast.success('Perfil atualizado!');
    } catch (err: ApiError) {
      const msg = err?.response?.data?.message || 'Erro ao atualizar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>
      <Card className="p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{user?.name[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
              {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome completo" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="E-mail (não editável)" value={user?.email || ''} disabled className="bg-gray-50 cursor-not-allowed" />
          <Input label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={set('cpf')} error={errors.cpf} maxLength={14} />
          <Input label="Telefone" placeholder="(11) 99999-9999" value={form.phone} onChange={set('phone')} />
          <Input label="Nova senha (opcional)" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} />
          <Input label="Confirmar nova senha" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
          <Button type="submit" loading={loading} className="w-full">Salvar alterações</Button>
        </form>
      </Card>
    </div>
  );
}
