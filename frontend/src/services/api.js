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
    
    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Erro HTTP: ${response.status}`);
      }
      
      return data;
    } else {
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      return response;
    }
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

export default api;