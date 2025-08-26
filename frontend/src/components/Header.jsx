import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Bell, ChevronRight } from 'lucide-react';

const Header = ({ title, breadcrumbs = [] }) => {
  const { user } = useAuth();

  return (
    <header className="glass-header sticky top-0 z-30 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="animate-slide-down">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            <span className="bg-gradient-to-r from-[#f3f7f1] to-[#e0e4de] bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-2">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <ChevronRight className="w-3 h-3 text-[#3dc43d]/40" />
                  )}
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    index === breadcrumbs.length - 1 
                      ? 'text-[#3dc43d]' 
                      : 'text-[#f3f7f1]/70 hover:text-[#3dc43d]'
                  }`}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-4 animate-slide-down" style={{ animationDelay: '0.1s' }}>
          <div className="hidden md:block text-right">
            <div className="text-[#f3f7f1]/80 text-sm font-light">Bem-vindo,</div>
            <div className="text-[#3dc43d] font-semibold">{user?.name}</div>
          </div>
          
          <div className="glass-icon-large w-12 h-12 hover:scale-105 transition-transform duration-300">
            <User className="w-6 h-6 text-[#3dc43d]" />
          </div>
          
          {/* Notification Bell */}
          <div className="glass-icon p-2 hover:scale-105 transition-transform duration-300 relative group">
            <Bell className="w-5 h-5 text-[#3dc43d]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3dc43d] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
