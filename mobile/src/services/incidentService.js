import api from './api';

export const incidentService = {
  // Listar ocorrências do morador logado
  getMyIncidents: async (page = 1, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        per_page: 15,
        ...filters,
      });

      const response = await api.get(`/my-incidents?${params}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar ocorrências:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar ocorrências',
      };
    }
  },

  // Listar ocorrências (admin - mantido para compatibilidade)
  getIncidents: async (condominiumId = null, page = 1, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        per_page: 15,
        ...filters,
      });

      const endpoint = condominiumId
        ? `/condominiums/${condominiumId}/incidents?${params}`
        : `/incidents?${params}`;

      const response = await api.get(endpoint);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao buscar ocorrências:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar ocorrências',
      };
    }
  },

  // Obter estatísticas de ocorrências do morador logado
  getMyStats: async () => {
    try {
      const response = await api.get('/my-incidents-stats');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas',
      };
    }
  },

  // Obter estatísticas de ocorrências (admin)
  getStats: async () => {
    try {
      const response = await api.get('/incidents-stats');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar estatísticas',
      };
    }
  },

  // Criar nova ocorrência
  createIncident: async (formData) => {
    try {
      console.log('Criando ocorrência...');

      const response = await api.post('/incidents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Ocorrência criada:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);
      console.error('Resposta do erro:', error.response?.data);

      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar ocorrência',
        errors: error.response?.data?.errors,
      };
    }
  },

  // Obter detalhes de uma ocorrência
  getIncident: async (id) => {
    try {
      const response = await api.get(`/incidents/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Erro ao buscar ocorrência:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar ocorrência',
      };
    }
  },

  // Atualizar ocorrência
  updateIncident: async (id, formData) => {
    try {
      // Adicionar _method para Laravel aceitar PUT com FormData
      formData.append('_method', 'PUT');

      const response = await api.post(`/incidents/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar ocorrência:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar ocorrência',
        errors: error.response?.data?.errors,
      };
    }
  },

  // Deletar ocorrência
  deleteIncident: async (id) => {
    try {
      await api.delete(`/incidents/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar ocorrência:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao deletar ocorrência',
      };
    }
  },

  // Obter tipos de ocorrências
  getTypes: () => {
    return {
      manutencao: 'Manutenção',
      seguranca: 'Segurança',
      ruido: 'Ruído/Barulho',
      limpeza: 'Limpeza',
      vizinhanca: 'Vizinhança',
      outros: 'Outros',
    };
  },

  // Obter prioridades
  getPriorities: () => {
    return {
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta',
      urgente: 'Urgente',
    };
  },

  // Obter status
  getStatuses: () => {
    return {
      aberta: 'Aberta',
      em_andamento: 'Em Andamento',
      resolvida: 'Resolvida',
      fechada: 'Fechada',
    };
  },
};
