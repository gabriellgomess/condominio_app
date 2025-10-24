import api from './api';

// Lista todas as entregas com filtros opcionais
export const listDeliveries = (params = {}) => {
  return api.get('/deliveries', { params });
};

// Registra uma nova entrega
export const createDelivery = (data) => {
  return api.post('/deliveries', data);
};

// Busca uma entrega específica
export const getDelivery = (id) => {
  return api.get(`/deliveries/${id}`);
};

// Busca entrega por código
export const findByCode = (code) => {
  return api.post('/deliveries/find-by-code', { code });
};

// Registra a retirada de uma entrega
export const collectDelivery = (id, deliveryCode, notes = null) => {
  return api.post(`/deliveries/${id}/collect`, {
    delivery_code: deliveryCode,
    notes
  });
};

// Atualiza uma entrega
export const updateDelivery = (id, data) => {
  return api.put(`/deliveries/${id}`, data);
};

// Remove uma entrega
export const deleteDelivery = (id) => {
  return api.delete(`/deliveries/${id}`);
};

// Obtém estatísticas de entregas
export const getDeliveryStats = () => {
  return api.get('/deliveries-stats');
};

export default {
  listDeliveries,
  createDelivery,
  getDelivery,
  findByCode,
  collectDelivery,
  updateDelivery,
  deleteDelivery,
  getDeliveryStats
};
