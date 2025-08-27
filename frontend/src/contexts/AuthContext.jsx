import { createContext, useContext, useState, useEffect } from 'react';
import structureService from '../services/structureService';
import cacheService from '../services/cacheService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    if (token) {
      try {
        const response = await fetch('http://localhost:8000/api/redirect-info', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Recupera dados completos do usuário do localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } else {
            // Fallback: reconstrói dados básicos
            setUser({
              access_level: data.redirect_info.access_level,
              redirect_to: data.redirect_info.redirect_to,
              area_name: data.redirect_info.area_name,
              token: token
            });
          }
        } else {
          // Token inválido, limpar dados
          logout();
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          access_level: data.data.access_level,
          redirect_to: data.redirect_info.redirect_to,
          area_name: data.redirect_info.area_name,
          token: data.token
        };
        
        setUser(userData);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Carregar dados estruturais após login bem-sucedido
        await loadStructureData();
        
        return { success: true, data: userData };
      } else {
        return { success: false, message: data.message || 'Erro no login' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const loadStructureData = async () => {
    try {
      // Usar a nova API unificada para carregar todos os dados estruturais de uma vez
      const response = await structureService.structure.getCompleteStructure();
      const structureData = response.data;
      
      // Usar o serviço de cache para armazenar os dados
      cacheService.storeStructureData(structureData);
      
      console.log('Dados estruturais carregados com sucesso via API unificada no login');
    } catch (error) {
      console.error('Erro ao carregar dados estruturais no login:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpar cache de dados estruturais usando o serviço
    cacheService.clearCache();
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
