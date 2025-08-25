import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title, breadcrumbs = [] }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080d08] via-[#0a1a0a] to-[#0f2f0f]">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="ml-64 transition-all duration-300">
        {/* Header */}
        <Header title={title} breadcrumbs={breadcrumbs} />
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
