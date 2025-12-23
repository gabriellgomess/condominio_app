import api from './api';

// Serviços para Configurações de Reserva
export const reservationConfigService = {
  // Listar configurações de reserva de um condomínio
  getByCondominium: (condominiumId, params = {}) => {
    return api.get(`/condominiums/${condominiumId}/reservation-configs`, params);
  },

  // Obter configuração por ID
  getById: (id) => {
    return api.get(`/reservation-configs/${id}`);
  },

  // Criar nova configuração
  create: (condominiumId, data) => {
    return api.post(`/condominiums/${condominiumId}/reservation-configs`, {
      ...data,
      condominium_id: condominiumId,
    });
  },

  // Atualizar configuração
  update: (id, data) => {
    return api.put(`/reservation-configs/${id}`, data);
  },

  // Excluir configuração
  delete: (id) => {
    return api.delete(`/reservation-configs/${id}`);
  },

  // Obter espaços reserváveis de um condomínio
  getReservableSpaces: (condominiumId) => {
    console.log('🔧 reservationService - getReservableSpaces chamado com condominiumId:', condominiumId);
    return api.get(`/condominiums/${condominiumId}/reservable-spaces`);
  },
};

// Serviços para Reservas
export const reservationService = {
  // Listar reservas de um condomínio
  getByCondominium: (condominiumId, params = {}) => {
    return api.get(`/condominiums/${condominiumId}/reservations`, params);
  },

  // Obter reserva por ID
  getById: (id) => {
    return api.get(`/reservations/${id}`);
  },

  // Criar nova reserva
  create: async (data) => {
    console.log('🎯 reservationService - Criando reserva:', data);
    try {
      const response = await api.post('/reservations', data);
      console.log('✅ reservationService - Reserva criada com sucesso:', response);
      return response;
    } catch (error) {
      console.error('❌ reservationService - Erro ao criar reserva:', error);
      console.error('❌ reservationService - Status:', error.response?.status);
      console.error('❌ reservationService - Data:', error.response?.data);
      throw error;
    }
  },

  // Atualizar reserva
  update: (id, data) => {
    return api.put(`/reservations/${id}`, data);
  },

  // Cancelar reserva
  cancel: (id) => {
    return api.delete(`/reservations/${id}`);
  },

  // Confirmar reserva (admin)
  confirm: (id) => {
    return api.put(`/reservations/${id}/confirm`);
  },

  // Obter disponibilidade de um espaço
  getAvailability: (spaceId, date) => {
    console.log('🔍 reservationService - Verificando disponibilidade:', spaceId, date);
    return api.get(`/spaces/${spaceId}/availability`, { date });
  },

  // Obter espaços configurados para reserva (com configuração ativa)
  getConfiguredSpaces: async (condominiumId) => {
    console.log('🔧 reservationService.getConfiguredSpaces - condominiumId:', condominiumId);
    try {
      const response = await api.get(`/condominiums/${condominiumId}/reservation-configs`, { active_only: true });
      console.log('🔧 reservationService.getConfiguredSpaces - resposta completa:', response);
      console.log('🔧 reservationService.getConfiguredSpaces - data:', response?.data);
      console.log('🔧 reservationService.getConfiguredSpaces - quantidade:', response?.data?.length || 0);
      return response;
    } catch (error) {
      console.error('❌ reservationService.getConfiguredSpaces - Erro:', error);
      throw error;
    }
  },

  // Obter configuração de disponibilidade de um espaço
  getAvailabilityConfig: (spaceId) => {
    return api.get(`/spaces/${spaceId}/availability-config`);
  },
};

// Serviço combinado para reservas
export const reservationManagementService = {
  // Configurações
  config: reservationConfigService,
  
  // Reservas
  reservation: reservationService,
};

export default reservationManagementService;
