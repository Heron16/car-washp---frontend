import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { validateEmail, validateCPF, validatePassword, formatCPF } from '../../utils/validators';
import { RegisterForm, ApiError } from '../../types';

type FormErrors = Partial<Record<keyof RegisterForm, string>>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '', confirmPassword: '', cpf: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'cpf' ? formatCPF(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!validateEmail(form.email)) errs.email = 'E-mail inválido';
    if (!validateCPF(form.cpf)) errs.cpf = 'CPF inválido';
    if (!validatePassword(form.password)) errs.password = 'Mínimo 8 chars, maiúscula, minúscula, número e especial';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Senhas não coincidem';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/users/register', { name: form.name, email: form.email, password: form.password, cpf: form.cpf.replace(/\D/g, '') });
      toast.success('Cadastro realizado! Faça login.');
      navigate('/login');
    } catch (err: ApiError) {
      const msg = err?.response?.data?.message || 'Erro ao cadastrar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚿</span>
          </div>
          <h1 className="text-3xl font-bold text-white">AquaWash</h1>
          <p className="text-blue-200 mt-1">Crie sua conta gratuitamente</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Criar conta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome completo" placeholder="João Silva" value={form.name} onChange={set('name')} error={errors.name} />
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} error={errors.email} />
            <Input label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={set('cpf')} error={errors.cpf} maxLength={14} />
            <Input label="Senha" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} />
            <Input label="Confirmar senha" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
            <Button type="submit" loading={loading} className="w-full" size="lg">Criar conta</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
