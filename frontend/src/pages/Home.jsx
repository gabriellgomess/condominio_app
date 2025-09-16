import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  ArrowRight, 
  CheckCircle, 
  Lock, 
  Zap, 
  BarChart3, 
  Users, 
  Heart,
  ArrowLeft,
  Smile,
  Calendar
} from 'lucide-react';
import Logo from '../components/ui/Logo';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080d08] via-[#0a0f0a] to-[#080d08] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ff6600]/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#ff6600]/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-[#ff6600]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Grid overlay for depth */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ff6600 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-header sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo 
                variant="horizontal" 
                size="medium" 
                theme="light"
                className="flex-shrink-0"
              />
            </div>
            <Link to="/login" className="btn-glass animate-fade-in hover:scale-105 transition-all duration-300">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 animate-slide-down">
            <div className="flex justify-center mb-6">
              <Logo 
                variant="horizontal" 
                size="large" 
                theme="light"
                className="animate-fade-in"
              />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-[#f3f7f1] to-[#e0e4de] bg-clip-text text-transparent">
                Gestão
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#ff6600] to-[#fa7a25] bg-clip-text text-transparent glow-text">
                Inteligente
              </span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[#ff6600] to-transparent mx-auto rounded-full"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-[#f3f7f1]/90 mb-16 leading-relaxed max-w-3xl mx-auto animate-slide-up font-light">
            Transforme a administração do seu condomínio com nossa plataforma moderna. 
            Controle total, transparência e eficiência em uma experiência única.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/login" className="btn-primary-modern text-lg px-10 py-4 group">
              <span>Começar Agora</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="btn-secondary-modern text-lg px-10 py-4 group">
              <span>Demonstração</span>
            </button>
          </div>
        </div>

        {/* Enhanced Floating elements */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-[#ff6600] rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-16 w-1 h-1 bg-[#ff6600]/60 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 border border-[#ff6600]/40 rounded-full animate-float"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-[#fa7a25]/50 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-1/3 right-10 w-2.5 h-2.5 border-2 border-[#ff6600]/30 rounded-full animate-rotate-slow"></div>
        <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-[#ff6600]/80 rounded-full animate-pulse-slow"></div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
            <span className="text-[#f3f7f1]">Por que escolher</span>
            <br />
            <span className="bg-gradient-to-r from-[#ff6600] to-[#fa7a25] bg-clip-text text-transparent glow-text">
              nossa solução?
            </span>
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] mx-auto rounded-full mb-8 animate-glow"></div>
          <p className="text-xl text-[#f3f7f1]/80 max-w-2xl mx-auto animate-slide-up font-light" style={{ animationDelay: '0.2s' }}>
            Tecnologia de ponta para uma experiência excepcional
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <CheckCircle className="w-10 h-10 text-[#ff6600]" />
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Gestão Completa</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Controle total sobre condomínios, blocos, unidades com interface intuitiva e moderna
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <Lock className="w-10 h-10 text-[#ff6600]" />
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Segurança Avançada</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Autenticação robusta com controle de acesso baseado em papéis e criptografia
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <Zap className="w-10 h-10 text-[#ff6600]" />
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Alta Performance</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Interface ultra-responsiva otimizada para todos os dispositivos e navegadores
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <BarChart3 className="w-10 h-10 text-[#ff6600]" />
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Analytics Inteligente</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Relatórios detalhados e insights em tempo real para decisões estratégicas
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <Users className="w-10 h-10 text-[#ff6600]" />
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Multi-Usuário</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Suporte completo para administradores, síndicos e moradores em uma plataforma
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-card group animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="glass-icon-large mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
              <Heart className="w-10 h-10 text-[#ff6600]" />
            </div>
            <h3 className="text-2xl font-bold text-[#f3f7f1] mb-4">Design Excepcional</h3>
            <p className="text-[#f3f7f1]/70 leading-relaxed font-light">
              Interface elegante com foco na experiência do usuário e acessibilidade
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="glass-panel max-w-4xl mx-auto relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6600] to-transparent opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-[#fa7a25] to-transparent opacity-50"></div>
          
          <div className="grid md:grid-cols-4 gap-12 text-center">
            <div className="animate-scale-in group" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">100%</div>
              <div className="text-[#f3f7f1]/80 font-light tracking-wide group-hover:text-[#ff6600] transition-colors duration-300">Confiável</div>
            </div>
            <div className="animate-scale-in group" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-[#f3f7f1]/80 font-light tracking-wide group-hover:text-[#ff6600] transition-colors duration-300">Disponível</div>
            </div>
            <div className="animate-scale-in group" style={{ animationDelay: '0.3s' }}>
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">∞</div>
              <div className="text-[#f3f7f1]/80 font-light tracking-wide group-hover:text-[#ff6600] transition-colors duration-300">Escalável</div>
            </div>
            <div className="animate-scale-in group" style={{ animationDelay: '0.4s' }}>
              <div className="text-5xl font-bold mb-3 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">⚡</div>
              <div className="text-[#f3f7f1]/80 font-light tracking-wide group-hover:text-[#ff6600] transition-colors duration-300">Ultra Rápido</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="glass-panel max-w-4xl mx-auto text-center relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-4 w-2 h-2 bg-[#ff6600]/30 rounded-full animate-ping"></div>
            <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-[#fa7a25]/40 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 left-8 w-1 h-1 bg-[#ff6600]/50 rounded-full animate-bounce-slow"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
              <span className="text-[#f3f7f1]">Pronto para</span>
              <br />
              <span className="bg-gradient-to-r from-[#ff6600] to-[#fa7a25] bg-clip-text text-transparent glow-text">
                transformar seu condomínio?
              </span>
            </h2>
            <p className="text-xl text-[#f3f7f1]/80 mb-10 max-w-2xl mx-auto font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Junte-se a centenas de condomínios que já revolucionaram sua gestão com nossa plataforma
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/login" className="btn-primary-modern text-lg px-12 py-4 group">
                <span>Começar Agora</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-secondary-modern text-lg px-12 py-4 group">
                <span>Agendar Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 glass-footer">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Logo 
                variant="horizontal" 
                size="medium" 
                theme="dark"
                className="flex-shrink-0"
              />
            </div>
            <p className="text-[#f3f7f1]/80 mb-8 font-light text-lg max-w-md mx-auto">
              Revolucionando a gestão condominial com tecnologia e design de vanguarda
            </p>
            <div className="flex justify-center items-center space-x-8">
              <Link to="/login" className="text-[#ff6600] hover:text-[#fa7a25] transition-all duration-300 font-medium hover:scale-105">
                Acesso
              </Link>
              <div className="w-px h-4 bg-[#ff6600]/30"></div>
              <span className="text-[#f3f7f1]/60 hover:text-[#f3f7f1]/80 transition-colors cursor-pointer font-medium hover:scale-105">Suporte</span>
              <div className="w-px h-4 bg-[#ff6600]/30"></div>
              <span className="text-[#f3f7f1]/60 hover:text-[#f3f7f1]/80 transition-colors cursor-pointer font-medium hover:scale-105">Docs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;