import { api } from '../config/api';

const controlService = {
  // Listar todos os controles
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${api.endpoints.controls}${queryString ? '?' + queryString : ''}`;
    const response = await api.request(url);

    if (!response.ok) {
      throw new Error('Erro ao buscar controles');
    }

    return response.json();
  },

  // Buscar controle por ID
  getById: async (id) => {
    const response = await api.request(`${api.endpoints.controls}/${id}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar controle');
    }

    return response.json();
  },

  // Criar novo controle
  create: async (data) => {
    const response = await api.request(api.endpoints.controls, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar controle');
    }

    return response.json();
  },

  // Atualizar controle
  update: async (id, data) => {
    const response = await api.request(`${api.endpoints.controls}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar controle');
    }

    return response.json();
  },

  // Excluir controle
  delete: async (id) => {
    const response = await api.request(`${api.endpoints.controls}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir controle');
    }

    return response.json();
  },

  // Listar controles próximos do vencimento
  getExpiring: async (days = 30) => {
    const response = await api.request(`${api.endpoints.controls}/expiring/list?days=${days}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar controles próximos do vencimento');
    }

    return response.json();
  },

  // Listar controles vencidos
  getExpired: async () => {
    const response = await api.request(`${api.endpoints.controls}/expired/list`);

    if (!response.ok) {
      throw new Error('Erro ao buscar controles vencidos');
    }

    return response.json();
  }
};

export default controlService;
