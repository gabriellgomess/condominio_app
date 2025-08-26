import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Configuração do menu baseada no nível de acesso
  const getMenuItems = () => {
    switch (user?.access_level) {
      case 'administrador':
        return [
          { name: 'Dashboard', icon: '🏠', path: '/admin/dashboard' },
          { name: 'Condomínios', icon: '🏢', path: '/admin/condominiums' },
          { name: 'Usuários', icon: '👥', path: '/admin/users' },
          { name: 'Fornecedores', icon: '🏪', path: '/admin/suppliers' },
          { name: 'Relatórios', icon: '📊', path: '/admin/reports' },
          { name: 'Configurações', icon: '⚙️', path: '/admin/settings' },
        ];
      case 'sindico':
        return [
          { name: 'Dashboard', icon: '🏠', path: '/syndic/dashboard' },
          { name: 'Unidades', icon: '🏠', path: '/syndic/units' },
          { name: 'Moradores', icon: '👥', path: '/syndic/residents' },
          { name: 'Vagas', icon: '🚗', path: '/syndic/parking' },
          { name: 'Relatórios', icon: '📊', path: '/syndic/reports' },
          { name: 'Comunicação', icon: '💬', path: '/syndic/communication' },
          { name: 'Manutenção', icon: '🔧', path: '/syndic/maintenance' },
        ];
      case 'morador':
        return [
          { name: 'Dashboard', icon: '🏠', path: '/resident/dashboard' },
          { name: 'Minha Unidade', icon: '🏠', path: '/resident/unit' },
          { name: 'Anúncios', icon: '📢', path: '/resident/announcements' },
          { name: 'Serviços', icon: '🛠️', path: '/resident/services' },
          { name: 'Documentos', icon: '📄', path: '/resident/documents' },
          { name: 'Contato', icon: '📞', path: '/resident/contact' },
        ];
      case 'funcionario':
        return [
          { name: 'Dashboard', icon: '🏠', path: '/employee/dashboard' },
          { name: 'Tarefas', icon: '✅', path: '/employee/tasks' },
          { name: 'Manutenção', icon: '🔧', path: '/employee/maintenance' },
          { name: 'Limpeza', icon: '🧹', path: '/employee/cleaning' },
          { name: 'Segurança', icon: '🛡️', path: '/employee/security' },
          { name: 'Relatórios', icon: '📊', path: '/employee/reports' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`bg-gradient-to-b from-[#080d08] to-[#0a1a0a] text-white h-screen transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } fixed left-0 top-0 z-50 shadow-2xl`}>
      
      {/* Header do Sidebar */}
      <div className="p-4 border-b border-[#3dc43d]/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3dc43d] to-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-[#3dc43d] font-bold text-lg">Sistema</span>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-[#3dc43d]/20 transition-colors duration-200"
          >
            {isCollapsed ? (
              <svg className="w-5 h-5 text-[#3dc43d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-[#3dc43d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="mt-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#3dc43d] text-white shadow-lg'
                      : 'text-[#f3f7f1] hover:bg-[#3dc43d]/20 hover:text-[#3dc43d]'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info e Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#3dc43d]/20">
        {!isCollapsed && (
          <div className="mb-4">
            <div className="text-sm text-[#3dc43d] font-medium mb-1">
              {user?.area_name}
            </div>
            <div className="text-xs text-[#f3f7f1]/70">
              {user?.name}
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
