import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import {
  validateEmail,
  validateCPF,
  validatePassword,
  getPasswordStrength,
  getPasswordErrors,
  formatCPF,
} from '../../utils/validators';
import { RegisterForm, ApiError } from '../../types';

type FormErrors = Partial<Record<keyof RegisterForm, string>>;

const strengthConfig = {
  fraca: { label: 'Senha fraca', color: 'bg-red-500', width: 'w-1/3', text: 'text-red-600' },
  média: { label: 'Senha média', color: 'bg-yellow-400', width: 'w-2/3', text: 'text-yellow-600' },
  forte: { label: 'Senha forte', color: 'bg-green-500', width: 'w-full', text: 'text-green-600' },
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    name: '', email: '', password: '', confirmPassword: '', cpf: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterForm, boolean>>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'cpf' ? formatCPF(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpa o erro do campo ao digitar
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateField = (field: keyof RegisterForm, value: string): string | undefined => {
    switch (field) {
      case 'name':
        return !value.trim() ? 'Nome é obrigatório' : undefined;
      case 'email':
        if (!value) return 'E-mail é obrigatório';
        return !validateEmail(value) ? 'Formato de e-mail inválido (ex: nome@dominio.com)' : undefined;
      case 'cpf': {
        if (!value) return 'CPF é obrigatório';
        const digits = value.replace(/\D/g, '');
        if (digits.length < 11) return 'CPF incompleto — digite os 11 dígitos';
        return !validateCPF(value) ? 'Este CPF não existe — verifique os números digitados' : undefined;
      }
      case 'password': {
        if (!value) return 'Senha é obrigatória';
        const errs = getPasswordErrors(value);
        return errs.length > 0 ? `Senha fraca — falta: ${errs.join(', ')}` : undefined;
      }
      case 'confirmPassword':
        return value !== form.password ? 'As senhas não coincidem' : undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (field: keyof RegisterForm) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validate = (): boolean => {
    const fields: (keyof RegisterForm)[] = ['name', 'email', 'cpf', 'password', 'confirmPassword'];
    const errs: FormErrors = {};
    fields.forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) errs[f] = err;
    });
    setErrors(errs);
    setTouched({ name: true, email: true, cpf: true, password: true, confirmPassword: true });
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/users/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        cpf: form.cpf.replace(/\D/g, ''),
      });
      toast.success('Cadastro realizado! Faça login.');
      navigate('/login');
    } catch (err: ApiError) {
      const msg = err?.response?.data?.message || 'Erro ao cadastrar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password ? getPasswordStrength(form.password) : null;
  const cfg = strength ? strengthConfig[strength] : null;

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

            <Input
              label="Nome completo"
              placeholder="João Silva"
              value={form.name}
              onChange={set('name')}
              onBlur={handleBlur('name')}
              error={errors.name}
            />

            <div>
              <Input
                label="E-mail"
                type="email"
                placeholder="nome@dominio.com"
                value={form.email}
                onChange={set('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
              />
              {touched.email && !errors.email && form.email && (
                <p className="text-xs text-green-600 mt-1">✓ E-mail válido</p>
              )}
            </div>

            <div>
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={set('cpf')}
                onBlur={handleBlur('cpf')}
                error={errors.cpf}
                maxLength={14}
              />
              {touched.cpf && !errors.cpf && form.cpf && (
                <p className="text-xs text-green-600 mt-1">✓ CPF válido</p>
              )}
            </div>

            <div>
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                onBlur={handleBlur('password')}
                error={errors.password}
              />
              {/* Barra de força da senha */}
              {form.password && cfg && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${cfg.color} ${cfg.width}`} />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${cfg.text}`}>{cfg.label}</p>
                  {strength !== 'forte' && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Precisa de: maiúscula, minúscula, número e caractere especial (@$!%*?&)
                    </p>
                  )}
                </div>
              )}
            </div>

            <Input
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              error={errors.confirmPassword}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Criar conta
            </Button>
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
