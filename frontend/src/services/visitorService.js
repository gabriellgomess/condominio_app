import api from './api';

// Lista todos os visitantes de um condomínio com filtros opcionais
export const listVisitors = (condominiumId, params = {}) => {
  return api.get(`/condominiums/${condominiumId}/visitors`, params);
};

// Busca um visitante específico
export const getVisitor = (id) => {
  return api.get(`/visitors/${id}`);
};

// Cria um novo visitante
export const createVisitor = (condominiumId, data) => {
  return api.post(`/condominiums/${condominiumId}/visitors`, data);
};

// Atualiza um visitante
export const updateVisitor = (id, data) => {
  return api.put(`/visitors/${id}`, data);
};

// Remove um visitante
export const deleteVisitor = (id) => {
  return api.delete(`/visitors/${id}`);
};

// Valida um visitante (aprovar ou rejeitar)
export const validateVisitor = (id, action, notes = null) => {
  return api.post(`/visitors/${id}/validate`, {
    action, // 'approve' ou 'reject'
    notes
  });
};

// Registra check-in de um visitante
export const checkInVisitor = (id) => {
  return api.post(`/visitors/${id}/check-in`);
};

// Registra check-out de um visitante
export const checkOutVisitor = (id) => {
  return api.post(`/visitors/${id}/check-out`);
};

// Obtém estatísticas de visitantes
export const getVisitorStats = (condominiumId) => {
  return api.get(`/condominiums/${condominiumId}/visitors-stats`);
};

export default {
  listVisitors,
  getVisitor,
  createVisitor,
  updateVisitor,
  deleteVisitor,
  validateVisitor,
  checkInVisitor,
  checkOutVisitor,
  getVisitorStats
};
