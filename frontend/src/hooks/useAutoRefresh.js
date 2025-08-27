import { useCallback } from 'react';
import { useStructure } from '../contexts/StructureContext';

/**
 * Hook personalizado para gerenciar atualizações automáticas após operações CRUD
 * Centraliza a lógica de quando usar refreshData vs refreshCondominiumData
 */
export const useAutoRefresh = () => {
  const { refreshData, refreshCondominiumData } = useStructure();

  const handleCrudSuccess = useCallback(async (operation, entityType, entityData = null) => {
    try {
      console.log(`Operação ${operation} realizada em ${entityType}`, entityData);
      
      // Estratégia de atualização baseada no tipo de operação
      switch (operation) {
        case 'create':
          // Para criações, sempre recarregar tudo para garantir consistência
          await refreshData();
          break;
          
        case 'update':
          // Para atualizações, verificar se afeta apenas um condomínio
          if (entityData?.condominium_id) {
            await refreshCondominiumData(entityData.condominium_id);
          } else {
            await refreshData();
          }
          break;
          
        case 'delete':
          // Para exclusões, sempre recarregar tudo
          await refreshData();
          break;
          
        default:
          await refreshData();
      }
    } catch (error) {
      console.error('Erro na atualização automática:', error);
    }
  }, [refreshData, refreshCondominiumData]);

  return {
    handleCrudSuccess
  };
};

export default useAutoRefresh;
