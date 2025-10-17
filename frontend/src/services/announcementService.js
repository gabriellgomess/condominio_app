import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

const announcementService = {
  // Listar comunicados
  async getAnnouncements(params = {}) {
    try {
      const response = await api.get('/announcements', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Buscar comunicado por ID
  async getAnnouncement(id) {
    try {
      const response = await api.get(`/announcements/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Criar comunicado
  async createAnnouncement(data) {
    try {
      const response = await api.post('/announcements', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar comunicado
  async updateAnnouncement(id, data) {
    try {
      const response = await api.put(`/announcements/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Excluir comunicado
  async deleteAnnouncement(id) {
    try {
      const response = await api.delete(`/announcements/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Publicar comunicado
  async publishAnnouncement(id) {
    try {
      const response = await api.post(`/announcements/${id}/publish`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Despublicar comunicado
  async unpublishAnnouncement(id) {
    try {
      const response = await api.post(`/announcements/${id}/unpublish`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Arquivar comunicado
  async archiveAnnouncement(id) {
    try {
      const response = await api.post(`/announcements/${id}/archive`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obter estatísticas
  async getStats(condominiumId = null) {
    try {
      const params = condominiumId ? { condominium_id: condominiumId } : {};
      const response = await api.get('/announcements-stats', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Listar comunicados por condomínio
  async getAnnouncementsByCondominium(condominiumId, params = {}) {
    try {
      const response = await api.get(`/condominiums/${condominiumId}/announcements`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default announcementService;