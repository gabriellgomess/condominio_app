import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080d08] via-[#0a1a0a] to-[#0f2f0f] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#04d404]/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#04d404]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#04d404]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-r from-[#080d08]/95 to-[#0a1a0a]/95 backdrop-blur-md border-b border-[#04d404]/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#04d404] to-green-500 rounded-lg flex items-center justify-center animate-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#04d404]">Sistema Condomínio</h1>
            </div>
            <Link 
              to="/login" 
              className="btn-primary animate-fade-in"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 animate-slide-down">
            <span className="text-[#04d404]">Gestão Inteligente</span>
            <br />
            <span className="text-white">de Condomínios</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#f3f7f1] mb-12 leading-relaxed animate-slide-up">
            Simplifique a administração do seu condomínio com nossa plataforma completa e intuitiva. 
            Controle total, transparência e eficiência em um só lugar.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/login" className="btn-primary text-lg px-8 py-4">
              Começar Agora
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Saiba Mais
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-slide-up">
            Por que escolher nosso sistema?
          </h2>
          <p className="text-xl text-[#f3f7f1] max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Desenvolvido com as melhores tecnologias para oferecer uma experiência excepcional
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card card-hover p-8 text-center group animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="w-20 h-20 bg-gradient-to-br from-[#04d404] to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce-slow transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Gestão Completa</h3>
            <p className="text-[#f3f7f1] leading-relaxed">
              Controle total sobre condomínios, blocos, unidades e muito mais com interface intuitiva
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card card-hover p-8 text-center group animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce-slow transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Segurança Total</h3>
            <p className="text-[#f3f7f1] leading-relaxed">
              Sistema de autenticação robusto com controle de acesso baseado em papéis
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card card-hover p-8 text-center group animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce-slow transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Performance</h3>
            <p className="text-[#f3f7f1] leading-relaxed">
              Interface responsiva e rápida, otimizada para todos os dispositivos
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card card-hover p-8 text-center group animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce-slow transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Relatórios</h3>
            <p className="text-[#f3f7f1] leading-relaxed">
              Geração de relatórios detalhados para tomada de decisões informadas
            </p>
          </div>

          {/* Feature 5 */}
          <div className="card card-hover p-8 text-center group animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce-slow transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Multi-Usuário</h3>
            <p className="text-[#f3f7f1] leading-relaxed">
              Suporte para diferentes tipos de usuários: administradores, síndicos, moradores
            </p>
          </div>

          {/* Feature 6 */}
          <div className="card card-hover p-8 text-center group animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce-slow transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Interface Moderna</h3>
            <p className="text-[#f3f7f1] leading-relaxed">
              Design elegante e responsivo com paleta de cores personalizável
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-[#080d08]/80 to-[#0a1a0a]/80 backdrop-blur-sm border border-[#04d404]/20 rounded-2xl p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl font-bold text-[#04d404] mb-2">100%</div>
              <div className="text-[#f3f7f1]">Seguro</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold text-[#04d404] mb-2">24/7</div>
              <div className="text-[#f3f7f1]">Disponível</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold text-[#04d404] mb-2">∞</div>
              <div className="text-[#f3f7f1]">Escalável</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-4xl font-bold text-[#04d404] mb-2">⚡</div>
              <div className="text-[#f3f7f1]">Rápido</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-[#080d08] to-[#0a1a0a] border-t border-[#04d404]/20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-[#04d404] to-green-500 rounded-lg flex items-center justify-center animate-pulse-slow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#04d404]">Sistema Condomínio</h3>
            </div>
            <p className="text-[#f3f7f1] mb-6">
              Transformando a gestão de condomínios com tecnologia de ponta
            </p>
            <div className="flex justify-center space-x-6">
              <Link to="/login" className="text-[#04d404] hover:text-green-400 transition-colors duration-300">
                Entrar
              </Link>
              <span className="text-[#04d404]/40">•</span>
              <span className="text-[#f3f7f1]/70">Suporte</span>
              <span className="text-[#04d404]/40">•</span>
              <span className="text-[#f3f7f1]/70">Documentação</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
