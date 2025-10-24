// Configuração centralizada de ambiente
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Sistema Condomínio',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Development
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || false,
  
  // URLs específicas
  getContractUrl: (supplierId) => `${this.API_BASE_URL}/suppliers/${supplierId}/contract`,
  getDownloadUrl: (path) => `${this.API_BASE_URL}${path}`,
};

export default config;
