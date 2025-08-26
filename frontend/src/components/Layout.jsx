import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';

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
  const [isMobile, setIsMobile] = useState(false);
  
  const location = useLocation();
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Mock user data (substituir por contexto de auth real)
  const user = {
    name: 'Administrador',
    email: 'admin@condominio.com',
    role: 'SuperAdmin'
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: 'Nova ocorrência registrada', time: '2 min atrás', unread: true },
    { id: 2, title: 'Reserva de área comum aprovada', time: '1 hora atrás', unread: true },
    { id: 3, title: 'Comunicado publicado', time: '3 horas atrás', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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



  // Verificar rota ativa
  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
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
      // Implementar logout real aqui
      console.log('Logout realizado');
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

  // Fechar sidebar ao mudar de rota em mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

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
