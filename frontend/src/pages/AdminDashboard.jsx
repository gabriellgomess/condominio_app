import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Logo from '../components/ui/Logo';
import { useTheme } from '../contexts/ThemeContext';
import { condominiumService, blockService, unitService } from '../services/structureService';
import { residentService } from '../services/api';
import { listRevenues, listExpenses, listSubaccounts } from '../services/financeService';
import announcementService from '../services/announcementService';
import { supplierService } from '../services/supplierService';

const AdminDashboard = () => {
  const { isDarkMode } = useTheme();
  
  // Estados para dados reais
  const [stats, setStats] = useState({
    condominiums: 0,
    residents: 0,
    revenues: 0,
    expenses: 0,
    announcements: 0,
    suppliers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar dados do dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Buscar dados em paralelo
      const [
        condominiumsRes,
        residentsRes,
        revenuesRes,
        expensesRes,
        announcementsRes,
        suppliersRes
      ] = await Promise.all([
        condominiumService.getAll(),
        residentService.getAll(),
        listRevenues(),
        listExpenses(),
        announcementService.getAnnouncements(),
        supplierService.getAll()
      ]);

      // Atualizar estatísticas
      setStats({
        condominiums: condominiumsRes.data?.data?.length || condominiumsRes.data?.length || 0,
        residents: residentsRes.data?.data?.length || residentsRes.data?.length || 0,
        revenues: revenuesRes.data?.data?.length || revenuesRes.data?.length || 0,
        expenses: expensesRes.data?.data?.length || expensesRes.data?.length || 0,
        announcements: announcementsRes.data?.data?.length || announcementsRes.data?.length || 0,
        suppliers: suppliersRes.data?.data?.length || suppliersRes.data?.length || 0
      });

      // Simular atividade recente (em um sistema real, isso viria de um endpoint de logs)
      const activities = [
        {
          id: 1,
          type: 'condominium',
          title: 'Novo condomínio criado',
          description: `Condomínio "${condominiumsRes.data?.data?.[0]?.name || 'Novo Condomínio'}" foi adicionado ao sistema`,
          time: '2 min atrás',
          color: '#ff6600'
        },
        {
          id: 2,
          type: 'resident',
          title: 'Novo morador cadastrado',
          description: `Morador foi adicionado ao sistema`,
          time: '15 min atrás',
          color: '#ff8533'
        },
        {
          id: 3,
          type: 'announcement',
          title: 'Novo anúncio publicado',
          description: `Anúncio foi publicado no sistema`,
          time: '1 hora atrás',
          color: '#ffa64d'
        }
      ];
      setRecentActivity(activities);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);
  
  return (
    <Layout 
      title="Painel Administrativo" 
      breadcrumbs={['Dashboard']}
    >
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center space-x-4 mb-4">
          {/* <Logo 
            variant="horizontal" 
            size="large" 
            theme="dark"
            className="flex-shrink-0"
          /> */}
          <div>
            <h2 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Olá, <span className="text-[#ff6600]">Administrador</span>! 👋
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}`}>
              Gerencie seu sistema de condomínios com total controle e eficiência
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className={`card p-6 text-center animate-fade-in ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-orange-500' : 'border-orange-500'} rounded-xl`} style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-[#ff6600] to-[#fa7a25] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">
            {loading ? '...' : stats.condominiums}
          </div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Condomínios</div>
        </div>

        <div className={`card p-6 text-center animate-fade-in ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-orange-500' : 'border-orange-500'} rounded-xl`} style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-[#ff6600] to-[#ff8533] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">
            {loading ? '...' : stats.residents}
          </div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Moradores</div>
        </div>

        <div className={`card p-6 text-center animate-fade-in ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-orange-500' : 'border-orange-500'} rounded-xl`} style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-[#ff8533] to-[#ffa64d] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">
            {loading ? '...' : stats.announcements}
          </div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Anúncios</div>
        </div>

        <div className={`card p-6 text-center animate-fade-in ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-orange-500' : 'border-orange-500'} rounded-xl`} style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-[#ffa64d] to-[#ffb366] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">
            {loading ? '...' : stats.suppliers}
          </div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Fornecedores</div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Condomínios */}
        <div className={`card p-6 text-center animate-fade-in ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-orange-500' : 'border-orange-500'} rounded-xl`} style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ff6600] to-[#ff8533] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gestão de Condomínios</h3>
          </div>
          <p className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} mb-6 leading-relaxed`}>
            Crie, edite e gerencie condomínios, blocos, unidades e muito mais. Controle total sobre a estrutura do seu sistema.
          </p>
          <div className="space-y-3">
            <div className={`flex items-center space-x-3 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
              <div className="w-2 h-2 bg-[#ff6600] rounded-full"></div>
              <span>Gerenciar condomínios</span>
            </div>
            <div className={`flex items-center space-x-3 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
              <div className="w-2 h-2 bg-[#ff6600] rounded-full"></div>
              <span>Configurar blocos e torres</span>
            </div>
            <div className={`flex items-center space-x-3 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
              <div className="w-2 h-2 bg-[#ff6600] rounded-full"></div>
              <span>Administrar unidades</span>
            </div>
          </div>
          <button className="mt-6 btn-primary">
            Gerenciar Condomínios
          </button>
        </div>

        {/* Usuários */}
        <div className={`card p-6 text-center animate-fade-in ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-orange-500' : 'border-orange-500'} rounded-xl`} style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ff8533] to-[#ffa64d] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gestão de Usuários</h3>
          </div>
          <p className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} mb-6 leading-relaxed`}>
            Controle de acesso completo com diferentes níveis de permissão. Administre administradores, síndicos e funcionários.
          </p>
          <div className="space-y-3">
            <div className={`flex items-center space-x-3 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
              <div className="w-2 h-2 bg-[#ff8533] rounded-full"></div>
              <span>Criar novos usuários</span>
            </div>
            <div className={`flex items-center space-x-3 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
              <div className="w-2 h-2 bg-[#ff8533] rounded-full"></div>
              <span>Definir permissões</span>
            </div>
            <div className={`flex items-center space-x-3 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
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
        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Atividade Recente</h3>
        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-orange-500' : 'border-orange-500'} rounded-xl`}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6600]"></div>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className={`flex items-center space-x-4 p-4 ${isDarkMode ? 'bg-[#080d08]/40' : 'bg-gray-50/80'} rounded-lg border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-200'}`}>
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: activity.color }}></div>
                  <div className="flex-1">
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{activity.title}</p>
                    <p className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} text-sm`}>{activity.description}</p>
                  </div>
                  <span className="text-[#ff6600] text-sm">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={`${isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-500'}`}>Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
