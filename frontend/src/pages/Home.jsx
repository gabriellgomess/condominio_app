import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080d08] via-[#0a0f0a] to-[#080d08] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#3dc43d]/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#3dc43d]/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-[#3dc43d]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Grid overlay for depth */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #3dc43d 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-header sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 glass-icon rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-[#3dc43d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#3dc43d] to-[#06e006] bg-clip-text text-transparent">
                Sistema Condomínio
              </h1>
            </div>
            <button className="btn-glass animate-fade-in">
              Entrar
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 animate-slide-down">
            <h1 className="text-6xl md:text-8xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-[#f3f7f1] to-[#e0e4de] bg-clip-text text-transparent">
                Gestão
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#3dc43d] to-[#06e006] bg-clip-text text-transparent glow-text">
                Inteligente
              </span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[#3dc43d] to-transparent mx-auto rounded-full"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-[#f3f7f1]/90 mb-16 leading-relaxed max-w-3xl mx-auto animate-slide-up font-light">
            Transforme a administração do seu condomínio com nossa plataforma moderna. 
            Controle total, transparência e eficiência em uma experiência única.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <button className="btn-primary-modern text-lg px-10 py-4 group">
              <span>Começar Agora</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="btn-secondary-modern text-lg px-10 py-4">
              <span>Demonstração</span>
            </button>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-[#3dc43d] rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-16 w-1 h-1 bg-[#3dc43d]/60 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 border border-[#3dc43d]/40 rounded-full animate-float"></div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
            <span className="text-[#f3f7f1]">Por que escolher</span>
            <br />
            <span className="bg-gradient-to-r from-[#3dc43d] to-[#06e006] bg-clip-text text-transparent">
              nossa solução?
            </span>
          </h2>
          <div className="h-1 w-16 bg-[#3dc43d] mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-[#f3f7f1]/80 max-w-2xl mx-auto animate-slide-up font-light" style={{ animationDelay: '0.2s' }}>
            Tecnologia de ponta para uma experiência excepcional
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <svg className="w-10 h-10 text-[#3dc43d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Gestão Completa</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Controle total sobre condomínios, blocos, unidades com interface intuitiva e moderna
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <svg className="w-10 h-10 text-[#3dc43d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Segurança Avançada</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Autenticação robusta com controle de acesso baseado em papéis e criptografia
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <svg className="w-10 h-10 text-[#3dc43d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Alta Performance</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Interface ultra-responsiva otimizada para todos os dispositivos e navegadores
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <svg className="w-10 h-10 text-[#3dc43d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Analytics Inteligente</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Relatórios detalhados e insights em tempo real para decisões estratégicas
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <svg className="w-10 h-10 text-[#3dc43d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Multi-Usuário</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Suporte completo para administradores, síndicos e moradores em uma plataforma
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <svg className="w-10 h-10 text-[#3dc43d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Design Excepcional</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Interface elegante com foco na experiência do usuário e acessibilidade
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="glass-panel max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 text-center">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-[#3dc43d] to-[#06e006] bg-clip-text text-transparent">100%</div>
              <div className="text-[#f3f7f1]/80 font-light tracking-wide">Confiável</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-[#3dc43d] to-[#06e006] bg-clip-text text-transparent">24/7</div>
              <div className="text-[#f3f7f1]/80 font-light tracking-wide">Disponível</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-[#3dc43d] to-[#06e006] bg-clip-text text-transparent">∞</div>
              <div className="text-[#f3f7f1]/80 font-light tracking-wide">Escalável</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-[#3dc43d] to-[#06e006] bg-clip-text text-transparent">⚡</div>
              <div className="text-[#f3f7f1]/80 font-light tracking-wide">Ultra Rápido</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 glass-footer">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-10 h-10 glass-icon rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#3dc43d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#3dc43d] to-[#06e006] bg-clip-text text-transparent">
                Sistema Condomínio
              </h3>
            </div>
            <p className="text-[#f3f7f1]/80 mb-8 font-light text-lg max-w-md mx-auto">
              Revolucionando a gestão condominial com tecnologia e design de vanguarda
            </p>
            <div className="flex justify-center items-center space-x-8">
              <button className="text-[#3dc43d] hover:text-[#06e006] transition-all duration-300 font-medium">
                Acesso
              </button>
              <div className="w-px h-4 bg-[#3dc43d]/30"></div>
              <span className="text-[#f3f7f1]/60 hover:text-[#f3f7f1]/80 transition-colors cursor-pointer font-medium">Suporte</span>
              <div className="w-px h-4 bg-[#3dc43d]/30"></div>
              <span className="text-[#f3f7f1]/60 hover:text-[#f3f7f1]/80 transition-colors cursor-pointer font-medium">Docs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;