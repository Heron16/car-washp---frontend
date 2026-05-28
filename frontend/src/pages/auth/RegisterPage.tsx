import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import {
  validateEmail, validateCPF, validatePassword,
  getPasswordStrength, getPasswordErrors, formatCPF,
} from '../../utils/validators';
import { FormCadastro, ErroApi } from '../../types';

type ErrosCampos = Partial<Record<keyof FormCadastro, string>>;

const configForca = {
  fraca: { label: 'Senha fraca', color: 'bg-red-500', width: 'w-1/3', text: 'text-red-600' },
  média: { label: 'Senha média', color: 'bg-yellow-400', width: 'w-2/3', text: 'text-yellow-600' },
  forte: { label: 'Senha forte', color: 'bg-green-500', width: 'w-full', text: 'text-green-600' },
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormCadastro>({ nome: '', email: '', senha: '', confirmarSenha: '', cpf: '' });
  const [erros, setErros] = useState<ErrosCampos>({});
  const [tocados, setTocados] = useState<Partial<Record<keyof FormCadastro, boolean>>>({});
  const [loading, setLoading] = useState(false);

  const set = (campo: keyof FormCadastro) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = campo === 'cpf' ? formatCPF(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validarCampo = (campo: keyof FormCadastro, valor: string): string | undefined => {
    switch (campo) {
      case 'nome': return !valor.trim() ? 'Nome é obrigatório' : undefined;
      case 'email':
        if (!valor) return 'E-mail é obrigatório';
        return !validateEmail(valor) ? 'Formato de e-mail inválido' : undefined;
      case 'cpf': {
        if (!valor) return 'CPF é obrigatório';
        const digitos = valor.replace(/\D/g, '');
        if (digitos.length < 11) return 'CPF incompleto — digite os 11 dígitos';
        return !validateCPF(valor) ? 'CPF inválido — verifique os números' : undefined;
      }
      case 'senha': {
        if (!valor) return 'Senha é obrigatória';
        const errs = getPasswordErrors(valor);
        return errs.length > 0 ? `Senha fraca — falta: ${errs.join(', ')}` : undefined;
      }
      case 'confirmarSenha': return valor !== form.senha ? 'As senhas não coincidem' : undefined;
      default: return undefined;
    }
  };

  const handleBlur = (campo: keyof FormCadastro) => () => {
    setTocados((prev) => ({ ...prev, [campo]: true }));
    setErros((prev) => ({ ...prev, [campo]: validarCampo(campo, form[campo]) }));
  };

  const validar = (): boolean => {
    const campos: (keyof FormCadastro)[] = ['nome', 'email', 'cpf', 'senha', 'confirmarSenha'];
    const novosErros: ErrosCampos = {};
    campos.forEach((c) => { const e = validarCampo(c, form[c]); if (e) novosErros[c] = e; });
    setErros(novosErros);
    setTocados({ nome: true, email: true, cpf: true, senha: true, confirmarSenha: true });
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    setLoading(true);
    try {
      await api.post('/users/cadastrar', {
        nome: form.nome, email: form.email,
        senha: form.senha, cpf: form.cpf.replace(/\D/g, ''),
      });
      toast.success('Cadastro realizado! Faça login.');
      navigate('/login');
    } catch (err: ErroApi) {
      const msg = err?.response?.data?.mensagem || 'Erro ao cadastrar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const forca = form.senha ? getPasswordStrength(form.senha) : null;
  const cfg = forca ? configForca[forca] : null;

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
            <Input label="Nome completo" placeholder="João Silva" value={form.nome} onChange={set('nome')} onBlur={handleBlur('nome')} error={erros.nome} />

            <div>
              <Input label="E-mail" type="email" placeholder="nome@dominio.com" value={form.email} onChange={set('email')} onBlur={handleBlur('email')} error={erros.email} />
              {tocados.email && !erros.email && form.email && <p className="text-xs text-green-600 mt-1">✓ E-mail válido</p>}
            </div>

            <div>
              <Input label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={set('cpf')} onBlur={handleBlur('cpf')} error={erros.cpf} maxLength={14} />
              {tocados.cpf && !erros.cpf && form.cpf && <p className="text-xs text-green-600 mt-1">✓ CPF válido</p>}
            </div>

            <div>
              <Input label="Senha" type="password" placeholder="••••••••" value={form.senha} onChange={set('senha')} onBlur={handleBlur('senha')} error={erros.senha} />
              {form.senha && cfg && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${cfg.color} ${cfg.width}`} />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${cfg.text}`}>{cfg.label}</p>
                  {forca !== 'forte' && (
                    <p className="text-xs text-gray-400 mt-0.5">Precisa de: maiúscula, minúscula, número e caractere especial (@$!%*?&)</p>
                  )}
                </div>
              )}
            </div>

            <Input label="Confirmar senha" type="password" placeholder="••••••••" value={form.confirmarSenha} onChange={set('confirmarSenha')} onBlur={handleBlur('confirmarSenha')} error={erros.confirmarSenha} />

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
