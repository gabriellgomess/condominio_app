import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import condominiumService from './condominiumService';

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

      console.log('👤 Dados do usuário:', data);
      console.log('🏠 Dados do morador:', resident_data);
      console.log('🔑 Access level:', data?.access_level);

      // Salvar token e dados do usuário
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(data));

      // Salvar dados do morador se existir
      let finalResidentData = resident_data;

      if (resident_data) {
        console.log('✅ Resident data encontrado, condominium_id:', resident_data.condominium_id);
        await AsyncStorage.setItem('resident', JSON.stringify(resident_data));
      } else {
        console.log('⚠️ Sem resident_data - usuário não é morador, buscando condomínios...');

        // Para administradores/síndicos, buscar o primeiro condomínio disponível
        if (data?.access_level === 'administrador' || data?.access_level === 'sindico') {
          try {
            const condResponse = await condominiumService.getCondominiums();
            console.log('🏢 Condomínios encontrados:', condResponse.data?.length || 0);

            if (condResponse.success && condResponse.data?.length > 0) {
              const firstCondominium = condResponse.data[0];
              finalResidentData = {
                condominium_id: firstCondominium.id,
                condominium_name: firstCondominium.name,
                is_admin: true,
              };
              console.log('✅ Usando primeiro condomínio:', firstCondominium.name);
              await AsyncStorage.setItem('resident', JSON.stringify(finalResidentData));
            }
          } catch (condError) {
            console.error('Erro ao buscar condomínios:', condError);
          }
        }
      }

      return { success: true, user: data, resident: finalResidentData, token };
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
