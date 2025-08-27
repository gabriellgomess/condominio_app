import React, { createContext, useContext, useState, useEffect } from 'react';
import { residentService } from '../services/api';

const ResidentsContext = createContext();

export const useResidents = () => {
  const context = useContext(ResidentsContext);
  if (!context) {
    throw new Error('useResidents must be used within a ResidentsProvider');
  }
  return context;
};

export const ResidentsProvider = ({ children }) => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedCondominium, setSelectedCondominium] = useState('');

  // Chave para localStorage com versão
  const CACHE_KEY = 'residents_data_v1';
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hora em milliseconds

  // Função para obter dados do cache
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Verificar se o cache não expirou
      if (now - timestamp < CACHE_DURATION) {
        console.log('📦 ResidentsContext - Dados carregados do cache');
        return data;
      } else {
        console.log('⏰ ResidentsContext - Cache expirado, removendo');
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    } catch (error) {
      console.error('❌ ResidentsContext - Erro ao ler cache:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  // Função para salvar dados no cache
  const setCachedData = (data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 ResidentsContext - Dados salvos no cache');
    } catch (error) {
      console.error('❌ ResidentsContext - Erro ao salvar cache:', error);
    }
  };

  // Função para carregar moradores do backend
  const fetchResidents = async (forceRefresh = false) => {
    try {
      setLoading(true);
      console.log('🔄 ResidentsContext - Carregando moradores...', { forceRefresh });

      // Verificar cache primeiro (se não for refresh forçado)
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setResidents(cachedData.residents || []);
          setLastUpdate(cachedData.lastUpdate);
          setLoading(false);
          return;
        }
      }

      // Buscar dados do backend
      const response = await residentService.getAll();
      
      if (response.status === 'success') {
        const residentsData = response.data || [];
        
        console.log('✅ ResidentsContext - Moradores carregados:', {
          count: residentsData.length,
          data: residentsData
        });

        setResidents(residentsData);
        setLastUpdate(new Date().toISOString());

        // Salvar no cache
        const dataToCache = {
          residents: residentsData,
          lastUpdate: new Date().toISOString()
        };
        setCachedData(dataToCache);
      } else {
        console.error('❌ ResidentsContext - Erro na resposta:', response);
        throw new Error(response.message || 'Erro ao carregar moradores');
      }
    } catch (error) {
      console.error('❌ ResidentsContext - Erro ao carregar moradores:', error);
      // Em caso de erro, manter dados existentes se houver
      if (residents.length === 0) {
        setResidents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar moradores após operações CRUD
  const handleCrudOperation = async (operation, data = null) => {
    console.log('🔄 ResidentsContext - Operação CRUD:', { operation, data });
    
    try {
      switch (operation) {
        case 'create':
          if (data) {
            // Adicionar o novo morador à lista
            setResidents(prev => [...prev, data]);
            console.log('➕ ResidentsContext - Morador adicionado localmente');
          }
          break;
          
        case 'update':
          if (data) {
            // Atualizar o morador na lista
            setResidents(prev => 
              prev.map(resident => 
                resident.id === data.id ? data : resident
              )
            );
            console.log('✏️ ResidentsContext - Morador atualizado localmente');
          }
          break;
          
        case 'delete':
          if (data && data.id) {
            // Remover o morador da lista
            setResidents(prev => 
              prev.filter(resident => resident.id !== data.id)
            );
            console.log('🗑️ ResidentsContext - Morador removido localmente');
          }
          break;
          
        default:
          console.log('🔄 ResidentsContext - Recarregando todos os dados');
          await fetchResidents(true);
          return;
      }

      // Atualizar timestamp e cache
      const newLastUpdate = new Date().toISOString();
      setLastUpdate(newLastUpdate);
      
      // Atualizar cache com os novos dados
      const dataToCache = {
        residents,
        lastUpdate: newLastUpdate
      };
      setCachedData(dataToCache);
      
    } catch (error) {
      console.error('❌ ResidentsContext - Erro na operação CRUD:', error);
      // Em caso de erro, recarregar todos os dados
      await fetchResidents(true);
    }
  };

  // Função para limpar cache
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    console.log('🧹 ResidentsContext - Cache limpo');
  };

  // Carregar dados na inicialização
  useEffect(() => {
    fetchResidents();
  }, []);

  // Função para filtrar moradores por condomínio
  const getResidentsByCondominium = (condominiumId = null) => {
    if (!condominiumId || condominiumId === '') {
      return residents; // Retornar todos se não especificar condomínio
    }
    return residents.filter(resident => 
      resident.condominium_id?.toString() === condominiumId.toString()
    );
  };

  // Função para obter estatísticas
  const getStats = () => {
    const total = residents.length;
    const withTenant = residents.filter(r => r.has_tenant).length;
    const withoutTenant = total - withTenant;
    const activeOwners = residents.filter(r => r.owner?.status === 'active').length;
    const activeTenants = residents.filter(r => r.tenant?.has_tenant && r.tenant?.status === 'active').length;

    return {
      total,
      withTenant,
      withoutTenant,
      activeOwners,
      activeTenants,
      totalResidents: residents.reduce((sum, r) => sum + (r.total_residents || 1), 0)
    };
  };

  const value = {
    // Estados
    residents,
    loading,
    lastUpdate,
    selectedCondominium,
    
    // Setters
    setSelectedCondominium,
    
    // Funções
    fetchResidents,
    handleCrudOperation,
    clearCache,
    getResidentsByCondominium,
    getStats,
    
    // Função para recarregar dados
    refresh: () => fetchResidents(true)
  };

  return (
    <ResidentsContext.Provider value={value}>
      {children}
    </ResidentsContext.Provider>
  );
};

export default ResidentsContext;
