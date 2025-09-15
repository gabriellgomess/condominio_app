import { api } from './api.js';

// Serviços para Condomínios
export const condominiumService = {
  // Listar condomínios com filtros e paginação
  getAll: (params = {}) => {
    return api.get('/condominiums', params);
  },

  // Obter condomínio por ID
  getById: (id) => {
    return api.get(`/condominiums/${id}`);
  },

  // Criar novo condomínio
  create: (data) => {
    return api.post('/condominiums', data);
  },

  // Atualizar condomínio
  update: (id, data) => {
    return api.put(`/condominiums/${id}`, data);
  },

  // Excluir condomínio
  delete: (id) => {
    return api.delete(`/condominiums/${id}`);
  },

  // Obter estatísticas do condomínio
  getStats: (id) => {
    return api.get(`/condominiums/${id}/stats`);
  },
};

// Serviços para Blocos/Torres
export const blockService = {
  // Listar blocos de um condomínio
  getByCondominium: (condominiumId, params = {}) => {
    return api.get(`/condominiums/${condominiumId}/blocks`, params);
  },

  // Obter bloco por ID
  getById: (id) => {
    return api.get(`/blocks/${id}`);
  },

  // Criar novo bloco
  create: (condominiumId, data) => {
    return api.post(`/condominiums/${condominiumId}/blocks`, {
      ...data,
      condominium_id: condominiumId,
    });
  },

  // Atualizar bloco
  update: (id, data) => {
    return api.put(`/blocks/${id}`, data);
  },

  // Excluir bloco
  delete: (id) => {
    return api.delete(`/blocks/${id}`);
  },

  // Obter estatísticas do bloco
  getStats: (condominiumId) => {
    return api.get(`/condominiums/${condominiumId}/blocks/stats`);
  },
};

// Serviços para Unidades
export const unitService = {
  // Listar unidades de um condomínio
  getByCondominium: (condominiumId, params = {}) => {
    return api.get(`/condominiums/${condominiumId}/units`, params);
  },

  // Listar unidades de um bloco
  getByBlock: (blockId, params = {}) => {
    return api.get(`/blocks/${blockId}/units`, params);
  },

  // Obter unidade por ID
  getById: (id) => {
    return api.get(`/units/${id}`);
  },

  // Criar nova unidade
  create: (condominiumId, data) => {
    return api.post(`/condominiums/${condominiumId}/units`, {
      ...data,
      condominium_id: condominiumId,
    });
  },

  // Atualizar unidade
  update: (id, data) => {
    return api.put(`/units/${id}`, data);
  },

  // Excluir unidade
  delete: (id) => {
    return api.delete(`/units/${id}`);
  },

  // Obter histórico de ocupação
  getOccupancyHistory: (id) => {
    return api.get(`/units/${id}/occupancy-history`);
  },
};

// Serviços para Vagas de Garagem
export const parkingService = {
  // Listar vagas de um condomínio
  getByCondominium: (condominiumId, params = {}) => {
    return api.get(`/condominiums/${condominiumId}/parking-spaces`, params);
  },

  // Obter vaga por ID
  getById: (id) => {
    return api.get(`/parking-spaces/${id}`);
  },

  // Criar nova vaga
  create: (condominiumId, data) => {
    return api.post(`/condominiums/${condominiumId}/parking-spaces`, {
      ...data,
      condominium_id: condominiumId,
    });
  },

  // Atualizar vaga
  update: (id, data) => {
    return api.put(`/parking-spaces/${id}`, data);
  },

  // Excluir vaga
  delete: (id) => {
    return api.delete(`/parking-spaces/${id}`);
  },

  // Vincular vaga a uma unidade
  linkToUnit: (id, unitId) => {
    return api.put(`/parking-spaces/${id}/link`, { unit_id: unitId });
  },

  // Desvincular vaga de uma unidade
  unlinkFromUnit: (id) => {
    return api.put(`/parking-spaces/${id}/unlink`);
  },

  // Obter estatísticas das vagas de garagem
  getStats: (condominiumId) => {
    return api.get(`/condominiums/${condominiumId}/parking-spaces/stats`);
  },
};

// Serviços para Espaços
export const spaceService = {
  // Listar espaços de um condomínio
  getByCondominium: (condominiumId, params = {}) => {
    return api.get(`/condominiums/${condominiumId}/spaces`, params);
  },

  // Obter espaço por ID
  getById: (id) => {
    return api.get(`/spaces/${id}`);
  },

  // Criar novo espaço
  create: (condominiumId, data) => {
    return api.post(`/condominiums/${condominiumId}/spaces`, {
      ...data,
      condominium_id: condominiumId,
    });
  },

  // Atualizar espaço
  update: (id, data) => {
    return api.put(`/spaces/${id}`, data);
  },

  // Excluir espaço
  delete: (id) => {
    return api.delete(`/spaces/${id}`);
  },

  // Vincular espaço a uma unidade
  linkToUnit: (id, unitId) => {
    return api.put(`/spaces/${id}/link`, { unit_id: unitId });
  },

  // Desvincular espaço de uma unidade
  unlinkFromUnit: (id) => {
    return api.put(`/spaces/${id}/unlink`);
  },

  // Obter estatísticas dos espaços
  getStats: (condominiumId) => {
    return api.get(`/condominiums/${condominiumId}/spaces/stats`);
  },

  // Obter tipos de espaço
  getTypes: () => {
    return api.get('/spaces/types');
  },
};

// Serviço combinado para estrutura completa
export const structureService = {
  // Obter estrutura completa de todos os condomínios (nova API unificada)
  getCompleteStructure: async () => {
    try {
      return await api.get('/structure/complete');
    } catch (error) {
      console.error('Erro ao carregar estrutura completa:', error);
      throw error;
    }
  },

  // Obter estrutura completa de um condomínio específico (mantido para compatibilidade)
  getCondominiumStructure: async (condominiumId) => {
    try {
      const [condominium, blocks, units, parkingSpaces, storageUnits] = await Promise.all([
        condominiumService.getById(condominiumId),
        blockService.getByCondominium(condominiumId),
        unitService.getByCondominium(condominiumId),
        parkingService.getByCondominium(condominiumId),
        storageService.getByCondominium(condominiumId),
      ]);

      return {
        condominium: condominium.data,
        blocks: blocks.data || [],
        units: units.data || [],
        parkingSpaces: parkingSpaces.data || [],
        storageUnits: storageUnits.data || [],
      };
    } catch (error) {
      console.error('Erro ao carregar estrutura do condomínio:', error);
      throw error;
    }
  },

  // Validar estrutura antes de operações
  validateStructure: (data) => {
    const errors = [];

    // Validações básicas
    if (!data.name || data.name.trim() === '') {
      errors.push('Nome é obrigatório');
    }

    if (!data.address || data.address.trim() === '') {
      errors.push('Endereço é obrigatório');
    }

    if (!data.city || data.city.trim() === '') {
      errors.push('Cidade é obrigatória');
    }

    if (!data.state || data.state.trim() === '') {
      errors.push('Estado é obrigatório');
    }

    if (!data.zip_code || data.zip_code.trim() === '') {
      errors.push('CEP é obrigatório');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export default {
  condominium: condominiumService,
  block: blockService,
  unit: unitService,
  parking: parkingService,
  space: spaceService,
  structure: structureService,
};