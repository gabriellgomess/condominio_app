import api from './api';

const contractService = {
  // Buscar todos os contratos
  getAll: async () => {
    try {
      const response = await api.get('/administrative/contracts');
      return response;
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw error;
    }
  },

  // Buscar um contrato específico
  getById: async (id) => {
    try {
      const response = await api.get(`/administrative/contracts/${id}`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar contrato ${id}:`, error);
      throw error;
    }
  },

  // Criar novo contrato
  create: async (contractData) => {
    try {
      const response = await api.post('/administrative/contracts', contractData);
      return response;
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      throw error;
    }
  },

  // Atualizar contrato
  update: async (id, contractData) => {
    try {
      const response = await api.put(`/administrative/contracts/${id}`, contractData);
      return response;
    } catch (error) {
      console.error(`Erro ao atualizar contrato ${id}:`, error);
      throw error;
    }
  },

  // Deletar contrato
  delete: async (id) => {
    try {
      const response = await api.delete(`/administrative/contracts/${id}`);
      return response;
    } catch (error) {
      console.error(`Erro ao deletar contrato ${id}:`, error);
      throw error;
    }
  }
};

export default contractService;
