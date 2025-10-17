// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const api = {
  baseURL: API_BASE_URL,

  // Helper function to make API calls
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    return response;
  },

  // API endpoints
  endpoints: {
    // Auth
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',

    // Condominiums
    condominiums: '/api/condominiums',

    // Incidents
    incidents: '/api/incidents',
    incidentStats: '/api/incidents-stats',
    incidentStatsByCondominium: (condominiumId) => `/api/condominiums/${condominiumId}/incidents/stats`,
    incidentTypes: '/api/incident-types',
    incidentPriorities: '/api/incident-priorities',
    incidentStatuses: '/api/incident-statuses',

    // Blocks
    condominiumBlocks: (condominiumId) => `/api/condominiums/${condominiumId}/blocks`,

    // Units
    condominiumUnits: (condominiumId) => `/api/condominiums/${condominiumId}/units`,

    // Residents
    condominiumResidents: (condominiumId) => `/api/condominiums/${condominiumId}/residents`,

    // Announcements
    announcements: '/api/announcements',

    // Spaces
    spaces: '/api/spaces',

    // Reservations
    reservations: '/api/reservations',

    // Suppliers
    suppliers: '/api/suppliers',
  }
};

export default api;