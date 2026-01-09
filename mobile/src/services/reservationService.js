import api from './api';

const reservationService = {
  // Buscar todas as reservas de um condomínio
  getReservations: async (condominiumId) => {
    try {
      const response = await api.get(`/condominiums/${condominiumId}/reservations`);

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
      console.error('Erro ao buscar reservas:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // Criar nova reserva
  createReservation: async (condominiumId, reservationData) => {
    try {
      const response = await api.post(`/condominiums/${condominiumId}/reservations`, reservationData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Cancelar reserva
  cancelReservation: async (reservationId) => {
    try {
      const response = await api.post(`/reservations/${reservationId}/cancel`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Buscar espaços reserváveis
  getReservableSpaces: async (condominiumId) => {
    try {
      const response = await api.get(`/condominiums/${condominiumId}/reservable-spaces`);

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
      console.error('Erro ao buscar espaços:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }
};

export default reservationService;
