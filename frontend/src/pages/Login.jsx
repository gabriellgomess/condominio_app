import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building, ArrowLeft, Mail, Lock, ArrowRight, AlertCircle, Info } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Login successful, redirect to the appropriate area
        navigate(result.data.redirect_to);
      } else {
        setError(result.message || 'Erro ao fazer login');
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080d08] via-[#0a0f0a] to-[#080d08] relative overflow-hidden">
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ff6600]/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#ff6600]/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-[#ff6600]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#ff6600]/12 rounded-full blur-3xl animate-float" style={{ animationDelay: '6s' }}></div>
        
        {/* Grid overlay for depth */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ff6600 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-[#ff6600] rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-16 w-1 h-1 bg-[#ff6600]/60 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 border border-[#ff6600]/40 rounded-full animate-float"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-[#fa7a25]/50 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-1/3 right-10 w-2.5 h-2.5 border-2 border-[#ff6600]/30 rounded-full animate-rotate-slow"></div>
      </div>

      {/* Modern Header */}
      <header className="relative z-10 glass-header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 glass-icon rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Building className="w-7 h-7 text-[#ff6600]" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ff6600] to-[#fa7a25] bg-clip-text text-transparent">
                síndicoapp
              </h1>
            </Link>
            <Link to="/" className="btn-glass animate-fade-in hover:scale-105 transition-all duration-300 flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Modern Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md">
          <div className="glass-panel p-8 animate-scale-in">
            {/* Modern Header */}
            <div className="text-center mb-8">
              <div className="glass-icon-large mx-auto mb-6 animate-glow">
                <Lock className="w-10 h-10 text-[#ff6600]" />
              </div>
              <h1 className="text-4xl font-bold mb-4 animate-slide-down">              
                <span className="bg-gradient-to-r from-[#ff6600] to-[#fa7a25] bg-clip-text text-transparent glow-text">
                  Login
                </span>
              </h1>
              <div className="h-1 w-16 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] mx-auto rounded-full mb-4 animate-glow"></div>
              <p className="text-[#f3f7f1]/80 font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Faça login para acessar sua conta
              </p>
            </div>

            {/* Modern Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="glass-card bg-red-500/10 border-red-500/30 text-red-200 px-4 py-3 animate-fade-in">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                  </div>
                </div>
              )}

              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <label htmlFor="email" className="block text-sm font-medium text-[#f3f7f1] mb-3">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#ff6600] group-focus-within:text-[#fa7a25] transition-colors duration-300" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[#080d08]/40 backdrop-blur-sm border border-[#ff6600]/20 rounded-xl text-[#f3f7f1] placeholder-[#ff6600]/50 focus:outline-none focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600]/50 transition-all duration-300 hover:border-[#ff6600]/40 hover:bg-[#080d08]/60"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <label htmlFor="password" className="block text-sm font-medium text-[#f3f7f1] mb-3">
                  Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#ff6600] group-focus-within:text-[#fa7a25] transition-colors duration-300" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[#080d08]/40 backdrop-blur-sm border border-[#ff6600]/20 rounded-xl text-[#f3f7f1] placeholder-[#ff6600]/50 focus:outline-none focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600]/50 transition-all duration-300 hover:border-[#ff6600]/40 hover:bg-[#080d08]/60"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary-modern py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#080d08] mr-3"></div>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Entrar</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>
            </form>

            {/* Modern Test Users Info */}
            {/* <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="glass-card p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 glass-icon rounded-lg flex items-center justify-center mr-3">
                    <Info className="w-4 h-4 text-[#ff6600]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#ff6600]">Usuários para teste</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#080d08]/30 rounded-lg border border-[#ff6600]/10 hover:border-[#ff6600]/20 transition-colors duration-300">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#ff6600] rounded-full mr-3"></div>
                      <span className="text-[#f3f7f1] font-medium">Admin</span>
                    </div>
                    <span className="font-mono text-xs text-[#ff6600]/80">admin@condominio.com</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#080d08]/30 rounded-lg border border-[#ff6600]/10 hover:border-[#ff6600]/20 transition-colors duration-300">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#fa7a25] rounded-full mr-3"></div>
                      <span className="text-[#f3f7f1] font-medium">Síndico</span>
                    </div>
                    <span className="font-mono text-xs text-[#ff6600]/80">sindico@condominio.com</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#080d08]/30 rounded-lg border border-[#ff6600]/10 hover:border-[#ff6600]/20 transition-colors duration-300">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#ff6600]/70 rounded-full mr-3"></div>
                      <span className="text-[#f3f7f1] font-medium">Morador</span>
                    </div>
                    <span className="font-mono text-xs text-[#ff6600]/80">morador@condominio.com</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#080d08]/30 rounded-lg border border-[#ff6600]/10 hover:border-[#ff6600]/20 transition-colors duration-300">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#fa7a25]/70 rounded-full mr-3"></div>
                      <span className="text-[#f3f7f1] font-medium">Funcionário</span>
                    </div>
                    <span className="font-mono text-xs text-[#ff6600]/80">funcionario@condominio.com</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-[#ff6600]/10 rounded-lg border border-[#ff6600]/20">
                  <p className="text-xs text-[#ff6600] text-center font-medium">
                    Senha padrão para todos: <span className="font-mono">123456</span>
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
