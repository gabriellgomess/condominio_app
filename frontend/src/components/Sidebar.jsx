import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Users,
  Building,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Bell,
  DollarSign,
  Shield,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Truck
} from 'lucide-react';
import { useLayout } from './Layout';
import Logo from './ui/Logo';

const Sidebar = () => {
  const {
    isSidebarOpen,
    isMobile,
    openSubmenu,
    isDarkMode,
    user,
    toggleSidebar,
    closeSidebar,
    toggleSubmenu,
    getInitials,
    handleLogout,
    isActiveRoute
  } = useLayout();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      path: '/dashboard',
      submenu: []
    },
    {
      title: 'Moradores',
      icon: <Users className="w-5 h-5" />,
      path: '/admin/residents',
      submenu: []
    },

    {
      title: 'Estrutura',
      icon: <Building className="w-5 h-5" />,
      path: '/admin/structure',
      submenu: []
    },
    {
      title: 'Fornecedores',
      icon: <Truck className="w-5 h-5" />,
      path: '/admin/suppliers',
      submenu: []
    },
    {
      title: 'Reservas',
      icon: <Calendar className="w-5 h-5" />,
      path: '/admin/reservations',
      submenu: [
        { title: 'Gerenciar Configurações', path: '/admin/reservations' },
        { title: 'Gerenciar Reservas', path: '/admin/bookings' },
        // { title: 'Minhas Reservas', path: '/reservas/minhas' },
        // { title: 'Nova Reserva', path: '/reservas/nova' }
      ]
    },
    {
      title: 'Comunicados',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/admin/announcements',
      submenu: [
        { title: 'Gerenciar Comunicados', path: '/admin/announcements' }
      ]
    },
    {
      title: 'Ocorrências',
      icon: <Bell className="w-5 h-5" />,
      path: '/admin/incidents',
      submenu: []
    },
    {
      title: 'Financeiro',
      icon: <DollarSign className="w-5 h-5" />,
      path: '/admin/finance',
      submenu: [
        { title: 'Subcontas', path: '/admin/finance/subaccounts' },
        { title: 'Categorias', path: '/admin/finance/categories' },
        { title: 'Receitas', path: '/admin/finance/revenues' },
        { title: 'Despesas', path: '/admin/finance/expenses' }
      ]
    },
    {
      title: 'Documentos',
      icon: <FileText className="w-5 h-5" />,
      path: '/documentos',
      submenu: [
        { title: 'Atas', path: '/documentos/atas' },
        { title: 'Regimento', path: '/documentos/regimento' },
        { title: 'Contratos', path: '/documentos/contratos' }
      ]
    },
    {
      title: 'Portaria',
      icon: <Shield className="w-5 h-5" />,
      path: '/portaria',
      submenu: [
        { title: 'Visitantes', path: '/portaria/visitantes' },
        { title: 'Entregas', path: '/portaria/entregas' },
        { title: 'Registro de Entrada', path: '/portaria/registro' }
      ]
    },
    {
      title: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
      path: '/configuracoes',
      submenu: []
    }
  ];

  return (
    <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isMobile && isSidebarOpen ? 'w-80' : 'w-64'}
          ${isDarkMode ? 'bg-gray-800 ' : 'bg-gray-400'}          
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isMobile ? 'backdrop-blur-sm' : ''}
        `}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      >
      {/* Header da Sidebar */}
      <div className="h-16 flex items-center justify-between px-4 flex-shrink-0">        
          <Logo 
            variant="horizontal"
            theme="dark"
            className="w-full"
          />        
        
        {/* Botão fechar sidebar (mobile) */}
        {isMobile && (
          <button
            onClick={() => toggleSidebar()}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-white hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {menuItems.map((item, index) => (
          <div key={index} className="space-y-1">
            {item.submenu.length > 0 ? (
              <button
                onClick={() => toggleSubmenu(index)}
                className={`
                  group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl
                  transition-all duration-200 hover:scale-[1.02]
                  ${isActiveRoute(item.path)
                    ? 'bg-gradient-to-r from-[#ff6600] to-[#fa7a25] text-white shadow-lg shadow-[#ff6600]/25'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center flex-1">
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                  openSubmenu === index ? 'rotate-180' : ''
                }`} />
              </button>
            ) : (
              <Link
                to={item.path}
                onClick={closeSidebar}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl
                  transition-all duration-200 hover:scale-[1.02]
                  ${isActiveRoute(item.path)
                    ? 'bg-gradient-to-r from-[#ff6600] to-[#fa7a25] text-white shadow-lg shadow-[#ff6600]/25'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
                {isActiveRoute(item.path) && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </Link>
            )}
            
            {/* Submenu com animação */}
            <div className={`overflow-hidden transition-all duration-300 ${
              item.submenu.length > 0 && openSubmenu === index
                ? 'max-h-96 opacity-100'
                : 'max-h-0 opacity-0'
            }`}>
              <div className="ml-6 mt-1 space-y-1">
                {item.submenu.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    to={subItem.path}
                    onClick={closeSidebar}
                    className={`
                      block px-3 py-2 text-sm rounded-lg transition-all duration-200
                      hover:translate-x-1
                      ${isActiveRoute(subItem.path)
                        ? 'bg-[#ff6600]/15 text-[#ff6600] font-medium border-l-2 border-[#ff6600]'
                        : isDarkMode
                          ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>

      {/* Footer da Sidebar */}
     
    </div>
  );
};

export default Sidebar;
