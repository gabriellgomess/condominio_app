/**
 * Serviço para gerenciamento de cache dos dados estruturais
 * Centraliza o armazenamento e recuperação de dados do localStorage
 */

const CACHE_KEYS = {
  CONDOMINIUMS: 'condominiums',
  BLOCKS: 'blocks', 
  UNITS: 'units',
  PARKING_SPACES: 'parkingSpaces',
  SPACES: 'spaces',
  LAST_UPDATE: 'structure_last_update'
};

const CACHE_EXPIRY_HOURS = 1; // Cache expira em 1 hora

class CacheService {
  /**
   * Verifica se o cache está válido (não expirado)
   */
  isCacheValid() {
    const lastUpdate = localStorage.getItem(CACHE_KEYS.LAST_UPDATE);
    if (!lastUpdate) return false;
    
    const lastUpdateDate = new Date(lastUpdate);
    const now = new Date();
    const diffHours = (now - lastUpdateDate) / (1000 * 60 * 60);
    
    return diffHours < CACHE_EXPIRY_HOURS;
  }

  /**
   * Verifica se existem dados em cache
   */
  hasStoredData() {
    return !!(
      localStorage.getItem(CACHE_KEYS.CONDOMINIUMS) &&
      localStorage.getItem(CACHE_KEYS.BLOCKS) &&
      localStorage.getItem(CACHE_KEYS.UNITS) &&
      localStorage.getItem(CACHE_KEYS.PARKING_SPACES) &&
      localStorage.getItem(CACHE_KEYS.SPACES)
    );
  }

  /**
   * Recupera todos os dados estruturais do cache
   */
  getStoredStructureData() {
    try {
      return {
        condominiums: JSON.parse(localStorage.getItem(CACHE_KEYS.CONDOMINIUMS) || '[]'),
        blocks: JSON.parse(localStorage.getItem(CACHE_KEYS.BLOCKS) || '[]'),
        units: JSON.parse(localStorage.getItem(CACHE_KEYS.UNITS) || '[]'),
        parkingSpaces: JSON.parse(localStorage.getItem(CACHE_KEYS.PARKING_SPACES) || '[]'),
        spaces: JSON.parse(localStorage.getItem(CACHE_KEYS.SPACES) || '[]'),
        lastUpdate: localStorage.getItem(CACHE_KEYS.LAST_UPDATE)
      };
    } catch (error) {
      console.error('Erro ao recuperar dados do cache:', error);
      return null;
    }
  }

  /**
   * Armazena todos os dados estruturais no cache
   */
  storeStructureData(structureData) {
    try {
      localStorage.setItem(CACHE_KEYS.CONDOMINIUMS, JSON.stringify(structureData.condominiums || []));
      localStorage.setItem(CACHE_KEYS.BLOCKS, JSON.stringify(structureData.blocks || []));
      localStorage.setItem(CACHE_KEYS.UNITS, JSON.stringify(structureData.units || []));
      localStorage.setItem(CACHE_KEYS.PARKING_SPACES, JSON.stringify(structureData.parking_spaces || []));
      localStorage.setItem(CACHE_KEYS.SPACES, JSON.stringify(structureData.spaces || []));
      localStorage.setItem(CACHE_KEYS.LAST_UPDATE, new Date().toISOString());
      
      console.log('Dados estruturais armazenados no cache com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao armazenar dados no cache:', error);
      return false;
    }
  }

  /**
   * Limpa todo o cache de dados estruturais
   */
  clearCache() {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('Cache de dados estruturais limpo');
  }

  /**
   * Atualiza dados de um condomínio específico no cache
   */
  updateCondominiumData(condominiumId, newData) {
    try {
      const currentData = this.getStoredStructureData();
      if (!currentData) return false;

      // Atualizar dados específicos do condomínio
      if (newData.blocks) {
        const updatedBlocks = [
          ...currentData.blocks.filter(block => block.condominium_id !== condominiumId),
          ...newData.blocks
        ];
        localStorage.setItem(CACHE_KEYS.BLOCKS, JSON.stringify(updatedBlocks));
      }

      if (newData.units) {
        const updatedUnits = [
          ...currentData.units.filter(unit => unit.condominium_id !== condominiumId),
          ...newData.units
        ];
        localStorage.setItem(CACHE_KEYS.UNITS, JSON.stringify(updatedUnits));
      }

      if (newData.parkingSpaces) {
        const updatedParkingSpaces = [
          ...currentData.parkingSpaces.filter(parking => parking.condominium_id !== condominiumId),
          ...newData.parkingSpaces
        ];
        localStorage.setItem(CACHE_KEYS.PARKING_SPACES, JSON.stringify(updatedParkingSpaces));
      }

      if (newData.spaces) {
        const updatedSpaces = [
          ...currentData.spaces.filter(space => space.condominium_id !== condominiumId),
          ...newData.spaces
        ];
        localStorage.setItem(CACHE_KEYS.SPACES, JSON.stringify(updatedSpaces));
      }

      localStorage.setItem(CACHE_KEYS.LAST_UPDATE, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Erro ao atualizar dados do condomínio no cache:', error);
      return false;
    }
  }
}

export default new CacheService();
