// Configuração base da API
const API_BASE_URL = 'http://localhost:8000/api';

// Função para obter o token de autenticação
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Configuração padrão para requisições
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Função para fazer requisições HTTP
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      ...defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Clonar a resposta para poder tentar diferentes métodos de parse
    const responseClone = response.clone();
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Se não conseguir fazer parse do JSON, usar o texto da resposta clonada
      try {
        const text = await responseClone.text();
        data = { message: text };
      } catch (textError) {
        data = { message: `Erro ao processar resposta: ${textError.message}` };
      }
    }
    
    if (!response.ok) {
      throw new Error(data.message || `Erro HTTP: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Erro na requisição API:', error);
    throw error;
  }
};

// Métodos HTTP específicos
export const api = {
  get: (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiRequest(url, { method: 'GET' });
  },

  post: (endpoint, data = {}) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: (endpoint, data = {}) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (endpoint) => {
    return apiRequest(endpoint, { method: 'DELETE' });
  },
};

// Serviços de autenticação
export const authService = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/profile'),
  getRedirectInfo: () => api.get('/redirect-info'),
};

// Serviços de moradores (proprietários + inquilinos)
export const residentService = {
  // Listar moradores
  getAll: (params = {}) => api.get('/residents', params),
  
  // Listar moradores por condomínio
  getByCondominium: (condominiumId, params = {}) => 
    api.get(`/condominiums/${condominiumId}/residents`, params),
  
  // Obter morador específico
  getById: (id) => api.get(`/residents/${id}`),
  
  // Criar novo morador
  create: (residentData) => api.post('/residents', residentData),
  
  // Atualizar morador
  update: (id, residentData) => api.put(`/residents/${id}`, residentData),
  
  // Excluir morador
  delete: (id) => api.delete(`/residents/${id}`),
  
  // Estatísticas de moradores por condomínio
  getStats: (condominiumId) => api.get(`/condominiums/${condominiumId}/residents/stats`)
};

export default api;