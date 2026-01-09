import api from './api';

const announcementService = {
  // Buscar todos os anúncios/comunicados de um condomínio
  getAnnouncements: async (condominiumId) => {
    try {
      const response = await api.get(`/condominiums/${condominiumId}/announcements`);

      // Se response.data for string (HTML + JSON), tentar extrair o JSON
      let data = response.data;
      if (typeof data === 'string') {
        // Tentar encontrar o JSON dentro da string
        const jsonMatch = data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        }
      }

      return {
        success: true,
        data: data?.data || data || []
      };
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // Buscar um anúncio específico
  getAnnouncement: async (announcementId) => {
    try {
      const response = await api.get(`/announcements/${announcementId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao buscar anúncio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Marcar anúncio como lido
  markAsRead: async (announcementId) => {
    try {
      const response = await api.post(`/announcements/${announcementId}/read`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao marcar anúncio como lido:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default announcementService;
