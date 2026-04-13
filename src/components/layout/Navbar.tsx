import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AW</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">AquaWash</span>
          </Link>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">Entrar</Link>
                <Link to="/register" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">Cadastrar</Link>
              </>
            ) : (
              <>
                <Link
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="text-sm text-gray-600 hover:text-blue-600 transition font-medium"
                >
                  {user?.role === 'admin' ? 'Painel Admin' : 'Minha Área'}
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">{user?.name[0].toUpperCase()}</span>
                  </div>
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition">Sair</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
