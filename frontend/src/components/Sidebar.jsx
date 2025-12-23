import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Users,
  Building,
  Calendar,
  Settings,
  Bell,
  DollarSign,
  Shield,
  X,
  ChevronDown,
  ChevronRight,
  Truck,
  Briefcase,
  Scale,
  GraduationCap,
  MessageCircle,
  UserCog
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
    // GESTÃO FINANCEIRA
    {
      title: 'Gestão Financeira',
      icon: <DollarSign className="w-5 h-5" />,
      path: '/admin/finance',
      submenu: [
        { title: 'Subcontas', path: '/admin/finance/subaccounts' },
        { title: 'Categorias', path: '/admin/finance/categories' },
        { title: 'Receitas', path: '/admin/finance/revenues' },
        { title: 'Despesas', path: '/admin/finance/expenses' },
        { title: 'Inadimplência', path: '/admin/finance/defaults' },
        { title: 'Saldos', path: '/admin/finance/balances' },
        { title: 'Mensalidades', path: '/admin/billing/monthly-fees' },
        { title: 'Boletos', path: '/admin/billing/unit-billings' },
        { title: 'Análises e Alertas', path: '/admin/finance/analysis' }
      ]
    },
    // GESTÃO ADMINISTRATIVA
    {
      title: 'Gestão Administrativa',
      icon: <Briefcase className="w-5 h-5" />,
      path: '/admin/administrative',
      submenu: [
        { title: 'Contratos', path: '/admin/administrative/contracts' },
        { title: 'Controles', path: '/admin/administrative/controls' },
        { title: 'Ações a Realizar', path: '/admin/administrative/actions' },
        { title: 'Padrões do Condomínio', path: '/admin/administrative/standards' },
        { title: 'Notificações e Multas', path: '/admin/administrative/notifications' },
        { title: 'Documentos', path: '/admin/administrative/documents' },
        { title: 'Chatbot', path: '/admin/administrative/chatbot' },
        { title: 'Contatos', path: '/admin/administrative/contacts' },
        { title: 'Senhas', path: '/admin/administrative/passwords' },
        { title: 'Assembleias e Enquetes', path: '/admin/administrative/assemblies' }
      ]
    },
    // GESTÃO OPERACIONAL
    {
      title: 'Gestão Operacional',
      icon: <UserCog className="w-5 h-5" />,
      path: '/admin/operational',
      submenu: [
        { title: 'Serviço de Portaria', path: '/admin/operational/gate-service' },
        { title: 'Serviço de Ronda', path: '/admin/operational/patrol-service' },
        { title: 'Serviço de Zeladoria', path: '/admin/operational/maintenance-service' },
        { title: 'Serviço de Limpeza', path: '/admin/operational/cleaning-service' },
        { title: 'Serviço Administrativo', path: '/admin/operational/admin-service' },
        { title: 'Recursos Humanos', path: '/admin/operational/hr' },
        { title: 'Relatórios e Gráficos', path: '/admin/operational/reports' }
      ]
    },
    // ÁREA DE INTERAÇÃO COM MORADORES
    {
      title: 'Moradores',
      icon: <Users className="w-5 h-5" />,
      path: '/admin/residents',
      submenu: [
        { title: 'Cadastro de Moradores', path: '/admin/residents' },
        { title: 'Cadastro de Veículos', path: '/admin/residents/vehicles' },
        { title: 'Cadastro de PETs', path: '/admin/residents/pets' },
        { title: 'Cadastro de Visitantes', path: '/admin/residents/visitors' },
        { title: 'Comunicados', path: '/admin/announcements' },
        { title: 'Calendário de Eventos', path: '/admin/residents/calendar' },
        { title: 'Encomendas', path: '/admin/gate/deliveries' },
        { title: 'Anúncios', path: '/admin/residents/ads' }
      ]
    },
    // PORTARIA
    {
      title: 'Portaria',
      icon: <Shield className="w-5 h-5" />,
      path: '/portaria',
      submenu: [
        { title: 'Controle de Acesso', path: '/portaria/access-control' },
        { title: 'Visitantes', path: '/portaria/visitantes' },
        { title: 'Entregas', path: '/admin/gate/deliveries' },
        { title: 'Registro de Entrada', path: '/portaria/registro' },
        { title: 'Correspondências', path: '/portaria/mail' }
      ]
    },
    // ESTRUTURA E RESERVAS
    {
      title: 'Estrutura',
      icon: <Building className="w-5 h-5" />,
      path: '/admin/structure',
      submenu: []
    },
    {
      title: 'Reservas',
      icon: <Calendar className="w-5 h-5" />,
      path: '/admin/reservations',
      submenu: [
        { title: 'Gerenciar Configurações', path: '/admin/reservations' },
        { title: 'Gerenciar Reservas', path: '/admin/bookings' }
      ]
    },
    // OCORRÊNCIAS
    {
      title: 'Ocorrências',
      icon: <Bell className="w-5 h-5" />,
      path: '/admin/incidents',
      submenu: []
    },
    // SERVIÇOS E FORNECEDORES
    {
      title: 'Serviços e Fornecedores',
      icon: <Truck className="w-5 h-5" />,
      path: '/admin/suppliers',
      submenu: [
        { title: 'Fornecedores', path: '/admin/suppliers' },
        { title: 'Publicações', path: '/admin/suppliers/posts' },
        { title: 'Orçamentos', path: '/admin/suppliers/quotes' }
      ]
    },
    // LEGISLAÇÃO
    {
      title: 'Legislação',
      icon: <Scale className="w-5 h-5" />,
      path: '/admin/legislation',
      submenu: [
        { title: 'Código Civil', path: '/admin/legislation/civil-code' },
        { title: 'LGPD', path: '/admin/legislation/lgpd' },
        { title: 'Legislações Municipais', path: '/admin/legislation/municipal' },
        { title: 'Outras Legislações', path: '/admin/legislation/others' }
      ]
    },
    // CONCEITOS E CAPACITAÇÕES
    {
      title: 'Conceitos e Capacitações',
      icon: <GraduationCap className="w-5 h-5" />,
      path: '/admin/training',
      submenu: [
        { title: 'Convenção de Condomínio', path: '/admin/training/convention' },
        { title: 'Regulamento Interno', path: '/admin/training/internal-rules' },
        { title: 'Assembleias', path: '/admin/training/assemblies' },
        { title: 'Gestão Financeira', path: '/admin/training/financial' },
        { title: 'Direitos e Deveres', path: '/admin/training/rights-duties' }
      ]
    },
    // FEEDBACK
    {
      title: 'Feedback',
      icon: <MessageCircle className="w-5 h-5" />,
      path: '/admin/feedback',
      submenu: []
    },
    // CONFIGURAÇÕES
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
          ${isDarkMode ? 'bg-gray-800 ' : 'bg-stone-700'}          
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
                      : 'text-gray-300 hover:bg-gray-100 hover:text-gray-900'
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
                      : 'text-gray-300 hover:bg-gray-100 hover:text-gray-900'
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
                ? 'max-h-[500px] opacity-100'
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
                          : 'text-gray-200 hover:bg-gray-50 hover:text-gray-900'
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
