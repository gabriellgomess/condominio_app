import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { api } from '../config/api';
import contractService from '../services/contractService';


// Context para gerenciar o estado do layout
const LayoutContext = createContext();

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout deve ser usado dentro de um LayoutProvider');
  }
  return context;
};

// Hook para obter iniciais do nome
const getInitials = (name) => {
  if (!name) return 'U';
  const words = name.trim().split(' ').filter(word => word.length > 0);
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const Layout = ({ children }) => {
  // Estados principais
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Fechado por padrão em mobile
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Estados para notificações
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewedIncidents, setViewedIncidents] = useState(() => {
    // Carregar incidentes já visualizados do localStorage
    const saved = localStorage.getItem('viewedIncidents');
    return saved ? JSON.parse(saved) : [];
  });

  // Mock user data (substituir por contexto de auth real)
  const user = {
    name: 'Administrador',
    email: 'admin@condominio.com',
    role: 'SuperAdmin'
  };

  // Calcula a data limite para enviar o ofício de não renovação
  const getNoticeLimitDate = (contract) => {
    if (contract.end_date && contract.notice_period_days) {
      const endDate = new Date(contract.end_date);
      endDate.setDate(endDate.getDate() - contract.notice_period_days);
      return endDate;
    }
    return null;
  };

  // Verifica se o prazo para enviar o ofício já passou
  const isNoticePeriodExpired = (contract) => {
    const noticeLimitDate = getNoticeLimitDate(contract);
    if (!noticeLimitDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    noticeLimitDate.setHours(0, 0, 0, 0);
    return noticeLimitDate < today;
  };

  // Verifica se o prazo para enviar o ofício está próximo (10 dias)
  const isNoticePeriodApproaching = (contract) => {
    const noticeLimitDate = getNoticeLimitDate(contract);
    if (!noticeLimitDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tenDaysFromNow = new Date(today);
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
    noticeLimitDate.setHours(0, 0, 0, 0);
    return noticeLimitDate >= today && noticeLimitDate <= tenDaysFromNow;
  };

  // Carregar notificações de ocorrências e contratos
  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const allNotifications = [];

      // 1. Carregar notificações de ocorrências
      try {
        const response = await api.request(`${api.endpoints.incidents}?per_page=10&status=aberta`);

        if (response.ok) {
          const data = await response.json();
          const incidents = data.data.data || [];

          // Converter ocorrências para notificações, excluindo as já visualizadas
          const incidentNotifications = incidents
            .filter(incident => !viewedIncidents.includes(incident.id))
            .map(incident => {
              const timeAgo = formatTimeAgo(incident.created_at);
              const priorityText = getPriorityText(incident.priority);

              return {
                id: `incident_${incident.id}`,
                title: `${priorityText}: ${incident.title}`,
                time: timeAgo,
                unread: true,
                type: 'incident',
                data: incident
              };
            });

          allNotifications.push(...incidentNotifications);
        }
      } catch (error) {
        console.error('Erro ao carregar ocorrências:', error);
      }

      // 2. Carregar notificações de contratos com prazo de notificação vencido ou se aproximando
      try {
        const contractsResponse = await contractService.getAll();
        const contracts = contractsResponse.data || [];

        // Contratos com prazo de notificação vencido (perdeu o prazo para cancelar)
        const expiredNoticeNotifications = contracts
          .filter(contract => contract.status === 'active' && contract.auto_renew && isNoticePeriodExpired(contract))
          .map(contract => ({
            id: `contract_notice_expired_${contract.id}`,
            title: `🔴 Prazo Expirado: ${contract.contract_type} - ${contract.company_name}`,
            time: `Prazo era ${getNoticeLimitDate(contract)?.toLocaleDateString('pt-BR')} - Contrato renovará automaticamente`,
            unread: true,
            type: 'contract_notice_expired',
            data: contract
          }));

        // Contratos com prazo de notificação se aproximando
        const approachingNoticeNotifications = contracts
          .filter(contract => contract.status === 'active' && contract.auto_renew && isNoticePeriodApproaching(contract))
          .map(contract => ({
            id: `contract_notice_approaching_${contract.id}`,
            title: `🟡 Prazo Próximo: ${contract.contract_type} - ${contract.company_name}`,
            time: `Enviar ofício até ${getNoticeLimitDate(contract)?.toLocaleDateString('pt-BR')} (${contract.notice_period_days} dias antes)`,
            unread: true,
            type: 'contract_notice_approaching',
            data: contract
          }));

        allNotifications.push(...expiredNoticeNotifications, ...approachingNoticeNotifications);
      } catch (error) {
        console.error('Erro ao carregar contratos:', error);
      }

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Formatar tempo relativo
  const formatTimeAgo = (date) => {
    const now = new Date();
    const incidentDate = new Date(date);
    const diffInMinutes = Math.floor((now - incidentDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  };

  // Obter texto da prioridade
  const getPriorityText = (priority) => {
    const priorities = {
      'urgente': '🔴 URGENTE',
      'alta': '🟠 ALTA',
      'media': '🟡 MÉDIA',
      'baixa': '🟢 BAIXA'
    };
    return priorities[priority] || 'OCORRÊNCIA';
  };

  // Marcar incidente como visualizado
  const markIncidentAsViewed = (incidentId) => {
    if (!viewedIncidents.includes(incidentId)) {
      const updated = [...viewedIncidents, incidentId];
      setViewedIncidents(updated);
      localStorage.setItem('viewedIncidents', JSON.stringify(updated));

      // Remover notificação da lista
      setNotifications(prev => prev.filter(n => n.data?.id !== incidentId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Carregar notificações na inicialização e quando viewedIncidents mudar
  useEffect(() => {
    loadNotifications();

    // Recarregar notificações a cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [viewedIncidents]);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  // Verificar rota ativa - apenas correspondência exata
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Controlar submenu
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  // Controlar sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Fechar dropdowns quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fechar sidebar ao mudar de rota em mobile (mas manter submenu aberto)
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Manter o submenu aberto baseado na rota atual
  useEffect(() => {
    const menuItems = [
      { path: '/dashboard', index: 0 },
      { path: '/admin/finance', index: 1 },
      { path: '/admin/administrative', index: 2 },
      { path: '/admin/operational', index: 3 },
      { path: '/admin/residents', index: 4 },
      { path: '/portaria', index: 5 },
      { path: '/admin/structure', index: 6 },
      { path: '/admin/reservations', index: 7 },
      { path: '/admin/incidents', index: 8 },
      { path: '/admin/suppliers', index: 9 },
      { path: '/admin/legislation', index: 10 },
      { path: '/admin/training', index: 11 },
      { path: '/admin/feedback', index: 12 },
      { path: '/configuracoes', index: 13 }
    ];

    // Encontrar qual menu deve estar aberto baseado na rota atual
    for (const item of menuItems) {
      if (location.pathname.startsWith(item.path)) {
        setOpenSubmenu(item.index);
        break;
      }
    }
  }, [location.pathname]);

  // Classes de tema
  const themeClasses = isDarkMode
    ? 'bg-gray-900 text-white'
    : 'bg-gray-50 text-gray-900';

  const sidebarClasses = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const headerClasses = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  // Valor do contexto
  const layoutContextValue = {
    // Estados do sidebar
    isSidebarOpen,
    setIsSidebarOpen,
    isMobile,
    toggleSidebar,
    closeSidebar,

    // Estados de submenu
    openSubmenu,
    toggleSubmenu,

    // Estados de dropdowns
    showProfileDropdown,
    setShowProfileDropdown,
    showNotifications,
    setShowNotifications,

    // Tema
    isDarkMode,
    toggleTheme,
    themeClasses,
    sidebarClasses,
    headerClasses,

    // Dados do usuário
    user,
    getInitials,
    handleLogout,

    // Notificações
    notifications,
    unreadCount,
    markIncidentAsViewed,
    loadNotifications, // Expor função para recarregar notificações

    // Navegação
    location,
    isActiveRoute,

    // Refs
    sidebarRef,
    profileRef,
    notificationRef
  };

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <div className={`min-h-screen ${themeClasses} flex overflow-hidden transition-colors duration-300`}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header />
          
          {/* Main Content */}
          <main className={`
            flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto
            ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}
          `}>
            <div className="max-w-screen-2xl mx-auto">
              {children || <Outlet />}
            </div>
          </main>
        </div>

        {/* Overlay para mobile com animação aprimorada */}
        {isSidebarOpen && isMobile && (
          <div
            className={`
              fixed inset-0 z-40 
              transition-all duration-300 ease-in-out
              animate-in fade-in
              ${isDarkMode 
                ? 'bg-black/20' 
                : 'bg-white/20'
              }
            `}
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </LayoutContext.Provider>
  );
};

export default Layout;
