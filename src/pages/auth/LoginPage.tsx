import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { validateEmail } from '../../utils/validators';
import { ApiError } from '../../types';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'E-mail é obrigatório';
    else if (!validateEmail(email)) errs.email = 'Formato de e-mail inválido';
    if (!password) errs.password = 'Senha é obrigatória';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      navigate(loggedUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      const msg = (err as ApiError)?.response?.data?.message || 'E-mail ou senha inválida';
      setLoginError(msg);
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
          <p className="text-blue-200 mt-1">Seu veículo merece o melhor</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar na sua conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLoginError('');
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              error={fieldErrors.email}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLoginError('');
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              error={fieldErrors.password}
            />

            {/* Mensagem de erro do login — fica fixa até o utilizador digitar */}
            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-300 rounded-lg">
                <span className="text-red-500 text-base">⚠️</span>
                <p className="text-sm text-red-700 font-medium">{loginError}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
