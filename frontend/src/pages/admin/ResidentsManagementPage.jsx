import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useStructure } from '../../contexts/StructureContext';
import { Users, Plus, Edit, Eye, Trash2, Search, User, Phone, Mail, Home, Building } from 'lucide-react';
import Pagination from '../../components/Pagination';
import ResidentModal from '../../components/modals/ResidentModal';

const ResidentsManagementPage = () => {
  const { condominiums, units, loading } = useStructure();
  
  // Estados locais
  const [residents, setResidents] = useState([]);
  const [selectedCondominium, setSelectedCondominium] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingResidents, setLoadingResidents] = useState(false);
  
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

  // Mock data para moradores (substituir por API real)
  useEffect(() => {
    // Simular carregamento de moradores
    const mockResidents = [
      {
        id: 1,
        unit_id: 1,
        unit: { number: '101', block: { name: 'Torre A' } },
        condominium_id: 1,
        condominium: { name: 'Condomínio Verdes Mares' },
        unit_status: 'occupied',
        owner: {
          name: 'João Silva',
          email: 'joao.silva@email.com',
          phone: '(11) 99999-9999',
          cpf: '123.456.789-00',
          status: 'active'
        },
        tenant: {
          has_tenant: true,
          name: 'Maria Santos',
          email: 'maria.santos@email.com',
          phone: '(11) 88888-8888',
          cpf: '987.654.321-00',
          status: 'active',
          lease_start: '2024-01-01',
          lease_end: '2024-12-31'
        },
        has_tenant: true,
        total_residents: 2,
        created_at: '2024-01-15'
      },
      {
        id: 2,
        unit_id: 2,
        unit: { number: '102', block: { name: 'Torre A' } },
        condominium_id: 1,
        condominium: { name: 'Condomínio Verdes Mares' },
        unit_status: 'occupied',
        owner: {
          name: 'Pedro Oliveira',
          email: 'pedro.oliveira@email.com',
          phone: '(11) 77777-7777',
          cpf: '111.222.333-44',
          status: 'active'
        },
        tenant: {
          has_tenant: false,
          name: '',
          email: '',
          phone: '',
          cpf: '',
          status: 'inactive'
        },
        has_tenant: false,
        total_residents: 1,
        created_at: '2024-01-20'
      }
    ];
    
    setResidents(mockResidents);
  }, []);

  // Funções de paginação
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setPagination(prev => ({ currentPage: 1, itemsPerPage }));
  };

  const getPaginatedData = (data) => {
    const { currentPage, itemsPerPage } = pagination;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Filtrar dados
  const getFilteredData = () => {
    let filtered = residents;

    // Filtrar por condomínio
    if (selectedCondominium) {
      filtered = filtered.filter(resident => 
        resident.condominium_id.toString() === selectedCondominium
      );
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(resident =>
        resident.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.owner.phone.includes(searchTerm) ||
        (resident.tenant.has_tenant && resident.tenant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (resident.tenant.has_tenant && resident.tenant.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (resident.tenant.has_tenant && resident.tenant.phone.includes(searchTerm)) ||
        resident.unit?.number.toLowerCase().includes(searchTerm.toLowerCase())
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
    try {
      // Aqui você implementaria a lógica de salvar na API
      console.log('Morador salvo:', savedResident);
      
      if (residentModal.mode === 'create') {
        setResidents(prev => [...prev, { ...savedResident, id: Date.now() }]);
      } else {
        setResidents(prev => prev.map(r => 
          r.id === savedResident.id ? savedResident : r
        ));
      }
      
      closeResidentModal();
    } catch (error) {
      console.error('Erro ao salvar morador:', error);
    }
  };

  const handleDeleteResident = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este morador?')) {
      try {
        // Aqui você implementaria a lógica de deletar na API
        setResidents(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error('Erro ao excluir morador:', error);
      }
    }
  };

  // Funções auxiliares
  const getTypeLabel = (type) => {
    const types = {
      owner: 'Proprietário',
      tenant: 'Inquilino',
      resident: 'Morador'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Ativo' },
      inactive: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Inativo' },
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Pendente' }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {config.label}
      </span>
    );
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
              <tr className="border-b border-[#31a196]/20">
                <th className="text-left py-3 px-4 text-[#31a196] font-medium">Unidade</th>
                <th className="text-left py-3 px-4 text-[#31a196] font-medium">Proprietário</th>
                <th className="text-left py-3 px-4 text-[#31a196] font-medium">Inquilino</th>
                <th className="text-left py-3 px-4 text-[#31a196] font-medium">Status</th>
                <th className="text-left py-3 px-4 text-[#31a196] font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((resident) => (
                <tr key={resident.id} className="border-b border-[#31a196]/10 hover:bg-[#31a196]/5 transition-colors">
                  {/* Unidade */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-[#31a196]" />
                      <div>
                        <div className="text-white font-medium">{resident.unit?.number}</div>
                        <div className="text-[#f3f7f1]/60 text-sm">{resident.unit?.block?.name}</div>
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
                        <div className="text-white font-medium">{resident.owner.name}</div>
                        <div className="text-[#f3f7f1]/60 text-sm">{resident.owner.cpf}</div>
                        <div className="flex items-center space-x-1 text-xs">
                          <Mail className="w-3 h-3 text-[#31a196]" />
                          <span className="text-[#f3f7f1]/70">{resident.owner.email}</span>
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
                          <div className="text-white font-medium">{resident.tenant.name}</div>
                          <div className="text-[#f3f7f1]/60 text-sm">{resident.tenant.cpf}</div>
                          <div className="flex items-center space-x-1 text-xs">
                            <Mail className="w-3 h-3 text-[#31a196]" />
                            <span className="text-[#f3f7f1]/70">{resident.tenant.email}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <span className="text-[#f3f7f1]/40 text-sm">Sem inquilino</span>
                      </div>
                    )}
                  </td>
                  
                  {/* Status */}
                  <td className="py-4 px-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#f3f7f1]/60">Unidade:</span>
                        {getUnitStatusBadge(resident.unit_status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#f3f7f1]/60">Proprietário:</span>
                        {getStatusBadge(resident.owner.status)}
                      </div>
                      {resident.tenant.has_tenant && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#f3f7f1]/60">Inquilino:</span>
                          {getStatusBadge(resident.tenant.status)}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Ações */}
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openResidentModal('view', resident)}
                        className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openResidentModal('edit', resident)}
                        className="p-2 text-[#31a196] hover:bg-[#31a196]/20 rounded-lg transition-colors"
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
          <h2 className="text-2xl font-bold text-white">Gerenciar Unidades e Moradores</h2>
          <p className="text-[#f3f7f1]">Gerencie proprietários, inquilinos e vincule às unidades</p>
        </div>
        <button 
          onClick={() => openResidentModal('create')}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Unidade/Morador
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#31a196]/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email, telefone ou unidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent"
                />
              </div>
            </div>
            <div className="min-w-[200px]">
              <select
                value={selectedCondominium}
                onChange={(e) => setSelectedCondominium(e.target.value)}
                className="w-full px-4 py-2 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent"
              >
                <option value="">Todos os condomínios</option>
                {condominiums.map((cond) => (
                  <option key={cond.id} value={cond.id.toString()}>
                    {cond.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="p-6">
          {loadingResidents ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#31a196]"></div>
            </div>
          ) : (
            <>
              {renderResidentsTable()}
              
              {/* Mensagem quando não há dados */}
              {getFilteredData().length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-[#31a196]/40 mx-auto mb-4" />
                  <p className="text-[#f3f7f1]/60 mb-2">
                    Nenhum morador encontrado
                  </p>
                  <p className="text-white font-medium">
                    {searchTerm || selectedCondominium ? 'Tente ajustar os filtros' : 'Comece cadastrando uma unidade com morador'}
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
