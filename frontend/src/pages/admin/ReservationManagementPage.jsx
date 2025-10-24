import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { Calendar, Clock, Settings, Plus, Edit, Eye, Trash2, Search, Building } from 'lucide-react';
import ReservationConfigModal from '../../components/modals/ReservationConfigModal';
import Pagination from '../../components/Pagination';
import { reservationConfigService } from '../../services/reservationService';
import api from '../../services/api';

const ReservationManagementPage = () => {
  const { isDarkMode } = useTheme();
  const [configs, setConfigs] = useState([]);
  const [reservableSpaces, setReservableSpaces] = useState([]);
  const [condominiums, setCondominiums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondominium, setSelectedCondominium] = useState('');
  
  // Estados de paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10
  });

  // Estados do modal
  const [configModal, setConfigModal] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'view'
    data: null
  });

  const loadCondominiums = useCallback(async () => {
    try {
      const response = await api.get('/condominiums');
      if (response.status === 'success') {
        setCondominiums(response.data);
        if (response.data.length > 0 && !selectedCondominium) {
          setSelectedCondominium(response.data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Erro ao carregar condomínios:', error);
    }
  }, [selectedCondominium]);

  const loadConfigs = useCallback(async () => {
    if (!selectedCondominium) return;
    
    setLoading(true);
    try {
      const response = await reservationConfigService.getByCondominium(selectedCondominium);
      if (response.status === 'success') {
        setConfigs(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCondominium]);

  const loadReservableSpaces = useCallback(async () => {
    if (!selectedCondominium) return;
    
    console.log('🏢 ReservationManagementPage - Carregando espaços reserváveis para condomínio:', selectedCondominium);
    try {
      const response = await reservationConfigService.getReservableSpaces(selectedCondominium);
      console.log('🏢 ReservationManagementPage - Resposta da API:', response);
      if (response.status === 'success') {
        setReservableSpaces(response.data);
        console.log('🏢 ReservationManagementPage - Espaços reserváveis carregados:', response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar espaços reserváveis:', error);
    }
  }, [selectedCondominium]);

  // Carregar dados iniciais
  useEffect(() => {
    loadCondominiums();
    if (selectedCondominium) {
      loadConfigs();
      loadReservableSpaces();
    }
  }, [selectedCondominium, loadCondominiums, loadConfigs, loadReservableSpaces]);

  // Funções do modal
  const openConfigModal = async (mode, data = null) => {
    // Recarregar espaços reserváveis antes de abrir o modal
    if (selectedCondominium) {
      await loadReservableSpaces();
    }
    
    setConfigModal({
      isOpen: true,
      mode,
      data
    });
  };

  const closeConfigModal = () => {
    setConfigModal({
      isOpen: false,
      mode: 'create',
      data: null
    });
  };

  const handleConfigSave = async () => {
    try {
      closeConfigModal();
      await loadConfigs();
      await loadReservableSpaces();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const handleDeleteConfig = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta configuração?')) {
      try {
        await reservationConfigService.delete(id);
        await loadConfigs();
        await loadReservableSpaces();
      } catch (error) {
        console.error('Erro ao excluir configuração:', error);
        alert('Erro ao excluir configuração. Tente novamente.');
      }
    }
  };

  // Filtrar dados
  const filteredConfigs = configs.filter(config => {
    const spaceName = config.space?.number?.toLowerCase() || '';
    const spaceType = config.space?.space_type?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return spaceName.includes(search) || spaceType.includes(search);
  });

  // Aplicar paginação
  const paginatedConfigs = filteredConfigs.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  // Funções de paginação
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setPagination(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
  };

  // Funções auxiliares
  const getSpaceTypeLabel = (type) => {
    const types = {
      storage: 'Depósito',
      gas_depot: 'Depósito de Gás',
      trash_depot: 'Depósito de Lixo',
      gym: 'Academia',
      party_hall: 'Salão de Festas',
      meeting_room: 'Sala de Reuniões',
      laundry: 'Lavanderia',
      storage_room: 'Depósito Geral',
      other: 'Outro'
    };
    return types[type] || type;
  };

  const getDaysFormatted = (days) => {
    const daysMap = {
      monday: 'Seg',
      tuesday: 'Ter',
      wednesday: 'Qua',
      thursday: 'Qui',
      friday: 'Sex',
      saturday: 'Sáb',
      sunday: 'Dom'
    };
    return days.map(day => daysMap[day] || day).join(', ');
  };

  const getStatusBadge = (active) => {
    return active ? (
      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
        Ativo
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
        Inativo
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 flex items-center`}>
              <Calendar className="w-8 h-8 mr-3 text-[#ff6600]" />
              Gerenciamento de Reservas
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Configure os espaços reserváveis e defina horários de disponibilidade
            </p>
          </div>
          
          <button
            onClick={() => openConfigModal('create')}
            className={`px-4 py-2 bg-[#ff6600] ${isDarkMode ? 'text-white' : 'text-white'} rounded-lg hover:bg-[#ff6600]/80 transition-colors flex items-center space-x-2`}
          >
            <Plus className="w-4 h-4" />
            <span>Nova Configuração</span>
          </button>
        </div>

        {/* Filtros */}
        <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg p-4 mb-6 border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Condomínio
              </label>
              <select
                value={selectedCondominium}
                onChange={(e) => setSelectedCondominium(e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="">Selecione um condomínio</option>
                {condominiums.map(condominium => (
                  <option key={condominium.id} value={condominium.id}>
                    {condominium.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Buscar
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por espaço..."
                  className={`w-full pl-10 pr-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  loadConfigs();
                }}
                className={`w-full px-4 py-2 ${isDarkMode ? 'text-white bg-gray-600' : 'text-white bg-orange-500'} rounded-lg hover:bg-gray-700 transition-colors`}
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Configurações Ativas</p>
                <p className="text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}">
                  {configs.filter(c => c.active).length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-[#ff6600]" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Espaços Reserváveis</p>
                <p className="text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}">
                  {reservableSpaces.length}
                </p>
              </div>
              <Building className="w-8 h-8 text-[#ff6600]" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Configurado</p>
                <p className="text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}">
                  {configs.length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-[#ff6600]" />
            </div>
          </div>
        </div>

        {/* Tabela de Configurações */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredConfigs.length > 0 ? (
          <>
            <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#ff6600]/20">
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Espaço</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Tipo</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Dias</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Horário</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Duração</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedConfigs.map((config) => (
                      <tr key={config.id} className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors">
                        <td className="py-4 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium">
                          {config.space?.number || 'N/A'}
                        </td>
                        <td className="py-4 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}">
                          {getSpaceTypeLabel(config.space?.space_type)}
                        </td>
                        <td className="py-4 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}">
                          {getDaysFormatted(config.available_days)}
                        </td>
                        <td className="py-4 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}">
                          {config.start_time} - {config.end_time}
                        </td>
                        <td className="py-4 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}">
                          {config.duration_minutes} min
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(config.active)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openConfigModal('view', config)}
                              className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openConfigModal('edit', config)}
                              className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteConfig(config.id)}
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
            </div>

            {/* Paginação */}
            <Pagination
              currentPage={pagination.currentPage}
              totalItems={filteredConfigs.length}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-[#ff6600]/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2">
              {selectedCondominium ? 'Nenhuma configuração encontrada' : 'Selecione um condomínio'}
            </h3>
            <p className="text-gray-400 mb-6">
              {selectedCondominium 
                ? 'Configure os espaços reserváveis para começar a gerenciar reservas.'
                : 'Escolha um condomínio para visualizar as configurações de reserva.'
              }
            </p>
            {selectedCondominium && (
              <button
                onClick={() => openConfigModal('create')}
                className={`px-4 py-2 bg-[#ff6600] ${isDarkMode ? 'text-white' : 'text-white'} rounded-lg hover:bg-[#ff6600]/80 transition-colors`}
              >
                Criar Primeira Configuração
              </button>
            )}
          </div>
        )}

        {/* Modal de Configuração */}
        <ReservationConfigModal
          isOpen={configModal.isOpen}
          onClose={closeConfigModal}
          mode={configModal.mode}
          config={configModal.data}
          condominiumId={selectedCondominium}
          reservableSpaces={reservableSpaces}
          onSave={handleConfigSave}
        />
      </div>
    </Layout>
  );
};

export default ReservationManagementPage;
