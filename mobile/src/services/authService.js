import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Login
  login: async (email, password) => {
    try {
      console.log('Tentando login com:', email);
      console.log('URL da API:', api.defaults.baseURL);

      const response = await api.post('/login', {
        email,
        password,
      });

      console.log('Resposta do login:', response.data);

      const { token, data, resident_data } = response.data;

      // Salvar token e dados do usuário
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(data));

      // Salvar dados do morador se existir
      if (resident_data) {
        await AsyncStorage.setItem('resident', JSON.stringify(resident_data));
      }

      return { success: true, user: data, resident: resident_data, token };
    } catch (error) {
      console.error('Erro no login:', error);
      console.error('Resposta do erro:', error.response?.data);

      let errorMessage = 'Erro ao fazer login';
      let errorDetail = '';

      if (error.response) {
        // Erro da API
        errorMessage = error.response.data?.message || 'Erro no servidor';
        errorDetail = `Status: ${error.response.status}`;
      } else if (error.request) {
        // Erro de rede
        errorMessage = 'Não foi possível conectar ao servidor';
        errorDetail = 'Verifique sua conexão e se o backend está rodando';
      } else {
        errorMessage = error.message || 'Erro desconhecido';
      }

      return {
        success: false,
        message: errorMessage,
        error: errorDetail,
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.log('Erro ao fazer logout na API:', error);
    } finally {
      // Sempre limpar dados locais
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('resident');
    }
  },

  // Obter perfil do usuário
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return { success: true, user: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar perfil',
      };
    }
  },

  // Verificar se está autenticado
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },

  // Obter usuário armazenado
  getStoredUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obter dados do morador armazenado
  getStoredResident: async () => {
    const residentStr = await AsyncStorage.getItem('resident');
    return residentStr ? JSON.parse(residentStr) : null;
  },
};
