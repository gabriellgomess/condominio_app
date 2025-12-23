import api from './api';

export const reservationService = {
  // Buscar reservas do condomínio
  getReservations: async (condominiumId, filters = {}) => {
    try {
      const response = await api.get(`/condominiums/${condominiumId}/reservations`, {
        params: filters,
      });

      if (response.data?.status === 'success') {
        return {
          success: true,
          data: response.data.data || [],
        };
      }

      return { success: false, data: [] };
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erro ao buscar reservas',
      };
    }
  },

  // Buscar espaços reserváveis
  getReservableSpaces: async (condominiumId) => {
    try {
      const response = await api.get(`/condominiums/${condominiumId}/reservable-spaces`);

      if (response.data?.status === 'success' || response.data?.success) {
        return {
          success: true,
          data: response.data.data || [],
        };
      }

      return { success: false, data: [] };
    } catch (error) {
      console.error('Erro ao buscar espaços:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erro ao buscar espaços',
      };
    }
  },

  // Verificar disponibilidade de um espaço
  checkAvailability: async (spaceId, date) => {
    try {
      const response = await api.get(`/spaces/${spaceId}/availability`, {
        params: { date },
      });

      if (response.data?.status === 'success' || response.data?.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return { success: false, data: null };
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Erro ao verificar disponibilidade',
      };
    }
  },

  // Buscar configuração de disponibilidade
  getAvailabilityConfig: async (spaceId) => {
    try {
      const response = await api.get(`/spaces/${spaceId}/availability-config`);

      if (response.data?.status === 'success' || response.data?.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return { success: false, data: null };
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Erro ao buscar configuração',
      };
    }
  },

  // Criar uma reserva
  createReservation: async (reservationData) => {
    try {
      const response = await api.post('/reservations', reservationData);

      if (response.data?.status === 'success' || response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Reserva criada com sucesso',
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Erro ao criar reserva',
      };
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar reserva',
      };
    }
  },

  // Cancelar uma reserva
  cancelReservation: async (reservationId) => {
    try {
      const response = await api.delete(`/reservations/${reservationId}`);

      if (response.data?.status === 'success' || response.data?.success) {
        return {
          success: true,
          message: response.data.message || 'Reserva cancelada com sucesso',
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Erro ao cancelar reserva',
      };
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao cancelar reserva',
      };
    }
  },

  // Buscar minhas reservas
  getMyReservations: async (condominiumId, userId) => {
    try {
      const response = await api.get(`/condominiums/${condominiumId}/reservations`, {
        params: { user_id: userId },
      });

      if (response.data?.status === 'success') {
        return {
          success: true,
          data: response.data.data || [],
        };
      }

      return { success: false, data: [] };
    } catch (error) {
      console.error('Erro ao buscar minhas reservas:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erro ao buscar reservas',
      };
    }
  },
};

export default reservationService;



