import api from './api';

export const condominiumService = {
  // Buscar todos os condomínios
  getCondominiums: async () => {
    try {
      const response = await api.get('/condominiums');

      if (response.data?.status === 'success' || response.data?.data) {
        return {
          success: true,
          data: response.data.data || [],
        };
      }

      return { success: false, data: [] };
    } catch (error) {
      console.error('Erro ao buscar condomínios:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erro ao buscar condomínios',
      };
    }
  },

  // Buscar um condomínio específico
  getCondominium: async (id) => {
    try {
      const response = await api.get(`/condominiums/${id}`);

      if (response.data?.status === 'success' || response.data?.data) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return { success: false, data: null };
    } catch (error) {
      console.error('Erro ao buscar condomínio:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Erro ao buscar condomínio',
      };
    }
  },
};

export default condominiumService;



