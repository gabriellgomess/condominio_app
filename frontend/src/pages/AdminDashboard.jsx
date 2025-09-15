import React from 'react';
import Layout from '../components/Layout';

const AdminDashboard = () => {
  return (
    <Layout 
      title="Painel Administrativo" 
      breadcrumbs={['Dashboard']}
    >
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-4xl font-bold text-white mb-4">
          Olá, <span className="text-[#ff6600]">Administrador</span>! 👋
        </h2>
        <p className="text-xl text-[#f3f7f1]">
          Gerencie seu sistema de condomínios com total controle e eficiência
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-[#ff6600] to-[#fa7a25] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">12</div>
          <div className="text-[#f3f7f1]">Condomínios</div>
        </div>

        <div className="card p-6 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-[#ff6600] to-[#ff8533] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">156</div>
          <div className="text-[#f3f7f1]">Usuários</div>
        </div>

        <div className="card p-6 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-[#ff8533] to-[#ffa64d] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">89</div>
          <div className="text-[#f3f7f1]">Relatórios</div>
        </div>

        <div className="card p-6 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-[#ffa64d] to-[#ffb366] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">24/7</div>
          <div className="text-[#f3f7f1]">Disponível</div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Condomínios */}
        <div className="card p-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ff6600] to-[#ff8533] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Gestão de Condomínios</h3>
          </div>
          <p className="text-[#f3f7f1] mb-6 leading-relaxed">
            Crie, edite e gerencie condomínios, blocos, unidades e muito mais. Controle total sobre a estrutura do seu sistema.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-[#ff6600] rounded-full"></div>
              <span>Gerenciar condomínios</span>
            </div>
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-[#ff6600] rounded-full"></div>
              <span>Configurar blocos e torres</span>
            </div>
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-[#ff6600] rounded-full"></div>
              <span>Administrar unidades</span>
            </div>
          </div>
          <button className="mt-6 btn-primary">
            Gerenciar Condomínios
          </button>
        </div>

        {/* Usuários */}
        <div className="card p-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ff8533] to-[#ffa64d] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Gestão de Usuários</h3>
          </div>
          <p className="text-[#f3f7f1] mb-6 leading-relaxed">
            Controle de acesso completo com diferentes níveis de permissão. Administre administradores, síndicos e funcionários.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-[#ff8533] rounded-full"></div>
              <span>Criar novos usuários</span>
            </div>
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-[#ff8533] rounded-full"></div>
              <span>Definir permissões</span>
            </div>
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-[#ff8533] rounded-full"></div>
              <span>Monitorar atividades</span>
            </div>
          </div>
          <button className="mt-6 btn-secondary">
            Gerenciar Usuários
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.9s' }}>
        <h3 className="text-2xl font-bold text-white mb-6">Atividade Recente</h3>
        <div className="card p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-[#080d08]/40 rounded-lg border border-[#ff6600]/20">
              <div className="w-3 h-3 bg-[#ff6600] rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Novo condomínio criado</p>
                <p className="text-[#f3f7f1] text-sm">Condomínio "Residencial Verde" foi adicionado ao sistema</p>
              </div>
              <span className="text-[#ff6600] text-sm">2 min atrás</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-[#080d08]/40 rounded-lg border border-[#ff6600]/20">
              <div className="w-3 h-3 bg-[#ff8533] rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Usuário atualizado</p>
                <p className="text-[#f3f7f1] text-sm">Permissões do usuário "João Silva" foram modificadas</p>
              </div>
              <span className="text-[#ff6600] text-sm">15 min atrás</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-[#080d08]/40 rounded-lg border border-[#ff6600]/20">
              <div className="w-3 h-3 bg-[#ffa64d] rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Relatório gerado</p>
                <p className="text-[#f3f7f1] text-sm">Relatório mensal de ocupação foi exportado</p>
              </div>
              <span className="text-[#ff6600] text-sm">1 hora atrás</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
