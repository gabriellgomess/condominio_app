import api from './api';

export const announcementService = {
  // Buscar comunicados do condomínio
  getAnnouncements: async (condominiumId, filters = {}) => {
    try {
      const params = {
        condominium_id: condominiumId,
        status: 'published',
        ...filters,
      };

      const response = await api.get('/announcements', { params });
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data?.data || response.data.data || [],
        };
      }
      
      return { success: false, data: [] };
    } catch (error) {
      console.error('Erro ao buscar comunicados:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erro ao buscar comunicados',
      };
    }
  },

  // Buscar um comunicado específico
  getAnnouncement: async (id) => {
    try {
      const response = await api.get(`/announcements/${id}`);
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      
      return { success: false, data: null };
    } catch (error) {
      console.error('Erro ao buscar comunicado:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Erro ao buscar comunicado',
      };
    }
  },
};

export default announcementService;



