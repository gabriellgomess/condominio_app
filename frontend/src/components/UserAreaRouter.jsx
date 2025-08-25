import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';
import SyndicDashboard from '../pages/SyndicDashboard';
import ResidentDashboard from '../pages/ResidentDashboard';
import EmployeeDashboard from '../pages/EmployeeDashboard';

const UserAreaRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-light text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redireciona para a área apropriada baseada no nível de acesso
  switch (user.access_level) {
    case 'administrador':
      return <AdminDashboard />;
    case 'sindico':
      return <SyndicDashboard />;
    case 'morador':
      return <ResidentDashboard />;
    case 'funcionario':
      return <EmployeeDashboard />;
    default:
      // Se o nível de acesso não for reconhecido, redireciona para login
      return <Navigate to="/login" replace />;
  }
};

export default UserAreaRouter;
