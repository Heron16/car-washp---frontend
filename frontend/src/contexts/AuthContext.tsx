import { createContext, useContext, useState, ReactNode } from 'react';
import { Usuario, RespostaAuth } from '../types';
import api from '../services/api';

interface ContextoAuth {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  logout: () => void;
  atualizarUsuario: (usuario: Usuario) => void;
}

const AuthContext = createContext<ContextoAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const salvo = localStorage.getItem('usuario');
    return salvo ? (JSON.parse(salvo) as Usuario) : null;
  });

  const estaAutenticado = !!usuario;

  const login = async (email: string, senha: string): Promise<Usuario> => {
    const { data } = await api.post<RespostaAuth>('/auth/login', { email, senha });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  const atualizarUsuario = (atualizado: Usuario) => {
    localStorage.setItem('usuario', JSON.stringify(atualizado));
    setUsuario(atualizado);
  };

  return (
    <AuthContext.Provider value={{ usuario, estaAutenticado, login, logout, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): ContextoAuth {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
