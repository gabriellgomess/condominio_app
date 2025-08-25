import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedAccessLevels = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-light text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se não há restrições de nível de acesso, permite acesso
  if (allowedAccessLevels.length === 0) {
    return children;
  }

  // Verifica se o usuário tem o nível de acesso permitido
  if (allowedAccessLevels.includes(user.access_level)) {
    return children;
  }

  // Usuário não tem permissão, redireciona para área apropriada
  return <Navigate to={user.redirect_to} replace />;
};

export default ProtectedRoute;
