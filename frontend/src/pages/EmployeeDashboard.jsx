import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-primary border-b border-light/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-light">Área do Funcionário</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-light">Bem-vindo, {user?.area_name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light mb-2">
            Área do Funcionário
          </h1>
          <p className="text-light/70">
            Gerencie suas tarefas e responsabilidades operacionais
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-light/70">Tarefas Pendentes</p>
                <p className="text-2xl font-bold text-light">8</p>
              </div>
            </div>
          </div>

          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-light/70">Tarefas Hoje</p>
                <p className="text-2xl font-bold text-light">5</p>
              </div>
            </div>
          </div>

          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-light/70">Concluídas</p>
                <p className="text-2xl font-bold text-light">12</p>
              </div>
            </div>
          </div>

          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-light/70">Eficiência</p>
                <p className="text-2xl font-bold text-secondary">85%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tarefas e Atividades */}
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-light mb-4">Minhas Tarefas</h3>
            <div className="space-y-3">
              <div className="bg-primary border border-light/10 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-light text-sm">Limpeza da Área Comum</h4>
                    <p className="text-light/70 text-xs mt-1">Prazo: Hoje às 18h</p>
                  </div>
                  <span className="text-red-400 text-xs bg-red-400/20 px-2 py-1 rounded">Urgente</span>
                </div>
              </div>
              
              <div className="bg-primary border border-light/10 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-light text-sm">Verificação de Segurança</h4>
                    <p className="text-light/70 text-xs mt-1">Prazo: Amanhã às 9h</p>
                  </div>
                  <span className="text-yellow-400 text-xs bg-yellow-400/20 px-2 py-1 rounded">Pendente</span>
                </div>
              </div>
              
              <Link
                to="/employee/tasks"
                className="flex items-center justify-center p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors text-secondary font-medium"
              >
                Ver Todas as Tarefas
              </Link>
            </div>
          </div>

          {/* Manutenção */}
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-light mb-4">Manutenção</h3>
            <div className="space-y-3">
              <Link
                to="/employee/maintenance/requests"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Solicitações de Manutenção</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/employee/maintenance/schedule"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Agenda de Manutenção</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/employee/maintenance/reports"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Relatórios de Manutenção</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Limpeza e Conservação */}
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-light mb-4">Limpeza e Conservação</h3>
            <div className="space-y-3">
              <Link
                to="/employee/cleaning/schedule"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Cronograma de Limpeza</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/employee/cleaning/checklist"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Checklist de Limpeza</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/employee/cleaning/supplies"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Controle de Materiais</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-light mb-4">Segurança</h3>
            <div className="space-y-3">
              <Link
                to="/employee/security/rounds"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Rondas de Segurança</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/employee/security/incidents"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Registro de Incidentes</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/employee/security/visitors"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Controle de Visitantes</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Relatórios */}
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-light mb-4">Relatórios</h3>
            <div className="space-y-3">
              <Link
                to="/employee/reports/daily"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Relatório Diário</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/employee/reports/weekly"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Relatório Semanal</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/employee/reports/performance"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Relatório de Performance</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Configurações */}
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-light mb-4">Configurações</h3>
            <div className="space-y-3">
              <Link
                to="/employee/profile"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Meu Perfil</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/employee/schedule"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Meu Horário</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/employee/notifications"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Notificações</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
