import config from './environment.js';

// API Configuration
const API_BASE_URL = config.API_BASE_URL;

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
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',

    // Condominiums
    condominiums: '/condominiums',

    // Incidents
    incidents: '/incidents',
    incidentStats: '/incidents-stats',
    incidentStatsByCondominium: (condominiumId) => `/condominiums/${condominiumId}/incidents/stats`,
    incidentTypes: '/incident-types',
    incidentPriorities: '/incident-priorities',
    incidentStatuses: '/incident-statuses',

    // Blocks
    condominiumBlocks: (condominiumId) => `/condominiums/${condominiumId}/blocks`,

    // Units
    condominiumUnits: (condominiumId) => `/condominiums/${condominiumId}/units`,

    // Residents
    condominiumResidents: (condominiumId) => `/condominiums/${condominiumId}/residents`,

    // Announcements
    announcements: '/announcements',

    // Spaces
    spaces: '/spaces',

    // Reservations
    reservations: '/reservations',

    // Suppliers
    suppliers: '/suppliers',

    // Administrative - Contracts
    contracts: '/administrative/contracts',

    // Administrative - Controls
    controls: '/administrative/controls',

    // Administrative - Actions
    actions: '/administrative/actions',
  }
};

export default api;