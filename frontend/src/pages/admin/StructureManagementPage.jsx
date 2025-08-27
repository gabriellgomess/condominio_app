import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useStructure } from '../../contexts/StructureContext';
import { Building, Home, Car, Package, Plus, Edit, Eye, Trash2, Search } from 'lucide-react';
import CondominiumModal from '../../components/modals/CondominiumModal';
import BlockModal from '../../components/modals/BlockModal';
import UnitModal from '../../components/modals/UnitModal';
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
    refreshCondominiumData,
    handleCrudOperation
  } = useStructure();
  
  const [activeTab, setActiveTab] = useState('condominiums');


  const [searchTerm, setSearchTerm] = useState('');
  
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

  // Calcular contadores baseados no filtro de condomínio selecionado
  const getFilteredCount = (items, entityType) => {
    if (entityType === 'condominiums') {
      return condominiums.length;
    }
    
    if (!selectedCondominium) {
      return items.length;
    }
    
    return items.filter(item => item.condominium_id.toString() === selectedCondominium).length;
  };

  const tabs = [
    { id: 'condominiums', label: 'Condomínios', icon: Building, count: getFilteredCount([], 'condominiums') },
    { id: 'blocks', label: 'Blocos', icon: Building, count: getFilteredCount(blocks, 'blocks') },
    { id: 'units', label: 'Unidades', icon: Home, count: getFilteredCount(units, 'units') },
    { id: 'parking', label: 'Garagens', icon: Car, count: getFilteredCount(parkingSpaces, 'parking') },
    { id: 'storage', label: 'Depósitos', icon: Package, count: getFilteredCount(storageUnits, 'storage') }
  ];



  const handleDelete = async (id, entityType) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        switch (entityType) {
          case 'condominium':
            await structureService.condominium.delete(id);
            break;
          case 'block':
            await structureService.block.delete(id);
            break;
          case 'unit':
            await structureService.unit.delete(id);
            break;
          case 'parking':
            await structureService.parking.delete(id);
            break;
          case 'storage':
            await structureService.storage.delete(id);
            break;
          default:
            console.log(`Excluindo ${entityType} com ID: ${id}`);
        }
        // Recarregar dados para garantir sincronização
        refreshCondominiumData(parseInt(selectedCondominium));
      } catch (error) {
        console.error('Erro ao excluir:', error);
        // Aqui você pode adicionar uma notificação de erro para o usuário
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusString = status == 1 || status === true || status === 'active' ? 'active' : 'inactive';
    const statusConfig = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Ativo' },
      inactive: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Inativo' },
      occupied: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Ocupado' },
      vacant: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Vago' },
      available: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Disponível' },
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
      occupied: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Ocupada' },
      vacant: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Vaga' },
      available: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Disponível' },
      maintenance: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Manutenção' },
      rented: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Alugada' },
      reserved: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Reservada' },
      free: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Livre' }
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {config.label}
      </span>
    );
  };



  const renderCondominiumsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#31a196]/20">
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Nome</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Endereço</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Cidade/UF</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Unidades</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Blocos</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Status</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {condominiums.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.address.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((condominium) => (
            <tr key={condominium.id} className="border-b border-[#31a196]/10 hover:bg-[#31a196]/5 transition-colors">
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
                    className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openCondominiumModal('edit', condominium)}
                    className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
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
  );

  const renderBlocksTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#31a196]/20">
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Nome</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Condomínio</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Andares</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Unid./Andar</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Total Unidades</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Status</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {blocks.filter(item => 
            !selectedCondominium || item.condominium_id.toString() === selectedCondominium
          ).filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((block) => {
            const totalUnits = block.floors * block.units_per_floor;
            return (
              <tr key={block.id} className="border-b border-[#31a196]/10 hover:bg-[#31a196]/5 transition-colors">
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
                     className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
                     title="Visualizar"
                   >
                     <Eye className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => openBlockModal('edit', block)}
                     className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
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
  );

  const renderUnitsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#31a196]/20">
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Número</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Bloco</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Andar</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Tipo</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Quartos</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Área (m²)</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Ativo</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Ocupação</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {units.filter(item => 
            !selectedCondominium || item.condominium_id.toString() === selectedCondominium
          ).filter(item => 
            item.number.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((unit) => {
            return (
              <tr key={unit.id} className="border-b border-[#31a196]/10 hover:bg-[#31a196]/5 transition-colors">
                <td className="py-4 px-4 text-white font-medium">{unit.number}</td>
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
                      className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openUnitModal('edit', unit)}
                      className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
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
  );

  const renderParkingTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#31a196]/20">
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Número</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Tipo</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Unidade Vinculada</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Status</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {parkingSpaces.filter(item => 
            !selectedCondominium || item.condominium_id.toString() === selectedCondominium
          ).filter(item => 
            item.number.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((parking) => {
            const unit = units.find(u => u.id === parking.unit_id);
            return (
              <tr key={parking.id} className="border-b border-[#31a196]/10 hover:bg-[#31a196]/5 transition-colors">
                <td className="py-4 px-4 text-white font-medium">{parking.number}</td>
                <td className="py-4 px-4 text-[#f3f7f1]">
                  {parking.type === 'covered' ? 'Coberta' : 'Descoberta'}
                </td>
                <td className="py-4 px-4 text-[#f3f7f1]">{unit?.number || 'Não vinculada'}</td>
                <td className="py-4 px-4">{getStatusBadge(parking.status)}</td>
                <td className="py-4 px-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => console.log('View parking:', parking)}
                      className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => console.log('Edit parking:', parking)}
                      className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(parking.id, 'parking')}
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
  );

  const renderStorageTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#31a196]/20">
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Número</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Área (m²)</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Unidade Vinculada</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Status</th>
            <th className="text-left py-3 px-4 text-[#31a196] font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {storageUnits.filter(item => 
            !selectedCondominium || item.condominium_id.toString() === selectedCondominium
          ).filter(item => 
            item.number.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((storage) => {
            const unit = units.find(u => u.id === storage.unit_id);
            return (
              <tr key={storage.id} className="border-b border-[#31a196]/10 hover:bg-[#31a196]/5 transition-colors">
                <td className="py-4 px-4 text-white font-medium">{storage.number}</td>
                <td className="py-4 px-4 text-[#f3f7f1]">{storage.area}</td>
                <td className="py-4 px-4 text-[#f3f7f1]">{unit?.number || 'Não vinculado'}</td>
                <td className="py-4 px-4">{getStatusBadge(storage.status)}</td>
                <td className="py-4 px-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => console.log('View storage:', storage)}
                      className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => console.log('Edit storage:', storage)}
                      className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(storage.id, 'storage')}
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
  );

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
             } else {
               console.log('Create', activeTab.slice(0, -1));
             }
           }}
          className="btn-primary"
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
                  ? 'bg-[#31a196] text-white'
                  : 'bg-[#080d08]/80 text-[#f3f7f1] hover:bg-[#31a196]/20'
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#31a196]/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent"
                />
              </div>
            </div>
            {activeTab !== 'condominiums' && (
              <div className="min-w-[200px]">
                <select
                  value={selectedCondominium}
                  onChange={(e) => setSelectedCondominium(e.target.value)}
                  className="w-full px-4 py-2 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent"
                >
                  
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#31a196]"></div>
            </div>
          ) : (
            <>
              {renderTable()}
              {/* Mensagem quando não há dados para o condomínio selecionado */}
              {selectedCondominium && activeTab !== 'condominiums' && (
                (() => {
                  const selectedCondominiumName = condominiums.find(c => c.id.toString() === selectedCondominium)?.name;
                  const hasData = 
                    (activeTab === 'blocks' && blocks.some(b => b.condominium_id.toString() === selectedCondominium)) ||
                    (activeTab === 'units' && units.some(u => u.condominium_id.toString() === selectedCondominium)) ||
                    (activeTab === 'parking' && parkingSpaces.some(p => p.condominium_id.toString() === selectedCondominium)) ||
                    (activeTab === 'storage' && storageUnits.some(s => s.condominium_id.toString() === selectedCondominium));
                  
                  if (!hasData) {
                    const entityLabels = {
                      blocks: 'blocos',
                      units: 'unidades', 
                      parking: 'vagas de garagem',
                      storage: 'depósitos'
                    };
                    
                    return (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-[#31a196]/40 mx-auto mb-4" />
                        <p className="text-[#f3f7f1]/60 mb-2">
                          Nenhum(a) {entityLabels[activeTab]} cadastrado(a) para o condomínio
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
      
      {/* Outros modais serão implementados conforme necessário */}
    </Layout>
  );
};

export default StructureManagementPage;