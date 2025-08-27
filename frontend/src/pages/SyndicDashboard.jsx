import React from 'react';
import Layout from '../components/Layout';

const SyndicDashboard = () => {
  return (
    <Layout 
      title="Painel do Síndico" 
      breadcrumbs={['Dashboard']}
    >
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-4xl font-bold text-white mb-4">
          Olá, <span className="text-[#31a196]">Síndico</span>! 👋
        </h2>
        <p className="text-xl text-[#f3f7f1]">
          Gerencie seu condomínio com eficiência e transparência
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-[#31a196] to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#31a196] mb-2">48</div>
          <div className="text-[#f3f7f1]">Unidades</div>
        </div>

        <div className="card p-6 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#31a196] mb-2">42</div>
          <div className="text-[#f3f7f1]">Moradores</div>
        </div>

        <div className="card p-6 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#31a196] mb-2">3</div>
          <div className="text-[#f3f7f1]">Pendentes</div>
        </div>

        <div className="card p-6 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#31a196] mb-2">95%</div>
          <div className="text-[#f3f7f1]">Ocupação</div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Unidades */}
        <div className="card p-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#31a196] to-green-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Gestão de Unidades</h3>
          </div>
          <p className="text-[#f3f7f1] mb-6 leading-relaxed">
            Visualize e gerencie todas as unidades do condomínio, status de ocupação e informações dos moradores.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-[#31a196] rounded-full"></div>
              <span>Listar todas as unidades</span>
            </div>
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-[#31a196] rounded-full"></div>
              <span>Verificar status de ocupação</span>
            </div>
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-[#31a196] rounded-full"></div>
              <span>Gerenciar moradores</span>
            </div>
          </div>
          <button className="mt-6 btn-primary">
            Gerenciar Unidades
          </button>
        </div>

        {/* Manutenção */}
        <div className="card p-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Manutenção</h3>
          </div>
          <p className="text-[#f3f7f1] mb-6 leading-relaxed">
            Acompanhe solicitações de manutenção, agende serviços e mantenha o condomínio em perfeito estado.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Ver solicitações pendentes</span>
            </div>
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Agendar manutenções</span>
            </div>
            <div className="flex items-center space-x-3 text-[#f3f7f1]">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Acompanhar progresso</span>
            </div>
          </div>
          <button className="mt-6 btn-secondary">
            Ver Manutenções
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.9s' }}>
        <h3 className="text-2xl font-bold text-white mb-6">Atividade Recente</h3>
        <div className="card p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-[#080d08]/40 rounded-lg border border-[#31a196]/20">
              <div className="w-3 h-3 bg-[#31a196] rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Nova solicitação de manutenção</p>
                <p className="text-[#f3f7f1] text-sm">Unidade 12A - Problema no encanamento</p>
              </div>
              <span className="text-[#31a196] text-sm">1 hora atrás</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-[#080d08]/40 rounded-lg border border-[#31a196]/20">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Morador registrado</p>
                <p className="text-[#f3f7f1] text-sm">Maria Santos - Unidade 8B</p>
              </div>
              <span className="text-[#31a196] text-sm">3 horas atrás</span>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-[#080d08]/40 rounded-lg border border-[#31a196]/20">
              <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Manutenção concluída</p>
                <p className="text-[#f3f7f1] text-sm">Elevador principal - Funcionando normalmente</p>
              </div>
              <span className="text-[#31a196] text-sm">1 dia atrás</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SyndicDashboard;
