import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useStructure } from '../../contexts/StructureContext';
import { Building, Home, Car, Package, Plus, Edit, Eye, Trash2, Search } from 'lucide-react';
import CondominiumModal from '../../components/modals/CondominiumModal';
import BlockModal from '../../components/modals/BlockModal';
import UnitModal from '../../components/modals/UnitModal';
import ParkingModal from '../../components/modals/ParkingModal';
import StorageModal from '../../components/modals/StorageModal';
import Pagination from '../../components/Pagination';
import structureService from '../../services/structureService';

const StructureManagementPage = () => {
  // Usar dados do contexto ao invés de estados locais
  const {
    condominiums,
    blocks,
    units,
    parkingSpaces,
    storageUnits,
    loading,
    selectedCondominium,
    setSelectedCondominium,
    handleCrudOperation
  } = useStructure();
  
  const [activeTab, setActiveTab] = useState('condominiums');


  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginação para cada tab
  const [pagination, setPagination] = useState({
    condominiums: { currentPage: 1, itemsPerPage: 10 },
    blocks: { currentPage: 1, itemsPerPage: 10 },
    units: { currentPage: 1, itemsPerPage: 10 },
    parking: { currentPage: 1, itemsPerPage: 10 },
    storage: { currentPage: 1, itemsPerPage: 10 }
  });

  // Funções de paginação
  const handlePageChange = (tab, page) => {
    setPagination(prev => ({
      ...prev,
      [tab]: { ...prev[tab], currentPage: page }
    }));
  };

  const handleItemsPerPageChange = (tab, itemsPerPage) => {
    setPagination(prev => ({
      ...prev,
      [tab]: { currentPage: 1, itemsPerPage } // Reset para primeira página
    }));
  };

  // Função para aplicar paginação aos dados
  const getPaginatedData = (data, tab) => {
    const { currentPage, itemsPerPage } = pagination[tab];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };
  
    // Modal states
  const [condominiumModal, setCondominiumModal] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'view'
    data: null
  });

  const [blockModal, setBlockModal] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'view'
    data: null
  });

  const [unitModal, setUnitModal] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'view'
    data: null
  });

  const [parkingModal, setParkingModal] = useState({
    isOpen: false,
    mode: 'create',
    data: null
  });

  const [storageModal, setStorageModal] = useState({
    isOpen: false,
    mode: 'create',
    data: null
  });

  // Dados já são carregados pelo contexto

  // Dados já são carregados pelo contexto

  // Função removida - dados são gerenciados pelo contexto

  // Dados são automaticamente filtrados pelo contexto baseado no selectedCondominium

  // Função removida - dados são carregados pelo contexto

  // Função removida - dados são carregados pelo contexto

  // Função removida - dados são gerenciados pelo contexto

  // Funções do modal de condomínio
  const openCondominiumModal = (mode, data = null) => {
    setCondominiumModal({
      isOpen: true,
      mode,
      data
    });
  };

  const closeCondominiumModal = () => {
    setCondominiumModal({
      isOpen: false,
      mode: 'create',
      data: null
    });
  };

  const handleCondominiumSave = async () => {
    try {
      // Dados serão atualizados automaticamente pelo contexto após operação CRUD
      closeCondominiumModal();
      // Usar o sistema centralizado de atualização
      await handleCrudOperation(condominiumModal.mode, 'condominium');
    } catch (error) {
      console.error('Erro ao processar condomínio salvo:', error);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    }
  };

  const handleDeleteCondominium = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este condomínio?')) {
      try {
        await structureService.condominium.delete(id);
        await handleCrudOperation('delete', 'condominium');
      } catch (error) {
        console.error('Erro ao excluir condomínio:', error);
        alert('Erro ao excluir condomínio. Tente novamente.');
      }
    }
  };

  // Funções do modal de blocos
  const openBlockModal = (mode, data = null) => {
    setBlockModal({
      isOpen: true,
      mode,
      data
    });
  };

  const closeBlockModal = () => {
    setBlockModal({
      isOpen: false,
      mode: 'create',
      data: null
    });
  };

  const handleBlockSave = async (savedBlock) => {
    try {
      // O modal já fez a chamada da API, apenas fechamos e atualizamos o contexto
      closeBlockModal();
      // Usar o sistema centralizado de atualização
      await handleCrudOperation(blockModal.mode, 'block', savedBlock.condominium_id || parseInt(selectedCondominium));
    } catch (error) {
      console.error('Erro ao atualizar contexto após salvar bloco:', error);
    }
  };

  const handleDeleteBlock = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este bloco?')) {
      try {
        await structureService.block.delete(id);
        await handleCrudOperation('delete', 'block', parseInt(selectedCondominium));
      } catch (error) {
        console.error('Erro ao excluir bloco:', error);
        alert('Erro ao excluir bloco. Tente novamente.');
      }
    }
  };

  // Funções do modal de unidades
  const openUnitModal = (mode, data = null) => {
    setUnitModal({
      isOpen: true,
      mode,
      data
    });
  };

  const closeUnitModal = () => {
    setUnitModal({
      isOpen: false,
      mode: 'create',
      data: null
    });
  };

  const handleUnitSave = async (savedUnit) => {
    try {
      // O modal já fez a chamada da API, apenas fechamos e atualizamos o contexto
      closeUnitModal();
      // Usar o sistema centralizado de atualização
      await handleCrudOperation(unitModal.mode, 'unit', savedUnit.condominium_id || parseInt(selectedCondominium));
    } catch (error) {
      console.error('Erro ao atualizar contexto após salvar unidade:', error);
    }
  };

  const handleDeleteUnit = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
      try {
        await structureService.unit.delete(id);
        await handleCrudOperation('delete', 'unit', parseInt(selectedCondominium));
      } catch (error) {
        console.error('Erro ao excluir unidade:', error);
        alert('Erro ao excluir unidade. Tente novamente.');
      }
    }
  };

  // Funções do modal de garagens
  const openParkingModal = (mode, data = null) => {
    setParkingModal({
      isOpen: true,
      mode,
      data
    });
  };

  const closeParkingModal = () => {
    setParkingModal({
      isOpen: false,
      mode: 'create',
      data: null
    });
  };

  const handleParkingSave = async (savedParking) => {
    try {
      console.log('🏠 StructureManagementPage - handleParkingSave chamado com:', savedParking);
      console.log('🏠 StructureManagementPage - selectedCondominium:', selectedCondominium);
      console.log('🏠 StructureManagementPage - parkingModal.mode:', parkingModal.mode);
      
      // O modal já fez a chamada da API, apenas fechamos e atualizamos o contexto
      closeParkingModal();
      
      // Usar o sistema centralizado de atualização
      const condominiumId = savedParking?.condominium_id || parseInt(selectedCondominium);
      console.log('🏠 StructureManagementPage - Atualizando contexto para condominium_id:', condominiumId);
      
      await handleCrudOperation(parkingModal.mode, 'parking', condominiumId);
      console.log('✅ StructureManagementPage - Contexto atualizado com sucesso');
    } catch (error) {
      console.error('❌ StructureManagementPage - Erro ao atualizar contexto após salvar vaga de garagem:', error);
    }
  };

  const handleDeleteParking = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta vaga de garagem?')) {
      try {
        await structureService.parking.delete(id);
        await handleCrudOperation('delete', 'parking', parseInt(selectedCondominium));
      } catch (error) {
        console.error('Erro ao excluir vaga de garagem:', error);
        alert('Erro ao excluir vaga de garagem. Tente novamente.');
      }
    }
  };

  // Funções do modal de depósitos
  const openStorageModal = (mode, data = null) => {
    setStorageModal({
      isOpen: true,
      mode,
      data
    });
  };

  const closeStorageModal = () => {
    setStorageModal({
      isOpen: false,
      mode: 'create',
      data: null
    });
  };

  const handleStorageSave = async (savedStorage) => {
    try {
      console.log('🏠 StructureManagementPage - handleStorageSave chamado com:', savedStorage);
      console.log('🏠 StructureManagementPage - selectedCondominium:', selectedCondominium);
      console.log('🏠 StructureManagementPage - storageModal.mode:', storageModal.mode);
      
      // O modal já fez a chamada da API, apenas fechamos e atualizamos o contexto
      closeStorageModal();
      
      // Usar o sistema centralizado de atualização
      const condominiumId = savedStorage?.condominium_id || parseInt(selectedCondominium);
      console.log('🏠 StructureManagementPage - Atualizando contexto para condominium_id:', condominiumId);
      
      await handleCrudOperation(storageModal.mode, 'storage', condominiumId);
      console.log('✅ StructureManagementPage - Contexto atualizado com sucesso');
    } catch (error) {
      console.error('❌ StructureManagementPage - Erro ao atualizar contexto após salvar depósito:', error);
    }
  };

  const handleDeleteStorage = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este depósito?')) {
      try {
        await structureService.storage.delete(id);
        await handleCrudOperation('delete', 'storage', parseInt(selectedCondominium));
      } catch (error) {
        console.error('Erro ao excluir depósito:', error);
        alert('Erro ao excluir depósito. Tente novamente.');
      }
    }
  };

  // Calcular contadores baseados no filtro de condomínio selecionado
  const getFilteredCount = (items, entityType) => {
    if (entityType === 'condominiums') {
      return condominiums.length;
    }
    
    // Se não há condomínio selecionado (Todos), mostrar todos os itens
    if (!selectedCondominium) {
      return items.length;
    }
    
    // Se há condomínio específico selecionado, filtrar por ele
    return items.filter(item => item.condominium_id.toString() === selectedCondominium).length;
  };

  const tabs = [
    { id: 'condominiums', label: 'Condomínios', icon: Building, count: getFilteredCount([], 'condominiums') },
    { id: 'blocks', label: 'Blocos', icon: Building, count: getFilteredCount(blocks, 'blocks') },
    { id: 'units', label: 'Unidades', icon: Home, count: getFilteredCount(units, 'units') },
    { id: 'parking', label: 'Garagens', icon: Car, count: getFilteredCount(parkingSpaces, 'parking') },
    { id: 'storage', label: 'Depósitos', icon: Package, count: getFilteredCount(storageUnits, 'storage') }
  ];





  const getStatusBadge = (status) => {
    const statusString = status == 1 || status === true || status === 'active' ? 'active' : 'inactive';
    const statusConfig = {
      active: { bg: 'bg-[#ff6600]/20', text: 'text-[#ff6600]', border: 'border-[#ff6600]/30', label: 'Ativo' },
      inactive: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Inativo' },
      occupied: { bg: 'bg-[#ff8533]/20', text: 'text-[#ff8533]', border: 'border-[#ff8533]/30', label: 'Ocupado' },
      vacant: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Vago' },
      available: { bg: 'bg-[#ff6600]/20', text: 'text-[#ff6600]', border: 'border-[#ff6600]/30', label: 'Disponível' },
      maintenance: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Manutenção' }
    };

    const config = statusConfig[statusString] || statusConfig.inactive;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const getUnitOccupationBadge = (status) => {
    const statusConfig = {
      occupied: { bg: 'bg-[#ff8533]/20', text: 'text-[#ff8533]', border: 'border-[#ff8533]/30', label: 'Ocupada' },
      vacant: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Vaga' },
      available: { bg: 'bg-[#ff6600]/20', text: 'text-[#ff6600]', border: 'border-[#ff6600]/30', label: 'Disponível' },
      maintenance: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Manutenção' },
      rented: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Alugada' },
      reserved: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Reservada' },
      free: { bg: 'bg-[#ff6600]/20', text: 'text-[#ff6600]', border: 'border-[#ff6600]/30', label: 'Livre' }
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const getParkingStatusBadge = (status) => {
    const statusConfig = {
      available: { bg: 'bg-[#ff6600]/20', text: 'text-[#ff6600]', border: 'border-[#ff6600]/30', label: 'Disponível' },
      occupied: { bg: 'bg-[#ff8533]/20', text: 'text-[#ff8533]', border: 'border-[#ff8533]/30', label: 'Ocupada' },
      reserved: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Reservada' },
      maintenance: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Manutenção' }
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {config.label}
      </span>
    );
  };



  const renderCondominiumsTable = () => {
    // Filtrar dados
    const filteredData = condominiums.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Aplicar paginação
    const paginatedData = getPaginatedData(filteredData, 'condominiums');

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ff6600]/20">
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Nome</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Endereço</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Cidade/UF</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Unidades</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Blocos</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Status</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((condominium) => (
                <tr key={condominium.id} className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors">
                  <td className="py-4 px-4 text-white font-medium">{condominium.name}</td>
                  <td className="py-4 px-4 text-[#f3f7f1]">{condominium.address}</td>
                  <td className="py-4 px-4 text-[#f3f7f1]">{condominium.city}/{condominium.state}</td>
                  <td className="py-4 px-4 text-[#f3f7f1]">{condominium.units_count || 0}</td>
                  <td className="py-4 px-4 text-[#f3f7f1]">{condominium.blocks_count || 0}</td>
                  <td className="py-4 px-4">{getStatusBadge(condominium.active)}</td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openCondominiumModal('view', condominium)}
                        className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openCondominiumModal('edit', condominium)}
                        className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCondominium(condominium.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        <Pagination
          currentPage={pagination.condominiums.currentPage}
          totalItems={filteredData.length}
          itemsPerPage={pagination.condominiums.itemsPerPage}
          onPageChange={(page) => handlePageChange('condominiums', page)}
          onItemsPerPageChange={(itemsPerPage) => handleItemsPerPageChange('condominiums', itemsPerPage)}
        />
      </>
    );
  };

  const renderBlocksTable = () => {
    // Filtrar dados
    const filteredData = blocks.filter(item => 
      !selectedCondominium || item.condominium_id.toString() === selectedCondominium
    ).filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Aplicar paginação
    const paginatedData = getPaginatedData(filteredData, 'blocks');

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ff6600]/20">
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Nome</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Condomínio</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Andares</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Unid./Andar</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Total Unidades</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Status</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((block) => {
                const totalUnits = block.floors * block.units_per_floor;
                return (
                  <tr key={block.id} className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{block.name}</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{block.condominium?.name || 'N/A'}</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{block.floors}</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{block.units_per_floor}</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{totalUnits}</td>
                    <td className="py-4 px-4">{getStatusBadge(block.active)}</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                       <button 
                         onClick={() => openBlockModal('view', block)}
                         className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                         title="Visualizar"
                       >
                         <Eye className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => openBlockModal('edit', block)}
                         className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                         title="Editar"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDeleteBlock(block.id)}
                         className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                         title="Excluir"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        <Pagination
          currentPage={pagination.blocks.currentPage}
          totalItems={filteredData.length}
          itemsPerPage={pagination.blocks.itemsPerPage}
          onPageChange={(page) => handlePageChange('blocks', page)}
          onItemsPerPageChange={(itemsPerPage) => handleItemsPerPageChange('blocks', itemsPerPage)}
        />
      </>
    );
  };

  const renderUnitsTable = () => {
    // Filtrar dados
    const filteredData = units.filter(item => 
      !selectedCondominium || item.condominium_id.toString() === selectedCondominium
    ).filter(item => 
      item.number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Aplicar paginação
    const paginatedData = getPaginatedData(filteredData, 'units');

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ff6600]/20">
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Número</th>
                {!selectedCondominium && <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Condomínio</th>}
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Bloco</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Andar</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Tipo</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Quartos</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Área (m²)</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ativo</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ocupação</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((unit) => {
                return (
                  <tr key={unit.id} className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{unit.number}</td>
                    {!selectedCondominium && <td className="py-4 px-4 text-[#f3f7f1]">{unit.condominium?.name || 'N/A'}</td>}
                    <td className="py-4 px-4 text-[#f3f7f1]">{unit.block?.name || 'N/A'}</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{unit.floor}º</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">
                      {unit.type === 'apartamento' ? 'Apartamento' : 
                       unit.type === 'casa' ? 'Casa' : 
                       unit.type === 'comercial' ? 'Comercial' : 
                       unit.type === 'apartment' ? 'Apartamento' : 
                       unit.type === 'house' ? 'Casa' : 
                       unit.type === 'commercial' ? 'Comercial' : unit.type}
                    </td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{unit.bedrooms}</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{unit.area}</td>
                    <td className="py-4 px-4">{getStatusBadge(unit.active)}</td>
                    <td className="py-4 px-4">{getUnitOccupationBadge(unit.status)}</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openUnitModal('view', unit)}
                          className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openUnitModal('edit', unit)}
                          className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
        
        {/* Paginação */}
        <Pagination
          currentPage={pagination.units.currentPage}
          totalItems={filteredData.length}
          itemsPerPage={pagination.units.itemsPerPage}
          onPageChange={(page) => handlePageChange('units', page)}
          onItemsPerPageChange={(itemsPerPage) => handleItemsPerPageChange('units', itemsPerPage)}
        />
      </>
    );
  };

  const renderParkingTable = () => {
    // Filtrar dados
    const filteredData = parkingSpaces.filter(item => 
      !selectedCondominium || item.condominium_id.toString() === selectedCondominium
    ).filter(item => 
      item.number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Aplicar paginação
    const paginatedData = getPaginatedData(filteredData, 'parking');

    return (
      <>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#ff6600]/20">
            <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Número</th>
            <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Tipo</th>
            <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Tamanho</th>
            <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Condomínio</th>
            <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Unidade Vinculada</th>
            <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Status</th>
            <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ativo</th>
            <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((parking) => {
            const unit = units.find(u => u.id === parking.unit_id);
            return (
              <tr key={parking.id} className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors">
                <td className="py-4 px-4 text-white font-medium">{parking.number}</td>
                <td className="py-4 px-4 text-[#f3f7f1]">
                  {parking.type === 'covered' ? 'Coberta' : 
                   parking.type === 'uncovered' ? 'Descoberta' : 
                   parking.type === 'garage' ? 'Garagem' : 
                   parking.type === 'motorcycle' ? 'Moto' : parking.type}
                </td>
                <td className="py-4 px-4 text-[#f3f7f1]">
                  {parking.size === 'compact' ? 'Compacta' : 
                   parking.size === 'standard' ? 'Padrão' : 
                   parking.size === 'large' ? 'Grande' : 
                   parking.size === 'motorcycle' ? 'Moto' : parking.size}
                </td>
                <td className="py-4 px-4 text-[#f3f7f1]">{parking.condominium?.name || 'N/A'}</td>
                <td className="py-4 px-4 text-[#f3f7f1]">{unit?.number || 'Não vinculada'}</td>
                <td className="py-4 px-4">{getParkingStatusBadge(parking.status)}</td>
                <td className="py-4 px-4">{getStatusBadge(parking.active)}</td>
                <td className="py-4 px-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openParkingModal('view', parking)}
                      className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openParkingModal('edit', parking)}
                      className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteParking(parking.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
        
        {/* Paginação */}
        <Pagination
          currentPage={pagination.parking.currentPage}
          totalItems={filteredData.length}
          itemsPerPage={pagination.parking.itemsPerPage}
          onPageChange={(page) => handlePageChange('parking', page)}
          onItemsPerPageChange={(itemsPerPage) => handleItemsPerPageChange('parking', itemsPerPage)}
        />
      </>
    );
  };

  const getStorageStatusBadge = (status) => {
    const statusConfig = {
      available: { bg: 'bg-[#ff6600]/20', text: 'text-[#ff6600]', border: 'border-[#ff6600]/30', label: 'Disponível' },
      occupied: { bg: 'bg-[#ff8533]/20', text: 'text-[#ff8533]', border: 'border-[#ff8533]/30', label: 'Ocupado' },
      reserved: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Reservado' },
      maintenance: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Manutenção' }
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const renderStorageTable = () => {
    // Filtrar dados
    const filteredData = storageUnits.filter(item => 
      !selectedCondominium || item.condominium_id.toString() === selectedCondominium
    ).filter(item => 
      item.number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Aplicar paginação
    const paginatedData = getPaginatedData(filteredData, 'storage');

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ff6600]/20">
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Número</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Tipo</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Área (m²)</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Localização</th>
                {!selectedCondominium && <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Condomínio</th>}
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Unidade Vinculada</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Status</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ativo</th>
                <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((storage) => {
                const unit = units.find(u => u.id === storage.unit_id);
                return (
                  <tr key={storage.id} className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{storage.number}</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">
                      {storage.type === 'storage' ? 'Depósito' : 
                       storage.type === 'box' ? 'Box' : 
                       storage.type === 'cellar' ? 'Adega' : 
                       storage.type === 'attic' ? 'Sótão' : storage.type}
                    </td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{storage.area || 'N/A'}</td>
                    <td className="py-4 px-4 text-[#f3f7f1]">{storage.location || 'N/A'}</td>
                    {!selectedCondominium && <td className="py-4 px-4 text-[#f3f7f1]">{storage.condominium?.name || 'N/A'}</td>}
                    <td className="py-4 px-4 text-[#f3f7f1]">{unit?.number || 'Não vinculado'}</td>
                    <td className="py-4 px-4">{getStorageStatusBadge(storage.status)}</td>
                    <td className="py-4 px-4">{getStatusBadge(storage.active)}</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openStorageModal('view', storage)}
                          className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openStorageModal('edit', storage)}
                          className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStorage(storage.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        <Pagination
          currentPage={pagination.storage.currentPage}
          totalItems={filteredData.length}
          itemsPerPage={pagination.storage.itemsPerPage}
          onPageChange={(page) => handlePageChange('storage', page)}
          onItemsPerPageChange={(itemsPerPage) => handleItemsPerPageChange('storage', itemsPerPage)}
        />
      </>
    );
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'condominiums':
        return renderCondominiumsTable();
      case 'blocks':
        return renderBlocksTable();
      case 'units':
        return renderUnitsTable();
      case 'parking':
        return renderParkingTable();
      case 'storage':
        return renderStorageTable();
      default:
        return renderCondominiumsTable();
    }
  };

  const getCreateButtonText = () => {
    const labels = {
      condominiums: 'Novo Condomínio',
      blocks: 'Novo Bloco',
      units: 'Nova Unidade',
      parking: 'Nova Vaga',
      storage: 'Novo Depósito'
    };
    return labels[activeTab] || 'Novo Item';
  };

  return (
    <Layout 
      title="Gerenciar Estrutura" 
      breadcrumbs={['Dashboard', 'Estrutura']}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Estrutura do Condomínio</h2>
          <p className="text-[#f3f7f1]">Gerencie condomínios, blocos, unidades, garagens e depósitos</p>
        </div>
        <button 
          onClick={() => {
             if (activeTab === 'condominiums') {
               openCondominiumModal('create');
             } else if (activeTab === 'blocks') {
               openBlockModal('create', { condominium_id: selectedCondominium });
             } else if (activeTab === 'units') {
               openUnitModal('create', { condominium_id: selectedCondominium });
             } else if (activeTab === 'parking') {
               openParkingModal('create', { condominium_id: parseInt(selectedCondominium) });
             } else if (activeTab === 'storage') {
               openStorageModal('create', { condominium_id: parseInt(selectedCondominium) });
             } else {
               console.log('Create', activeTab.slice(0, -1));
             }
           }}
          className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" />
          {getCreateButtonText()}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#ff6600] text-white'
                  : 'bg-[#080d08]/80 text-[#f3f7f1] hover:bg-[#ff6600]/20'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
              <span className="ml-2 px-2 py-1 bg-black/20 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ff6600]/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#080d08]/80 border border-[#ff6600]/30 rounded-lg text-white placeholder-[#ff6600]/60 focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
                />
              </div>
            </div>
            {activeTab !== 'condominiums' && (
              <div className="min-w-[200px]">
                <select
                  value={selectedCondominium}
                  onChange={(e) => setSelectedCondominium(e.target.value)}
                  className="w-full px-4 py-2 bg-[#080d08]/80 border border-[#ff6600]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
                >
                  <option value="">Todos os condomínios</option>
                  {condominiums.map((cond) => (
                    <option key={cond.id} value={cond.id.toString()}>
                      {cond.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6600]"></div>
            </div>
          ) : (
            <>
              {renderTable()}
              {/* Mensagem quando não há dados */}
              {activeTab !== 'condominiums' && (
                (() => {
                  const selectedCondominiumName = selectedCondominium ? 
                    condominiums.find(c => c.id.toString() === selectedCondominium)?.name : 
                    'todos os condomínios';
                    
                  const hasData = 
                    (activeTab === 'blocks' && blocks.filter(b => !selectedCondominium || b.condominium_id.toString() === selectedCondominium).length > 0) ||
                    (activeTab === 'units' && units.filter(u => !selectedCondominium || u.condominium_id.toString() === selectedCondominium).length > 0) ||
                    (activeTab === 'parking' && parkingSpaces.filter(p => !selectedCondominium || p.condominium_id.toString() === selectedCondominium).length > 0) ||
                    (activeTab === 'storage' && storageUnits.filter(s => !selectedCondominium || s.condominium_id.toString() === selectedCondominium).length > 0);
                  
                  if (!hasData) {
                    const entityLabels = {
                      blocks: 'blocos',
                      units: 'unidades', 
                      parking: 'vagas de garagem',
                      storage: 'depósitos'
                    };
                    
                    return (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-[#ff6600]/40 mx-auto mb-4" />
                        <p className="text-[#f3f7f1]/60 mb-2">
                          Nenhum(a) {entityLabels[activeTab]} cadastrado(a) {selectedCondominium ? 'para o condomínio' : 'em'}
                        </p>
                        <p className="text-white font-medium">
                          {selectedCondominiumName}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()
              )}
            </>
          )}
        </div>
      </div>

      {/* Modais */}
       <CondominiumModal
         isOpen={condominiumModal.isOpen}
         onClose={closeCondominiumModal}
         mode={condominiumModal.mode}
         condominium={condominiumModal.data}
         onSave={handleCondominiumSave}
       />
       
              <BlockModal
        isOpen={blockModal.isOpen}
        onClose={closeBlockModal}
        mode={blockModal.mode}
        block={blockModal.data}
        condominiums={condominiums}
        onSave={handleBlockSave}
       />

       <UnitModal
        isOpen={unitModal.isOpen}
        onClose={closeUnitModal}
        mode={unitModal.mode}
        unit={unitModal.data}
        condominiums={condominiums}
        blocks={blocks}
        onSave={handleUnitSave}
       />

       <ParkingModal
        isOpen={parkingModal.isOpen}
        onClose={closeParkingModal}
        mode={parkingModal.mode}
        parking={parkingModal.data}
        condominiums={condominiums}
        units={units}
        onSave={handleParkingSave}
       />

       <StorageModal
        isOpen={storageModal.isOpen}
        onClose={closeStorageModal}
        mode={storageModal.mode}
        storage={storageModal.data}
        condominiums={condominiums}
        units={units}
        onSave={handleStorageSave}
       />
      
      {/* Outros modais serão implementados conforme necessário */}
    </Layout>
  );
};

export default StructureManagementPage;