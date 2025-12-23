import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';
import { useLayout } from './Layout';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const {
    isSidebarOpen,
    isMobile,
    showProfileDropdown,
    showNotifications,
    user,
    notifications,
    unreadCount,
    toggleSidebar,
    setShowProfileDropdown,
    setShowNotifications,
    getInitials,
    handleLogout,
    profileRef,
    notificationRef,
    markIncidentAsViewed
  } = useLayout();
  
  const { isDarkMode, toggleTheme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();

  // Função para lidar com clique nas notificações
  const handleNotificationClick = (notification) => {
    if (notification.type === 'incident') {
      // Marcar como visualizada
      if (notification.data?.id) {
        markIncidentAsViewed(notification.data.id);
      }

      // Fechar notificações
      setShowNotifications(false);

      // Navegar para a página de incidents com o ID da ocorrência
      navigate('/admin/incidents', {
        state: {
          openIncidentId: notification.data?.id,
          incidentData: notification.data
        }
      });
    } else if (notification.type === 'reservation') {
      setShowNotifications(false);
      navigate('/admin/bookings', {
        state: {
          openReservationId: notification.data?.id
        }
      });
    } else if (notification.type === 'contract_expired' ||
               notification.type === 'contract_notice_expired' ||
               notification.type === 'contract_notice_approaching') {
      // Fechar notificações
      setShowNotifications(false);

      // Navegar para a página de contratos
      navigate('/admin/administrative/contracts', {
        state: {
          highlightContractId: notification.data?.id
        }
      });
    }
  };

  // Função para gerar breadcrumb baseado na rota atual
  const getBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    if (pathSegments.length === 0) return 'Dashboard';
    
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Mapeamento de rotas para nomes amigáveis
    const routeNames = {
      'dashboard': 'Dashboard',
      'moradores': 'Moradores',
      'unidades': 'Unidades',
      'reservas': 'Reservas',
      'comunicados': 'Comunicados',
      'ocorrencias': 'Ocorrências',
      'financeiro': 'Financeiro',
      'documentos': 'Documentos',
      'portaria': 'Portaria',
      'configuracoes': 'Configurações',
      'lista': 'Lista',
      'cadastrar': 'Cadastrar',
      'historico': 'Histórico',
      'apartamentos': 'Apartamentos',
      'vagas': 'Vagas',
      'depositos': 'Depósitos',
      'minhas': 'Minhas',
      'nova': 'Nova',
      'areas': 'Áreas Comuns',
      'todos': 'Todos',
      'criar': 'Criar',
      'rascunhos': 'Rascunhos',
      'cobrancas': 'Cobranças',
      'pagamentos': 'Pagamentos',
      'relatorios': 'Relatórios',
      'atas': 'Atas',
      'regimento': 'Regimento',
      'contratos': 'Contratos',
      'visitantes': 'Visitantes',
      'entregas': 'Entregas',
      'registro': 'Registro de Entrada'
    };
    
    return routeNames[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  return (
    <header className={`${
      isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-stone-700 border-stone-700'
    } shadow-sm border-b h-16 flex-shrink-0 z-10`}>
      <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left Side */}
          <div className="flex items-center space-x-4">
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => toggleSidebar()}
              className={`
                p-2 rounded-xl transition-all duration-200 hover:scale-105
                ${isDarkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-white hover:text-gray-600 hover:bg-gray-100'
                }
                lg:hidden
              `}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                • {getBreadcrumb()}
              </span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                p-2 rounded-xl transition-all duration-200 hover:scale-105
                ${isDarkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-white hover:text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`
                  relative p-2 rounded-xl transition-all duration-200 hover:scale-105
                  ${isDarkMode
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    : 'text-white hover:text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className={`
                  absolute right-0 mt-2 w-80 rounded-xl shadow-lg py-2 z-50 border
                  ${isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                  }
                `}>
                  <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      Notificações
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Nenhuma notificação
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                          className={`
                            px-4 py-3 hover:bg-opacity-50 cursor-pointer transition-colors
                            ${notification.unread
                              ? isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'
                              : ''
                            }
                            ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                          `}
                        >
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {notification.time}
                          </p>
                          {notification.type === 'incident' && (
                            <p className={`text-xs mt-1 font-medium text-red-600`}>
                              Clique para ver ocorrências
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 p-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6600] transition-all duration-200 hover:scale-105"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ff6600] to-[#fa7a25] flex items-center justify-center shadow-lg">
                  <span className="text-white font-medium text-sm">
                    {getInitials(user?.name)}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-300'}`}>
                    {user?.name || 'Usuário'}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.role || '-'}
                  </p>
                </div>
                <ChevronDown className={`
                  h-4 w-4 transition-transform duration-200
                  ${showProfileDropdown ? 'rotate-180' : ''}
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}
                `} />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div className={`
                  absolute right-0 mt-2 w-80 rounded-xl shadow-lg py-2 z-50 border
                  ${isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                  }
                `}>
                  <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {user?.name}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {user?.role || '-'}
                    </span>
                  </div>
                  
                  <button className={`
                    flex items-center w-full px-4 py-2 text-sm transition-colors duration-200
                    ${isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}>
                    <User className="w-4 h-4 mr-3" />
                    Meu Perfil
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className={`
                      flex items-center w-full px-4 py-2 text-sm transition-colors duration-200
                      ${isDarkMode
                        ? 'text-red-400 hover:bg-red-900/20'
                        : 'text-red-600 hover:bg-red-50'
                      }
                    `}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
