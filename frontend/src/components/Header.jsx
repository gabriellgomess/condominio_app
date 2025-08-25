import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ title, breadcrumbs = [] }) => {
  const { user } = useAuth();

  return (
    <header className="bg-gradient-to-r from-[#080d08]/95 to-[#0a1a0a]/95 backdrop-blur-md border-b border-[#04d404]/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-2 mt-2">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <span className="text-[#04d404]/40">/</span>
                  )}
                  <span className="text-[#f3f7f1]/70 text-sm">{crumb}</span>
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-[#f3f7f1] text-sm">Bem-vindo,</div>
            <div className="text-[#04d404] font-medium">{user?.name}</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-[#04d404] to-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
