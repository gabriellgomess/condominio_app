import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import structureService from '../../services/structureService';
import { Building, Home, Car, Package, Plus, Edit, Eye, Trash2, Search, Filter } from 'lucide-react';
import CondominiumModal from '../../components/modals/CondominiumModal';
import BlockModal from '../../components/modals/BlockModal';

const StructureManagementPage = () => {
  const [activeTab, setActiveTab] = useState('condominiums');
  const [condominiums, setCondominiums] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [units, setUnits] = useState([]);
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [storageUnits, setStorageUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondominium, setSelectedCondominium] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // create, edit, view
  const [modalEntity, setModalEntity] = useState('condominium'); // condominium, block, unit, parking, storage
  const [selectedItem, setSelectedItem] = useState(null);
  
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

  // Dados de exemplo para demonstração
  const mockData = {
    condominiums: [
      {
        id: 1,
        name: 'Residencial Verde',
        address: 'Rua das Flores, 123',
        cep: '12345-678',
        city: 'São Paulo',
        state: 'SP',
        total_units: 48,
        total_blocks: 4,
        status: 'active',
        created_at: '2025-01-15'
      },
      {
        id: 2,
        name: 'Condomínio Solar',
        address: 'Av. do Sol, 456',
        cep: '87654-321',
        city: 'Rio de Janeiro',
        state: 'RJ',
        total_units: 32,
        total_blocks: 2,
        status: 'active',
        created_at: '2025-02-20'
      }
    ],
    blocks: [
      {
        id: 1,
        condominium_id: 1,
        name: 'Bloco A',
        description: 'Bloco principal com 12 apartamentos',
        floors: 4,
        units_per_floor: 3,
        total_units: 12,
        status: 'active'
      },
      {
        id: 2,
        condominium_id: 1,
        name: 'Bloco B',
        description: 'Bloco secundário com 12 apartamentos',
        floors: 4,
        units_per_floor: 3,
        total_units: 12,
        status: 'active'
      }
    ],
    units: [
      {
        id: 1,
        condominium_id: 1,
        block_id: 1,
        number: '101',
        floor: 1,
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 2,
        area: 65.5,
        status: 'occupied'
      },
      {
        id: 2,
        condominium_id: 1,
        block_id: 1,
        number: '102',
        floor: 1,
        type: 'apartment',
        bedrooms: 3,
        bathrooms: 2,
        area: 85.0,
        status: 'vacant'
      }
    ],
    parkingSpaces: [
      {
        id: 1,
        condominium_id: 1,
        unit_id: 1,
        number: 'G01',
        type: 'covered',
        status: 'occupied'
      },
      {
        id: 2,
        condominium_id: 1,
        unit_id: null,
        number: 'G02',
        type: 'uncovered',
        status: 'available'
      }
    ],
    storageUnits: [
      {
        id: 1,
        condominium_id: 1,
        unit_id: 1,
        number: 'D01',
        area: 5.0,
        status: 'occupied'
      },
      {
        id: 2,
        condominium_id: 1,
        unit_id: null,
        number: 'D02',
        area: 3.5,
        status: 'available'
      }
    ]
  };

  useEffect(() => {
    loadData();
  }, [activeTab, selectedCondominium]);

  // Função para carregar dados específicos de um condomínio
  const loadCondominiumData = async (condominiumId) => {
    setLoading(true);
    try {
      const condominiumIdInt = parseInt(condominiumId);
      
      const [blocksResponse, unitsResponse, parkingResponse, storageResponse] = await Promise.allSettled([
        structureService.block.getByCondominium(condominiumIdInt),
        structureService.unit.getByCondominium(condominiumIdInt),
        structureService.parking.getByCondominium(condominiumIdInt),
        structureService.storage.getByCondominium(condominiumIdInt)
      ]);

      setBlocks(blocksResponse.status === 'fulfilled' ? (blocksResponse.value.data || []) : []);
      setUnits(unitsResponse.status === 'fulfilled' ? (unitsResponse.value.data || []) : []);
      setParkingSpaces(parkingResponse.status === 'fulfilled' ? (parkingResponse.value.data || []) : []);
      setStorageUnits(storageResponse.status === 'fulfilled' ? (storageResponse.value.data || []) : []);
      
    } catch (error) {
      console.error('Erro ao carregar dados do condomínio:', error);
      // Em caso de erro, usar dados filtrados como fallback
      const condominiumIdInt = parseInt(condominiumId);
      setBlocks(mockData.blocks.filter(b => b.condominium_id === condominiumIdInt));
      setUnits(mockData.units.filter(u => u.condominium_id === condominiumIdInt));
      setParkingSpaces(mockData.parkingSpaces.filter(p => p.condominium_id === condominiumIdInt));
      setStorageUnits(mockData.storageUnits.filter(s => s.condominium_id === condominiumIdInt));
    } finally {
      setLoading(false);
    }
  };

  // Recarregar dados quando o condomínio selecionado mudar
  useEffect(() => {
    if (selectedCondominium && activeTab !== 'condominiums') {
      loadCondominiumData(selectedCondominium);
    } else if (!selectedCondominium && activeTab !== 'condominiums') {
      // Limpar dados quando nenhum condomínio estiver selecionado
      setBlocks([]);
      setUnits([]);
      setParkingSpaces([]);
      setStorageUnits([]);
    }
  }, [selectedCondominium, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar condomínios
      const condominiumsResponse = await structureService.condominium.getAll();
      const condominiumsData = condominiumsResponse.data || [];
      setCondominiums(condominiumsData);

      // Se não há condomínio selecionado e há condomínios disponíveis, selecionar o primeiro
      let condominiumToLoad = selectedCondominium;
      if (!selectedCondominium && condominiumsData.length > 0) {
        condominiumToLoad = condominiumsData[0].id.toString();
        setSelectedCondominium(condominiumToLoad);
      }

      // Carregar dados do condomínio selecionado (se houver)
      if (condominiumToLoad) {
        await loadCondominiumDataSync(condominiumToLoad);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Em caso de erro, usar dados fictícios como fallback
      setCondominiums(mockData.condominiums);
      setBlocks(mockData.blocks);
      setUnits(mockData.units);
      setParkingSpaces(mockData.parkingSpaces);
      setStorageUnits(mockData.storageUnits);
    } finally {
      setLoading(false);
    }
  };

  // Função síncrona para carregar dados do condomínio (sem setLoading)
  const loadCondominiumDataSync = async (condominiumId) => {
    try {
      const condominiumIdInt = parseInt(condominiumId);
      
      const [blocksResponse, unitsResponse, parkingResponse, storageResponse] = await Promise.allSettled([
        structureService.block.getByCondominium(condominiumIdInt),
        structureService.unit.getByCondominium(condominiumIdInt),
        structureService.parking.getByCondominium(condominiumIdInt),
        structureService.storage.getByCondominium(condominiumIdInt)
      ]);

      setBlocks(blocksResponse.status === 'fulfilled' ? (blocksResponse.value.data || []) : []);
      setUnits(unitsResponse.status === 'fulfilled' ? (unitsResponse.value.data || []) : []);
      setParkingSpaces(parkingResponse.status === 'fulfilled' ? (parkingResponse.value.data || []) : []);
      setStorageUnits(storageResponse.status === 'fulfilled' ? (storageResponse.value.data || []) : []);
      
    } catch (error) {
      console.error('Erro ao carregar dados do condomínio:', error);
      // Em caso de erro, usar dados filtrados como fallback
      const condominiumIdInt = parseInt(condominiumId);
      setBlocks(mockData.blocks.filter(b => b.condominium_id === condominiumIdInt));
      setUnits(mockData.units.filter(u => u.condominium_id === condominiumIdInt));
      setParkingSpaces(mockData.parkingSpaces.filter(p => p.condominium_id === condominiumIdInt));
      setStorageUnits(mockData.storageUnits.filter(s => s.condominium_id === condominiumIdInt));
    }
  };

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

  const handleCondominiumSave = async (savedCondominium) => {
    try {
      let response;
      if (condominiumModal.mode === 'create') {
        response = await structureService.condominium.create(savedCondominium);
        setCondominiums(prev => [...prev, response.data]);
      } else if (condominiumModal.mode === 'edit') {
        response = await structureService.condominium.update(savedCondominium.id, savedCondominium);
        setCondominiums(prev => 
          prev.map(item => 
            item.id === savedCondominium.id ? response.data : item
          )
        );
      }
      closeCondominiumModal();
      // Recarregar dados para garantir sincronização
      loadData();
    } catch (error) {
      console.error('Erro ao salvar condomínio:', error);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    }
  };

  const handleDeleteCondominium = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este condomínio?')) {
      try {
        await structureService.condominium.delete(id);
        setCondominiums(prev => prev.filter(item => item.id !== id));
        loadData(); // Recarregar dados
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
      let response;
      if (blockModal.mode === 'create') {
        response = await structureService.block.create(savedBlock.condominium_id, savedBlock);
        setBlocks(prev => [...prev, response.data]);
      } else if (blockModal.mode === 'edit') {
        response = await structureService.block.update(savedBlock.id, savedBlock);
        setBlocks(prev => 
          prev.map(item => 
            item.id === savedBlock.id ? response.data : item
          )
        );
      }
      closeBlockModal();
      // Recarregar dados para garantir sincronização
      loadData();
    } catch (error) {
      console.error('Erro ao salvar bloco:', error);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    }
  };

  const handleDeleteBlock = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este bloco?')) {
      try {
        await structureService.block.delete(id);
        setBlocks(prev => prev.filter(item => item.id !== id));
        loadData(); // Recarregar dados
      } catch (error) {
        console.error('Erro ao excluir bloco:', error);
        alert('Erro ao excluir bloco. Tente novamente.');
      }
    }
  };

  const tabs = [
    { id: 'condominiums', label: 'Condomínios', icon: Building, count: condominiums.length },
    { id: 'blocks', label: 'Blocos', icon: Building, count: blocks.length },
    { id: 'units', label: 'Unidades', icon: Home, count: units.length },
    { id: 'parking', label: 'Garagens', icon: Car, count: parkingSpaces.length },
    { id: 'storage', label: 'Depósitos', icon: Package, count: storageUnits.length }
  ];

  const handleCreate = (entityType) => {
    setModalType('create');
    setModalEntity(entityType);
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item, entityType) => {
    setModalType('edit');
    setModalEntity(entityType);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleView = (item, entityType) => {
    setModalType('view');
    setModalEntity(entityType);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id, entityType) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        switch (entityType) {
          case 'condominium':
            await structureService.condominium.delete(id);
            setCondominiums(prev => prev.filter(item => item.id !== id));
            break;
          case 'block':
            await structureService.block.delete(id);
            setBlocks(prev => prev.filter(item => item.id !== id));
            break;
          case 'unit':
            await structureService.unit.delete(id);
            setUnits(prev => prev.filter(item => item.id !== id));
            break;
          case 'parking':
            await structureService.parking.delete(id);
            setParkingSpaces(prev => prev.filter(item => item.id !== id));
            break;
          case 'storage':
            await structureService.storage.delete(id);
            setStorageUnits(prev => prev.filter(item => item.id !== id));
            break;
          default:
            console.log(`Excluindo ${entityType} com ID: ${id}`);
        }
        // Recarregar dados para garantir sincronização
        loadData();
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
      free: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Livre' }
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const getUnitStatusBadge = (unit) => {
    // Primeiro verifica se a unidade está ativa
    if (unit.active === 0 || unit.active === false) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
          Inativa
        </span>
      );
    }

    // Se está ativa, verifica o status de ocupação
    const statusConfig = {
      occupied: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Ocupada' },
      vacant: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Vaga' },
      available: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Disponível' },
      maintenance: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Manutenção' },
      rented: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Alugada' }
    };

    const config = statusConfig[unit.status] || statusConfig.available;
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
          <tr className="border-b border-[#3dc43d]/20">
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Nome</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Endereço</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Cidade/UF</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Unidades</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Blocos</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Status</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {console.log('condominio', condominiums)}
          {condominiums.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.address.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((condominium) => (
            <tr key={condominium.id} className="border-b border-[#3dc43d]/10 hover:bg-[#3dc43d]/5 transition-colors">
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
                    className="p-2 text-[#3dc43d] hover:bg-[#3dc43d]/20 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openCondominiumModal('edit', condominium)}
                    className="p-2 text-[#3dc43d] hover:bg-[#3dc43d]/20 rounded-lg transition-colors"
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
          <tr className="border-b border-[#3dc43d]/20">
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Nome</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Condomínio</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Andares</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Unid./Andar</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Total Unidades</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Status</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Ações</th>
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
              <tr key={block.id} className="border-b border-[#3dc43d]/10 hover:bg-[#3dc43d]/5 transition-colors">
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
                     className="p-2 text-[#3dc43d] hover:bg-[#3dc43d]/20 rounded-lg transition-colors"
                     title="Visualizar"
                   >
                     <Eye className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => openBlockModal('edit', block)}
                     className="p-2 text-[#3dc43d] hover:bg-[#3dc43d]/20 rounded-lg transition-colors"
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
          <tr className="border-b border-[#3dc43d]/20">
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Número</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Bloco</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Andar</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Tipo</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Quartos</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Área (m²)</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Ativo</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Ocupação</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {units.filter(item => 
            !selectedCondominium || item.condominium_id.toString() === selectedCondominium
          ).filter(item => 
            item.number.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((unit) => {
            return (
              <tr key={unit.id} className="border-b border-[#3dc43d]/10 hover:bg-[#3dc43d]/5 transition-colors">
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
                      onClick={() => handleView(unit, 'unit')}
                      className="p-2 text-[#3dc43d] hover:bg-[#3dc43d]/20 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(unit, 'unit')}
                      className="p-2 text-[#3dc43d] hover:bg-[#3dc43d]/20 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(unit.id, 'unit')}
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
          <tr className="border-b border-[#3dc43d]/20">
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Número</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Tipo</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Unidade Vinculada</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Status</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Ações</th>
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
              <tr key={parking.id} className="border-b border-[#3dc43d]/10 hover:bg-[#3dc43d]/5 transition-colors">
                <td className="py-4 px-4 text-white font-medium">{parking.number}</td>
                <td className="py-4 px-4 text-[#f3f7f1]">
                  {parking.type === 'covered' ? 'Coberta' : 'Descoberta'}
                </td>
                <td className="py-4 px-4 text-[#f3f7f1]">{unit?.number || 'Não vinculada'}</td>
                <td className="py-4 px-4">{getStatusBadge(parking.status)}</td>
                <td className="py-4 px-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleView(parking, 'parking')}
                      className="p-2 text-[#3dc43d] hover:bg-[#3dc43d]/20 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(parking, 'parking')}
                      className="p-2 text-[#3dc43d] hover:bg-[#3dc43d]/20 rounded-lg transition-colors"
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
          <tr className="border-b border-[#3dc43d]/20">
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Número</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Área (m²)</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Unidade Vinculada</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Status</th>
            <th className="text-left py-3 px-4 text-[#3dc43d] font-medium">Ações</th>
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
              <tr key={storage.id} className="border-b border-[#3dc43d]/10 hover:bg-[#3dc43d]/5 transition-colors">
                <td className="py-4 px-4 text-white font-medium">{storage.number}</td>
                <td className="py-4 px-4 text-[#f3f7f1]">{storage.area}</td>
                <td className="py-4 px-4 text-[#f3f7f1]">{unit?.number || 'Não vinculado'}</td>
                <td className="py-4 px-4">{getStatusBadge(storage.status)}</td>
                <td className="py-4 px-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleView(storage, 'storage')}
                      className="p-2 text-[#3dc43d] hover:bg-[#3dc43d]/20 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(storage, 'storage')}
                      className="p-2 text-[#3dc43d] hover:bg-[#3dc43d]/20 rounded-lg transition-colors"
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
               openBlockModal('create');
             } else {
               handleCreate(activeTab.slice(0, -1));
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
                  ? 'bg-[#3dc43d] text-white'
                  : 'bg-[#080d08]/80 text-[#f3f7f1] hover:bg-[#3dc43d]/20'
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3dc43d]/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#080d08]/80 border border-[#3dc43d]/30 rounded-lg text-white placeholder-[#3dc43d]/60 focus:outline-none focus:ring-2 focus:ring-[#3dc43d] focus:border-transparent"
                />
              </div>
            </div>
            {activeTab !== 'condominiums' && (
              <div className="min-w-[200px]">
                <select
                  value={selectedCondominium}
                  onChange={(e) => setSelectedCondominium(e.target.value)}
                  className="w-full px-4 py-2 bg-[#080d08]/80 border border-[#3dc43d]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3dc43d] focus:border-transparent"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3dc43d]"></div>
            </div>
          ) : (
            renderTable()
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
      
      {/* Modal placeholder para outras entidades */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0a0f0a] border border-[#3dc43d]/30 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {modalType === 'create' ? 'Criar' : modalType === 'edit' ? 'Editar' : 'Visualizar'} {modalEntity}
            </h3>
            <p className="text-[#f3f7f1] mb-4">
              Modal de {modalType} para {modalEntity} será implementado na próxima etapa.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StructureManagementPage;