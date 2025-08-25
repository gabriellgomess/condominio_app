import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ResidentDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
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
              <span className="ml-3 text-xl font-bold text-light">Área do Morador</span>
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
            Área do Morador
          </h1>
          <p className="text-light/70">
            Acesse informações sobre sua unidade e condomínio
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-light/70">Minha Unidade</p>
                <p className="text-2xl font-bold text-light">Apto 101</p>
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
                <p className="text-sm font-medium text-light/70">Vagas de Garagem</p>
                <p className="text-2xl font-bold text-light">2</p>
              </div>
            </div>
          </div>

          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-light/70">Depósitos</p>
                <p className="text-2xl font-bold text-light">1</p>
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
                <p className="text-sm font-medium text-light/70">Status</p>
                <p className="text-2xl font-bold text-secondary">Em Dia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações da Unidade */}
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-light mb-4">Minha Unidade</h3>
            <div className="space-y-4">
              <div className="bg-primary border border-light/10 rounded-lg p-4">
                <h4 className="font-medium text-light mb-2">Detalhes da Unidade</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-light/70">Número:</span>
                    <p className="text-light font-medium">101</p>
                  </div>
                  <div>
                    <span className="text-light/70">Tipo:</span>
                    <p className="text-light font-medium">Apartamento</p>
                  </div>
                  <div>
                    <span className="text-light/70">Andar:</span>
                    <p className="text-light font-medium">1º</p>
                  </div>
                  <div>
                    <span className="text-light/70">Área:</span>
                    <p className="text-light font-medium">120m²</p>
                  </div>
                </div>
              </div>
              
              <Link
                to="/resident/unit/details"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Ver Detalhes Completos</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Avisos e Comunicados */}
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-light mb-4">Avisos e Comunicados</h3>
            <div className="space-y-3">
              <div className="bg-primary border border-light/10 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-light text-sm">Manutenção do Elevador</h4>
                    <p className="text-light/70 text-xs mt-1">Manutenção programada para amanhã das 8h às 12h</p>
                  </div>
                  <span className="text-secondary text-xs bg-secondary/20 px-2 py-1 rounded">Hoje</span>
                </div>
              </div>
              
              <div className="bg-primary border border-light/10 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-light text-sm">Assembleia Geral</h4>
                    <p className="text-light/70 text-xs mt-1">Assembleia marcada para o próximo sábado às 14h</p>
                  </div>
                  <span className="text-secondary text-xs bg-secondary/20 px-2 py-1 rounded">2 dias</span>
                </div>
              </div>
              
              <Link
                to="/resident/announcements"
                className="flex items-center justify-center p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors text-secondary font-medium"
              >
                Ver Todos os Avisos
              </Link>
            </div>
          </div>

          {/* Serviços e Solicitações */}
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-light mb-4">Serviços e Solicitações</h3>
            <div className="space-y-3">
              <Link
                to="/resident/maintenance/request"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Solicitar Manutenção</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
              
              <Link
                to="/resident/maintenance/history"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Histórico de Solicitações</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/resident/services"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Serviços Disponíveis</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Documentos e Contratos */}
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-light mb-4">Documentos e Contratos</h3>
            <div className="space-y-3">
              <Link
                to="/resident/documents"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Meus Documentos</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/resident/contracts"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Contratos Ativos</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/resident/regulations"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Regulamento do Condomínio</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Contato e Suporte */}
          <div className="bg-light/5 border border-light/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-light mb-4">Contato e Suporte</h3>
            <div className="space-y-3">
              <Link
                to="/resident/contact/syndic"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Contatar Síndico</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/resident/contact/administration"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Contatar Administração</span>
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                to="/resident/support"
                className="flex items-center justify-between p-3 bg-primary border border-light/10 rounded-lg hover:bg-light/5 transition-colors"
              >
                <span className="text-light">Suporte Técnico</span>
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

export default ResidentDashboard;
