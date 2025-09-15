import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import structureService from '../services/structureService';
import cacheService from '../services/cacheService';

const StructureContext = createContext();

export const useStructure = () => {
  const context = useContext(StructureContext);
  if (!context) {
    throw new Error('useStructure deve ser usado dentro de um StructureProvider');
  }
  return context;
};

export const StructureProvider = ({ children }) => {
  // Inicializar estados com dados do localStorage se disponíveis
  const [condominiums, setCondominiums] = useState(() => {
    const stored = localStorage.getItem('condominiums');
    return stored ? JSON.parse(stored) : [];
  });
  const [blocks, setBlocks] = useState(() => {
    const stored = localStorage.getItem('blocks');
    return stored ? JSON.parse(stored) : [];
  });
  const [units, setUnits] = useState(() => {
    const stored = localStorage.getItem('units');
    return stored ? JSON.parse(stored) : [];
  });
  const [parkingSpaces, setParkingSpaces] = useState(() => {
    const stored = localStorage.getItem('parkingSpaces');
    return stored ? JSON.parse(stored) : [];
  });
  const [spaces, setSpaces] = useState(() => {
    const stored = localStorage.getItem('spaces');
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedCondominium, setSelectedCondominium] = useState('');

  // Função para carregar todos os dados estruturais usando a API unificada
  const loadAllStructureData = useCallback(async () => {
    setLoading(true);
    try {
      // Usar a nova API unificada para carregar todos os dados de uma vez
      const response = await structureService.structure.getCompleteStructure();
      const structureData = response.data;
      
      // Atualizar estados com os dados recebidos
      const condominiumsData = structureData.condominiums || [];
      setCondominiums(condominiumsData);
      setBlocks(structureData.blocks || []);
      setUnits(structureData.units || []);
      setParkingSpaces(structureData.parking_spaces || []);
      setSpaces(structureData.spaces || []);
      
      // Usar o serviço de cache para armazenar os dados
      cacheService.storeStructureData(structureData);
      
      // Atualizar timestamp da última atualização
      const now = new Date().toISOString();
      setLastUpdate(now);
      
      console.log('Dados estruturais carregados com sucesso via API unificada');
    } catch (error) {
      console.error('Erro ao carregar dados estruturais:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCondominium]);

  // Função para recarregar dados após operações CRUD - agora usa a API unificada
  const refreshData = useCallback(async () => {
    await loadAllStructureData();
  }, [loadAllStructureData]);

  // Função para recarregar dados de um condomínio específico
  // Para operações pontuais, ainda usa chamadas específicas para melhor performance
  const refreshCondominiumData = useCallback(async (condominiumId) => {
    try {
      const [blocksRes, unitsRes, parkingRes, spacesRes] = await Promise.allSettled([
        structureService.block.getByCondominium(condominiumId),
        structureService.unit.getByCondominium(condominiumId),
        structureService.parking.getByCondominium(condominiumId),
        structureService.space.getByCondominium(condominiumId)
      ]);

      // Atualizar apenas os dados do condomínio específico
      if (blocksRes.status === 'fulfilled' && blocksRes.value?.data) {
        const newBlocks = [
          ...blocks.filter(block => block.condominium_id !== condominiumId),
          ...blocksRes.value.data
        ];
        setBlocks(newBlocks);
        localStorage.setItem('blocks', JSON.stringify(newBlocks));
      }
      
      if (unitsRes.status === 'fulfilled' && unitsRes.value?.data) {
        const newUnits = [
          ...units.filter(unit => unit.condominium_id !== condominiumId),
          ...unitsRes.value.data
        ];
        setUnits(newUnits);
        localStorage.setItem('units', JSON.stringify(newUnits));
      }
      
      if (parkingRes.status === 'fulfilled' && parkingRes.value?.data) {
        const newParkingSpaces = [
          ...parkingSpaces.filter(parking => parking.condominium_id !== condominiumId),
          ...parkingRes.value.data
        ];
        setParkingSpaces(newParkingSpaces);
        localStorage.setItem('parkingSpaces', JSON.stringify(newParkingSpaces));
      }
      
      if (spacesRes.status === 'fulfilled' && spacesRes.value?.data) {
        const newSpaces = [
          ...spaces.filter(space => space.condominium_id !== condominiumId),
          ...spacesRes.value.data
        ];
        setSpaces(newSpaces);
        localStorage.setItem('spaces', JSON.stringify(newSpaces));
      }
    } catch (error) {
      console.error(`Erro ao recarregar dados do condomínio ${condominiumId}:`, error);
    }
  }, [blocks, units, parkingSpaces, spaces]);

  // Função para atualização automática após operações CRUD
  const handleCrudOperation = useCallback(async (operation, entityType, condominiumId = null) => {
    try {
      console.log(`Operação ${operation} realizada em ${entityType}${condominiumId ? ` do condomínio ${condominiumId}` : ''}`);
      
      // Para operações que afetam apenas um condomínio, usar refreshCondominiumData
      // Para operações que podem afetar múltiplos condomínios ou estrutura geral, usar refreshData
      if (condominiumId && (operation === 'update' || operation === 'create')) {
        await refreshCondominiumData(condominiumId);
      } else {
        await refreshData();
      }
      
      // Atualizar timestamp da última operação
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('Erro na atualização automática após operação CRUD:', error);
    }
  }, [refreshData, refreshCondominiumData]);

  // Carregar dados automaticamente quando o contexto é inicializado
  useEffect(() => {
    const initializeData = async () => {
      // Verificar se há dados válidos em cache
      if (cacheService.hasStoredData() && cacheService.isCacheValid()) {
        // Carregar dados do cache
        const cachedData = cacheService.getStoredStructureData();
        if (cachedData) {
          setCondominiums(cachedData.condominiums || []);
          setBlocks(cachedData.blocks || []);
          setUnits(cachedData.units || []);
          setParkingSpaces(cachedData.parkingSpaces || []);
          setSpaces(cachedData.spaces || []);
          setLastUpdate(cachedData.lastUpdate);
          return;
        }
      }
      
      // Se não há cache válido, carregar do servidor
      await loadAllStructureData();
    };

    initializeData();
  }, [loadAllStructureData]);

  // Efeito para definir condomínio selecionado após dados carregados
  // Por padrão, começar com "Todos" (vazio) para mostrar todos os dados
  useEffect(() => {
    if (condominiums.length > 0 && selectedCondominium === '') {
      // Iniciar com "Todos" selecionado (selectedCondominium vazio)
      // O usuário pode escolher um condomínio específico se quiser
      console.log('Iniciando com "Todos os condomínios" selecionado');
    }
  }, [condominiums, selectedCondominium]);

  const value = {
    // Estados
    condominiums,
    blocks,
    units,
    parkingSpaces,
    spaces,
    loading,
    selectedCondominium,
    lastUpdate,
    
    // Setters
    setSelectedCondominium,
    
    // Métodos
    loadAllStructureData,
    refreshData,
    refreshCondominiumData,
    handleCrudOperation,
  };

  return (
    <StructureContext.Provider value={value}>
      {children}
    </StructureContext.Provider>
  );
};