import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useStructure } from '../../contexts/StructureContext';
import { useResidents } from '../../contexts/ResidentsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { residentService } from '../../services/api';
import { Users, Plus, Edit, Eye, Trash2, Search, User, Phone, Mail, Home, Building } from 'lucide-react';
import Pagination from '../../components/Pagination';
import ResidentModal from '../../components/modals/ResidentModal';

const ResidentsManagementPage = () => {
  const { condominiums, units, loading } = useStructure();
  const { 
    loading: loadingResidents, 
    selectedCondominium: contextSelectedCondominium,
    setSelectedCondominium: setContextSelectedCondominium,
    handleCrudOperation,
    getResidentsByCondominium 
  } = useResidents();
  const { isDarkMode } = useTheme();
  
  // Estados locais  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    condominium: '',
    block: '',
    unit: '',
    residentType: '' // owner, tenant, both
  });
  
  // Estados de paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10
  });

  // Estados do modal
  const [residentModal, setResidentModal] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'view'
    data: null
  });

  // Sincronizar condomínio selecionado com o contexto
  useEffect(() => {
    setContextSelectedCondominium(contextSelectedCondominium);
  }, [contextSelectedCondominium, setContextSelectedCondominium]);

  // Obter blocos do condomínio selecionado
  const getAvailableBlocks = () => {
    const condominiumId = filters.condominium || contextSelectedCondominium;
    if (!condominiumId) return [];
    
    const condominiumUnits = units.filter(unit => 
      unit.condominium_id?.toString() === condominiumId.toString()
    );
    
    const uniqueBlocks = condominiumUnits
      .filter(unit => unit.block)
      .reduce((acc, unit) => {
        if (!acc.find(block => block.id === unit.block.id)) {
          acc.push(unit.block);
        }
        return acc;
      }, []);
    
    return uniqueBlocks;
  };

  // Obter unidades do bloco selecionado
  const getAvailableUnits = () => {
    const condominiumId = filters.condominium || contextSelectedCondominium;
    let filteredUnits = units.filter(unit => 
      unit.condominium_id?.toString() === condominiumId.toString()
    );
    
    if (filters.block) {
      filteredUnits = filteredUnits.filter(unit => 
        unit.block?.id?.toString() === filters.block.toString()
      );
    }
    
    return filteredUnits;
  };

  // Função para atualizar filtros
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: value };
      
      // Se mudou o condomínio, limpar bloco e unidade
      if (filterName === 'condominium') {
        newFilters.block = '';
        newFilters.unit = '';
      }
      
      // Se mudou o bloco, limpar unidade
      if (filterName === 'block') {
        newFilters.unit = '';
      }
      
      return newFilters;
    });

    // Resetar paginação quando filtrar
    setPagination(current => ({ ...current, currentPage: 1 }));
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setFilters({
      condominium: '',
      block: '',
      unit: '',
      residentType: ''
    });
    setSearchTerm('');
    setContextSelectedCondominium('');
    setPagination(current => ({ ...current, currentPage: 1 }));
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setPagination(current => ({ ...current, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setPagination(() => ({ currentPage: 1, itemsPerPage }));
  };

  const getPaginatedData = (data) => {
    const { currentPage, itemsPerPage } = pagination;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Filtrar dados
  const getFilteredData = () => {
    // Usar dados do contexto
    let filtered = getResidentsByCondominium(filters.condominium || contextSelectedCondominium);

    // Filtrar por bloco
    if (filters.block) {
      filtered = filtered.filter(resident => 
        resident.unit?.block?.id?.toString() === filters.block.toString()
      );
    }

    // Filtrar por unidade
    if (filters.unit) {
      filtered = filtered.filter(resident => 
        resident.unit?.id?.toString() === filters.unit.toString()
      );
    }

    // Filtrar por tipo de morador
    if (filters.residentType) {
      if (filters.residentType === 'owner') {
        // Apenas proprietários (sem inquilino)
        filtered = filtered.filter(resident => !resident.has_tenant);
      } else if (filters.residentType === 'tenant') {
        // Apenas inquilinos
        filtered = filtered.filter(resident => resident.has_tenant);
      }
      // 'both' mostra todos, então não filtra
    }

    // Filtrar por busca (nome do proprietário ou inquilino)
    if (searchTerm) {
      filtered = filtered.filter(resident =>
        resident.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.owner?.phone?.includes(searchTerm) ||
        (resident.tenant?.has_tenant && resident.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (resident.tenant?.has_tenant && resident.tenant?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (resident.tenant?.has_tenant && resident.tenant?.phone?.includes(searchTerm)) ||
        resident.unit?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.unit?.block?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Funções do modal
  const openResidentModal = (mode, data = null) => {
    setResidentModal({
      isOpen: true,
      mode,
      data
    });
  };

  const closeResidentModal = () => {
    setResidentModal({
      isOpen: false,
      mode: 'create',
      data: null
    });
  };

  const handleResidentSave = async (savedResident) => {
    console.log('👥 ResidentsManagementPage - Morador salvo:', savedResident);
    
    try {
      // Usar o contexto para atualizar os dados
      if (residentModal.mode === 'create') {
        await handleCrudOperation('create', savedResident);
      } else if (residentModal.mode === 'edit') {
        await handleCrudOperation('update', savedResident);
      }
      
      console.log('✅ ResidentsManagementPage - Contexto atualizado com sucesso');
      closeResidentModal();
    } catch (error) {
      console.error('❌ ResidentsManagementPage - Erro ao atualizar contexto:', error);
    }
  };

  const handleDeleteResident = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este morador?')) {
      try {
        console.log('🗑️ ResidentsManagementPage - Excluindo morador:', id);
        
        // Chamar API para deletar
        await residentService.delete(id);
        
        // Atualizar contexto
        await handleCrudOperation('delete', { id });
        
        console.log('✅ ResidentsManagementPage - Morador excluído com sucesso');
      } catch (error) {
        console.error('❌ ResidentsManagementPage - Erro ao excluir morador:', error);
        alert('Erro ao excluir morador: ' + (error.message || 'Erro desconhecido'));
      }
    }
  };




  const getUnitStatusBadge = (status) => {
    const statusConfig = {
      occupied: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Ocupada' },
      vacant: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Vazia' },
      maintenance: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Manutenção' }
    };

    const config = statusConfig[status] || statusConfig.vacant;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {config.label}
      </span>
    );
  };

  // Renderizar tabela
  const renderResidentsTable = () => {
    const filteredData = getFilteredData();
    const paginatedData = getPaginatedData(filteredData);

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Unidade</th>
                <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Proprietário</th>
                <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Inquilino</th>
                <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Status</th>
                <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((resident) => (
                <tr key={resident.id} className={`border-b ${isDarkMode ? 'border-[#ff6600]/10 hover:bg-[#ff6600]/5' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                  {/* Unidade */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-[#ff6600]" />
                      <div>
                        <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{resident.unit?.number}</div>
                        <div className={`${isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-600'} text-sm`}>{resident.unit?.block?.name}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Proprietário */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{resident.owner.name}</div>
                        <div className={`${isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-600'} text-sm`}>{resident.owner.cpf}</div>
                        <div className="flex items-center space-x-1 text-xs">
                          <Mail className="w-3 h-3 text-[#ff6600]" />
                          <span className={isDarkMode ? 'text-[#f3f7f1]/70' : 'text-gray-600'}>{resident.owner.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Inquilino */}
                  <td className="py-4 px-4">
                    {resident.tenant.has_tenant ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{resident.tenant.name}</div>
                          <div className={`${isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-600'} text-sm`}>{resident.tenant.cpf}</div>
                          <div className="flex items-center space-x-1 text-xs">
                            <Mail className="w-3 h-3 text-[#ff6600]" />
                            <span className={isDarkMode ? 'text-[#f3f7f1]/70' : 'text-gray-600'}>{resident.tenant.email}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <span className={`${isDarkMode ? 'text-[#f3f7f1]/40' : 'text-gray-500'} text-sm`}>Sem inquilino</span>
                      </div>
                    )}
                  </td>
                  
                  {/* Status */}
                  <td className="py-4 px-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getUnitStatusBadge(resident.unit_status)}
                      </div>
                      {/* <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#f3f7f1]/60">Proprietário:</span>
                        {getStatusBadge(resident.owner.status)}
                      </div>
                      {resident.tenant.has_tenant && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#f3f7f1]/60">Inquilino:</span>
                          {getStatusBadge(resident.tenant.status)}
                        </div>
                      )} */}
                    </div>
                  </td>
                  
                  {/* Ações */}
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openResidentModal('view', resident)}
                        className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openResidentModal('edit', resident)}
                        className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteResident(resident.id)}
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
          currentPage={pagination.currentPage}
          totalItems={getFilteredData().length}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </>
    );
  };

  return (
    <Layout 
      title="Gerenciar Unidades e Moradores" 
      breadcrumbs={['Dashboard', 'Unidades e Moradores']}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gerenciar Unidades e Moradores</h2>
          <p className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}>Gerencie proprietários, inquilinos e vincule às unidades</p>
        </div>
        <button 
          onClick={() => openResidentModal('create')}
          className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Morador
        </button>
      </div>

      {/* Filtros Avançados */}
      <div className={`card mb-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <Search className="w-5 h-5 mr-2 text-[#ff6600]" />
              Filtros de Busca
            </h3>
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-sm text-[#ff6600] hover:bg-[#ff6600]/10 rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Busca por Nome */}
            <div className="lg:col-span-2">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Buscar por nome
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ff6600]" />
                <input
                  type="text"
                  placeholder="Nome do proprietário ou inquilino..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white placeholder-[#f3f7f1]/50' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
                />
              </div>
            </div>

            {/* Filtro por Condomínio */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Condomínio
              </label>
              <select
                value={filters.condominium}
                onChange={(e) => handleFilterChange('condominium', e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
              >
                <option value="">Todos</option>
                {condominiums.map((cond) => (
                  <option key={cond.id} value={cond.id.toString()}>
                    {cond.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Bloco */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Bloco/Torre
              </label>
              <select
                value={filters.block}
                onChange={(e) => handleFilterChange('block', e.target.value)}
                disabled={!filters.condominium && !contextSelectedCondominium}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Todos</option>
                {getAvailableBlocks().map((block) => (
                  <option key={block.id} value={block.id.toString()}>
                    {block.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Unidade */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Unidade
              </label>
              <select
                value={filters.unit}
                onChange={(e) => handleFilterChange('unit', e.target.value)}
                disabled={!filters.condominium && !contextSelectedCondominium}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Todas</option>
                {getAvailableUnits().map((unit) => (
                  <option key={unit.id} value={unit.id.toString()}>
                    {unit.number} {unit.block ? `- ${unit.block.name}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Tipo de Morador */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Tipo de Morador
              </label>
              <select
                value={filters.residentType}
                onChange={(e) => handleFilterChange('residentType', e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
              >
                <option value="">Todos</option>
                <option value="owner">Apenas Proprietários</option>
                <option value="tenant">Apenas com Inquilinos</option>
              </select>
            </div>
          </div>

          {/* Indicadores de Filtros Ativos */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {(filters.condominium || filters.block || filters.unit || filters.residentType || searchTerm) && (
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-600'}`}>Filtros ativos:</span>
                  {searchTerm && (
                    <span className="px-2 py-1 bg-[#ff6600]/20 text-[#ff6600] rounded text-xs">
                      Nome: "{searchTerm}"
                    </span>
                  )}
                  {filters.condominium && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      Condomínio
                    </span>
                  )}
                  {filters.block && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                      Bloco
                    </span>
                    )}
                  {filters.unit && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      Unidade
                    </span>
                  )}
                  {filters.residentType && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                      {filters.residentType === 'owner' ? 'Proprietários' : 'Com Inquilinos'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className={`card ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className='p-6'>
          {(loading || loadingResidents) ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6600]"></div>
            </div>
          ) : (
            <>
              {renderResidentsTable()}
              
              {/* Mensagem quando não há dados */}
              {getFilteredData().length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-[#ff6600]/40 mx-auto mb-4" />
                  <p className={`${isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-600'} mb-2`}>
                    Nenhum morador encontrado
                  </p>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                    {(searchTerm || filters.condominium || filters.block || filters.unit || filters.residentType) 
                      ? 'Tente ajustar os filtros para encontrar moradores' 
                      : 'Comece cadastrando uma unidade com morador'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Morador */}
      <ResidentModal
        isOpen={residentModal.isOpen}
        onClose={closeResidentModal}
        mode={residentModal.mode}
        resident={residentModal.data}
        condominiums={condominiums}
        units={units}
        onSave={handleResidentSave}
      />
    </Layout>
  );
};

export default ResidentsManagementPage;
