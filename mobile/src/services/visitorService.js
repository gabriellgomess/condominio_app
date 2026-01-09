import api from './api';

export const visitorService = {
  // Buscar visitantes do condomínio
  getVisitors: async (condominiumId, filters = {}) => {
    try {
      const response = await api.get(`/condominiums/${condominiumId}/visitors`, {
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
      console.error('Erro ao buscar visitantes:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erro ao buscar visitantes',
      };
    }
  },

  // Buscar um visitante específico
  getVisitor: async (visitorId) => {
    try {
      const response = await api.get(`/visitors/${visitorId}`);

      if (response.data?.status === 'success') {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return { success: false, data: null };
    } catch (error) {
      console.error('Erro ao buscar visitante:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Erro ao buscar visitante',
      };
    }
  },

  // Cadastrar novo visitante
  createVisitor: async (condominiumId, visitorData) => {
    try {
      console.log('📤 Criando visitante:', visitorData);
      const response = await api.post(`/condominiums/${condominiumId}/visitors`, visitorData);
      console.log('📥 Resposta da API:', response.data);

      if (response.data?.status === 'success') {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Visitante cadastrado com sucesso',
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Erro ao cadastrar visitante',
      };
    } catch (error) {
      console.error('❌ Erro ao cadastrar visitante:', error);
      console.error('❌ Resposta de erro:', error.response?.data);

      // Tratamento para erros de validação (422)
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors || {};
        const firstError = Object.values(errors)[0]?.[0] || 'Dados inválidos';
        return {
          success: false,
          error: error.response.data?.message || firstError,
          errors: errors,
        };
      }

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro ao cadastrar visitante',
      };
    }
  },

  // Atualizar visitante
  updateVisitor: async (visitorId, visitorData) => {
    try {
      const response = await api.put(`/visitors/${visitorId}`, visitorData);

      if (response.data?.status === 'success') {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Visitante atualizado com sucesso',
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Erro ao atualizar visitante',
      };
    } catch (error) {
      console.error('Erro ao atualizar visitante:', error);

      if (error.response?.status === 422) {
        const errors = error.response.data?.errors || {};
        const firstError = Object.values(errors)[0]?.[0] || 'Dados inválidos';
        return {
          success: false,
          error: error.response.data?.message || firstError,
          errors: errors,
        };
      }

      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar visitante',
      };
    }
  },

  // Deletar visitante
  deleteVisitor: async (visitorId) => {
    try {
      const response = await api.delete(`/visitors/${visitorId}`);

      if (response.data?.status === 'success') {
        return {
          success: true,
          message: response.data.message || 'Visitante excluído com sucesso',
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Erro ao excluir visitante',
      };
    } catch (error) {
      console.error('Erro ao excluir visitante:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir visitante',
      };
    }
  },

  // Validar visitante (síndico/admin)
  validateVisitor: async (visitorId, action, notes = null) => {
    try {
      const response = await api.post(`/visitors/${visitorId}/validate`, {
        action, // 'approve' ou 'reject'
        notes,
      });

      if (response.data?.status === 'success') {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Erro ao validar visitante',
      };
    } catch (error) {
      console.error('Erro ao validar visitante:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao validar visitante',
      };
    }
  },

  // Check-in (portaria)
  checkIn: async (visitorId) => {
    try {
      const response = await api.post(`/visitors/${visitorId}/check-in`);

      if (response.data?.status === 'success') {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Check-in realizado com sucesso',
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Erro ao realizar check-in',
      };
    } catch (error) {
      console.error('Erro ao realizar check-in:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao realizar check-in',
      };
    }
  },

  // Check-out (portaria)
  checkOut: async (visitorId) => {
    try {
      const response = await api.post(`/visitors/${visitorId}/check-out`);

      if (response.data?.status === 'success') {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Check-out realizado com sucesso',
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Erro ao realizar check-out',
      };
    } catch (error) {
      console.error('Erro ao realizar check-out:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao realizar check-out',
      };
    }
  },

  // Helper: Converter imagem para base64
  imageToBase64: async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erro ao converter imagem para base64:', error);
      throw error;
    }
  },
};

export default visitorService;
