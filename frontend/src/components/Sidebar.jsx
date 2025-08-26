import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Building,
  Users,
  FileText,
  BarChart3,
  Settings,
  Building2,
  Car,
  MessageSquare,
  Wrench,
  Megaphone,
  Briefcase,
  File,
  Phone,
  CheckSquare,
  Trash2,
  Shield,
  ChevronRight,
  ChevronLeft,
  LogOut,
  User
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Mapeamento de ícones do Lucide React
  const getIcon = (iconName) => {
    const icons = {
      dashboard: Home,
      buildings: Building,
      users: Users,
      suppliers: FileText,
      reports: BarChart3,
      settings: Settings,
      units: Building2,
      parking: Car,
      communication: MessageSquare,
      maintenance: Wrench,
      announcements: Megaphone,
      services: Briefcase,
      documents: File,
      contact: Phone,
      tasks: CheckSquare,
      cleaning: Trash2,
      security: Shield
    };
    return icons[iconName] || Home;
  };

  // Configuração do menu baseada no nível de acesso
  const getMenuItems = () => {
    switch (user?.access_level) {
      case 'administrador':
        return [
          { name: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
          { name: 'Condomínios', icon: 'buildings', path: '/admin/condominiums' },
          { name: 'Usuários', icon: 'users', path: '/admin/users' },
          { name: 'Fornecedores', icon: 'suppliers', path: '/admin/suppliers' },
          { name: 'Relatórios', icon: 'reports', path: '/admin/reports' },
          { name: 'Configurações', icon: 'settings', path: '/admin/settings' },
        ];
      case 'sindico':
        return [
          { name: 'Dashboard', icon: 'dashboard', path: '/syndic/dashboard' },
          { name: 'Unidades', icon: 'units', path: '/syndic/units' },
          { name: 'Moradores', icon: 'users', path: '/syndic/residents' },
          { name: 'Vagas', icon: 'parking', path: '/syndic/parking' },
          { name: 'Relatórios', icon: 'reports', path: '/syndic/reports' },
          { name: 'Comunicação', icon: 'communication', path: '/syndic/communication' },
          { name: 'Manutenção', icon: 'maintenance', path: '/syndic/maintenance' },
        ];
      case 'morador':
        return [
          { name: 'Dashboard', icon: 'dashboard', path: '/resident/dashboard' },
          { name: 'Minha Unidade', icon: 'units', path: '/resident/unit' },
          { name: 'Anúncios', icon: 'announcements', path: '/resident/announcements' },
          { name: 'Serviços', icon: 'services', path: '/resident/services' },
          { name: 'Documentos', icon: 'documents', path: '/resident/documents' },
          { name: 'Contato', icon: 'contact', path: '/resident/contact' },
        ];
      case 'funcionario':
        return [
          { name: 'Dashboard', icon: 'dashboard', path: '/employee/dashboard' },
          { name: 'Tarefas', icon: 'tasks', path: '/employee/tasks' },
          { name: 'Manutenção', icon: 'maintenance', path: '/employee/maintenance' },
          { name: 'Limpeza', icon: 'cleaning', path: '/employee/cleaning' },
          { name: 'Segurança', icon: 'security', path: '/employee/security' },
          { name: 'Relatórios', icon: 'reports', path: '/employee/reports' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`glass-header backdrop-blur-xl h-screen transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } fixed left-0 top-0 z-50 shadow-2xl border-r border-[#3dc43d]/20`}>
      
      {/* Modern Header do Sidebar */}
      <div className="p-4 border-b border-[#3dc43d]/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="glass-icon-large w-10 h-10">
                <Building className="w-6 h-6 text-[#3dc43d]" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-[#3dc43d] to-[#06e006] bg-clip-text text-transparent font-bold text-lg">
                  Sistema
                </span>
                <div className="text-xs text-[#f3f7f1]/60 font-light">Condomínio</div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="glass-icon p-2 hover:scale-105 transition-all duration-300"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#3dc43d]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#3dc43d]" />
            )}
          </button>
        </div>
      </div>

      {/* Modern Menu Items */}
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'glass-card border-[#3dc43d]/50 bg-[#3dc43d]/20 text-[#06e006] shadow-lg'
                      : 'text-[#f3f7f1] hover:glass-card hover:border-[#3dc43d]/30 hover:text-[#3dc43d] hover:bg-[#3dc43d]/10'
                  }`}
                >
                  <div className={`glass-icon p-1 transition-all duration-300 ${
                    isActive ? 'bg-[#3dc43d]/30 border-[#3dc43d]/50' : 'group-hover:bg-[#3dc43d]/20'
                  }`}>
                    {React.createElement(getIcon(item.icon), { className: "w-5 h-5" })}
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-3 w-2 h-2 bg-[#3dc43d] rounded-full animate-pulse"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Modern User Info e Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#3dc43d]/20 glass-footer">
        {!isCollapsed && (
          <div className="mb-4 glass-card p-3 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 glass-icon rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-[#3dc43d]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#3dc43d] font-medium truncate">
                  {user?.area_name}
                </div>
                <div className="text-xs text-[#f3f7f1]/70 truncate">
                  {user?.name}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl glass-card border-red-500/20 text-red-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="glass-icon p-1 border-red-500/20 group-hover:border-red-500/40 group-hover:bg-red-500/20">
            <LogOut className="w-4 h-4" />
          </div>
          {!isCollapsed && <span className="font-medium text-sm">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
