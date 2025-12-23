import { api } from '../config/api';

const actionService = {
  // Listar todas as ações
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${api.endpoints.actions}${queryString ? '?' + queryString : ''}`;
    const response = await api.request(url);

    if (!response.ok) {
      throw new Error('Erro ao buscar ações');
    }

    return response.json();
  },

  // Buscar ação por ID
  getById: async (id) => {
    const response = await api.request(`${api.endpoints.actions}/${id}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar ação');
    }

    return response.json();
  },

  // Criar nova ação
  create: async (data) => {
    const response = await api.request(api.endpoints.actions, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar ação');
    }

    return response.json();
  },

  // Atualizar ação
  update: async (id, data) => {
    const response = await api.request(`${api.endpoints.actions}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar ação');
    }

    return response.json();
  },

  // Excluir ação
  delete: async (id) => {
    const response = await api.request(`${api.endpoints.actions}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir ação');
    }

    return response.json();
  },

  // Listar ações atrasadas
  getOverdue: async () => {
    const response = await api.request(`${api.endpoints.actions}/overdue/list`);

    if (!response.ok) {
      throw new Error('Erro ao buscar ações atrasadas');
    }

    return response.json();
  },

  // Obter estatísticas
  getStatistics: async () => {
    const response = await api.request(`${api.endpoints.actions}/statistics/data`);

    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }

    return response.json();
  }
};

export default actionService;
