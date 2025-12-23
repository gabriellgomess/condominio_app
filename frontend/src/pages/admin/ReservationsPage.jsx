import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Calendar, Clock, Plus, Edit, Eye, Trash2, Search, Building, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import ReservationModal from '../../components/modals/ReservationModal';
import Pagination from '../../components/Pagination';
import AvailabilityCalendar from '../../components/calendar/AvailabilityCalendar';
import { reservationService, reservationConfigService } from '../../services/reservationService';
import api from '../../services/api';

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [configuredSpaces, setConfiguredSpaces] = useState([]);
  const [condominiums, setCondominiums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondominium, setSelectedCondominium] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [spaceFilter, setSpaceFilter] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'calendar'
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [spaceAvailabilityConfig, setSpaceAvailabilityConfig] = useState(null);
  
  // Estados de paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10
  });

  // Estados do modal
  const [reservationModal, setReservationModal] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'view'
    data: null
  });

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadCondominiums();
    if (selectedCondominium) {
      loadReservations();
      loadConfiguredSpaces();
    }
  }, [selectedCondominium, statusFilter, spaceFilter]);

  // Carregar configuração de disponibilidade quando o espaço for selecionado
  useEffect(() => {
    if (spaceFilter) {
      loadSpaceAvailabilityConfig(parseInt(spaceFilter));
    } else {
      setSpaceAvailabilityConfig(null);
    }
  }, [spaceFilter]);

  const loadCondominiums = async () => {
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
  };

  const loadReservations = async () => {
    if (!selectedCondominium) return;
    
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (spaceFilter) params.space_id = spaceFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await reservationService.getByCondominium(selectedCondominium, params);
      if (response.status === 'success') {
        setReservations(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguredSpaces = async () => {
    if (!selectedCondominium) return;
    
    console.log('🏢 ReservationsPage - loadConfiguredSpaces iniciado para condomínio:', selectedCondominium);
    try {
      const response = await reservationService.getConfiguredSpaces(selectedCondominium);
      console.log('🏢 ReservationsPage - Resposta de getConfiguredSpaces:', response);
      console.log('🏢 ReservationsPage - response.status:', response.status);
      console.log('🏢 ReservationsPage - response.data:', response.data);
      
      if (response.status === 'success') {
        console.log('✅ ReservationsPage - Espaços configurados carregados:', response.data?.length || 0);
        response.data?.forEach((config, index) => {
          console.log(`  📍 Config ${index + 1}:`, {
            id: config.id,
            space_id: config.space_id,
            space: config.space,
            active: config.active
          });
        });
        setConfiguredSpaces(response.data);
      } else {
        console.log('⚠️ ReservationsPage - Status não é success:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar espaços configurados:', error);
    }
  };

  // Carregar configuração de disponibilidade de um espaço
  const loadSpaceAvailabilityConfig = async (spaceId) => {
    if (!spaceId) {
      setSpaceAvailabilityConfig(null);
      return;
    }
    
    try {
      const response = await reservationService.getAvailabilityConfig(spaceId);
      setSpaceAvailabilityConfig(response.data.data);
      console.log('🔧 ReservationsPage - Configuração de disponibilidade carregada:', response.data.data);
    } catch (error) {
      console.error('Erro ao carregar configuração de disponibilidade:', error);
      setSpaceAvailabilityConfig(null);
    }
  };

  // Funções do modal
  const openReservationModal = (mode, data = null) => {
    setReservationModal({
      isOpen: true,
      mode,
      data
    });
  };

  const closeReservationModal = () => {
    setReservationModal({
      isOpen: false,
      mode: 'create',
      data: null
    });
  };

  const handleReservationSave = async (savedReservation) => {
    try {
      closeReservationModal();
      await loadReservations();
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
    }
  };

  const handleConfirmReservation = async (id) => {
    if (window.confirm('Tem certeza que deseja confirmar esta reserva?')) {
      try {
        await reservationService.confirm(id);
        await loadReservations();
      } catch (error) {
        console.error('Erro ao confirmar reserva:', error);
        alert('Erro ao confirmar reserva. Tente novamente.');
      }
    }
  };

  const handleCancelReservation = async (id) => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      try {
        await reservationService.cancel(id);
        await loadReservations();
      } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        alert('Erro ao cancelar reserva. Tente novamente.');
      }
    }
  };

  // Filtrar dados
  const filteredReservations = reservations.filter(reservation => {
    const contactName = reservation.contact_name?.toLowerCase() || '';
    const eventType = reservation.event_type?.toLowerCase() || '';
    const spaceName = reservation.space?.number?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return contactName.includes(search) || eventType.includes(search) || spaceName.includes(search);
  });

  // Aplicar paginação
  const paginatedReservations = filteredReservations.slice(
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
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pendente', icon: AlertCircle },
      confirmed: { color: 'bg-green-500/20 text-green-400', label: 'Confirmada', icon: CheckCircle },
      cancelled: { color: 'bg-red-500/20 text-red-400', label: 'Cancelada', icon: XCircle },
      completed: { color: 'bg-blue-500/20 text-blue-400', label: 'Concluída', icon: CheckCircle },
      rejected: { color: 'bg-red-500/20 text-red-400', label: 'Rejeitada', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`px-2 py-1 ${config.color} rounded-full text-xs font-medium flex items-center space-x-1`}>
        <IconComponent className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // HH:MM
  };

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

  // Renderizar reservas como cards (mobile)
  const renderReservationCards = () => {
    return (
      <div className="space-y-4">
        {paginatedReservations.map((reservation) => (
          <div key={reservation.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#ff6600]/20">
            {/* Cabeçalho do card */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#ff6600]" />
                  <span className="text-white font-medium">
                    {formatDate(reservation.reservation_date)}
                  </span>
                  <Clock className="w-4 h-4 text-[#ff6600] ml-2" />
                  <span className="text-white font-medium">
                    {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-[#f3f7f1] text-sm">
                    {reservation.space?.number}
                  </span>
                  <span className="text-gray-400 text-xs">•</span>
                  <span className="text-gray-400 text-sm">
                    {getSpaceTypeLabel(reservation.space?.space_type)}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                {getStatusBadge(reservation.status)}
              </div>
            </div>

            {/* Informações do evento */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Responsável:</span>
                <span className="text-white text-sm font-medium">{reservation.contact_name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Telefone:</span>
                <span className="text-[#f3f7f1] text-sm">{reservation.contact_phone}</span>
              </div>

              {reservation.event_type && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">Evento:</span>
                  <span className="text-[#f3f7f1] text-sm">{reservation.event_type}</span>
                </div>
              )}

              {reservation.expected_guests && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">Convidados:</span>
                  <span className="text-[#f3f7f1] text-sm">{reservation.expected_guests}</span>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-700">
              <button 
                onClick={() => openReservationModal('view', reservation)}
                className="flex-1 min-w-[80px] px-3 py-2 text-[#ff6600] border border-[#ff6600]/30 rounded-lg hover:bg-[#ff6600]/10 transition-colors flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Ver</span>
              </button>
              
              {reservation.status === 'pending' && (
                <button 
                  onClick={() => handleConfirmReservation(reservation.id)}
                  className="flex-1 min-w-[80px] px-3 py-2 text-green-400 border border-green-400/30 rounded-lg hover:bg-green-500/10 transition-colors flex items-center justify-center space-x-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Confirmar</span>
                </button>
              )}
              
              {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                <>
                  <button 
                    onClick={() => openReservationModal('edit', reservation)}
                    className="flex-1 min-w-[80px] px-3 py-2 text-blue-400 border border-blue-400/30 rounded-lg hover:bg-blue-500/10 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Editar</span>
                  </button>
                  <button 
                    onClick={() => handleCancelReservation(reservation.id)}
                    className="flex-1 min-w-[80px] px-3 py-2 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Cancelar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center">
              <Calendar className="w-8 h-8 mr-3 text-[#ff6600]" />
              Reservas
            </h1>
            <p className="text-gray-400">
              Gerencie as reservas dos espaços do condomínio
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Botões de visualização */}
            <div className="flex bg-[#2a2a2a] rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-[#ff6600] text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-[#ff6600] text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Calendário
              </button>
            </div>
            
            <button
              onClick={() => openReservationModal('create')}
              className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Reserva</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Condomínio
              </label>
              <select
                value={selectedCondominium}
                onChange={(e) => setSelectedCondominium(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none"
              >
                <option value="">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
                <option value="completed">Concluída</option>
                <option value="rejected">Rejeitada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Espaço
              </label>
              <select
                value={spaceFilter}
                onChange={(e) => setSpaceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none"
              >
                <option value="">Selecione um espaço</option>
                {configuredSpaces.map(config => (
                  <option key={config.space_id} value={config.space_id}>
                    {config.space?.number} - {getSpaceTypeLabel(config.space?.space_type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, evento..."
                  className="w-full pl-10 pr-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setSpaceFilter('');
                  loadReservations();
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-[#1a1a1a] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Reservas</p>
                <p className="text-2xl font-bold text-white">
                  {reservations.length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-[#ff6600]" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {reservations.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Confirmadas</p>
                <p className="text-2xl font-bold text-green-400">
                  {reservations.filter(r => r.status === 'confirmed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Este Mês</p>
                <p className="text-2xl font-bold text-white">
                  {reservations.filter(r => {
                    const reservationMonth = new Date(r.reservation_date).getMonth();
                    const currentMonth = new Date().getMonth();
                    return reservationMonth === currentMonth;
                  }).length}
                </p>
              </div>
              <Building className="w-8 h-8 text-[#ff6600]" />
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : viewMode === 'calendar' ? (
          /* Visualização em Calendário */
          spaceFilter ? (
            <AvailabilityCalendar
              reservations={filteredReservations}
              selectedSpace={configuredSpaces.find(s => s.space_id === parseInt(spaceFilter))?.space}
              spaceConfig={configuredSpaces.find(s => s.space_id === parseInt(spaceFilter))}
              onDateSelect={setSelectedCalendarDate}
              selectedDate={selectedCalendarDate}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-[#1a1a1a] rounded-lg">
              <Calendar className="w-16 h-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Selecione um Espaço
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Para visualizar o calendário de disponibilidade, selecione um espaço específico no filtro acima.
              </p>
            </div>
          )
        ) : filteredReservations.length > 0 ? (
          /* Visualização em Lista */
          <>
            {/* Cards para mobile, tabela para desktop */}
            {isMobile ? (
              renderReservationCards()
            ) : (
              <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#ff6600]/20">
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Data</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Horário</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Espaço</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Responsável</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Evento</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors">
                        <td className="py-4 px-4 text-white font-medium">
                          {formatDate(reservation.reservation_date)}
                        </td>
                        <td className="py-4 px-4 text-[#f3f7f1]">
                          {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                        </td>
                        <td className="py-4 px-4 text-[#f3f7f1]">
                          <div>
                            <div className="font-medium">{reservation.space?.number}</div>
                            <div className="text-sm text-gray-400">
                              {getSpaceTypeLabel(reservation.space?.space_type)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#f3f7f1]">
                          <div>
                            <div className="font-medium">{reservation.contact_name}</div>
                            <div className="text-sm text-gray-400">{reservation.contact_phone}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#f3f7f1]">
                          <div>
                            <div className="font-medium">{reservation.event_type || 'Não informado'}</div>
                            {reservation.expected_guests && (
                              <div className="text-sm text-gray-400">
                                {reservation.expected_guests} convidados
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(reservation.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openReservationModal('view', reservation)}
                              className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {reservation.status === 'pending' && (
                              <button 
                                onClick={() => handleConfirmReservation(reservation.id)}
                                className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="Confirmar"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                              <>
                                <button 
                                  onClick={() => openReservationModal('edit', reservation)}
                                  className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleCancelReservation(reservation.id)}
                                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                  title="Cancelar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Paginação - apenas na visualização em lista */}
            <Pagination
              currentPage={pagination.currentPage}
              totalItems={filteredReservations.length}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-[#ff6600]/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {selectedCondominium ? 'Nenhuma reserva encontrada' : 'Selecione um condomínio'}
            </h3>
            <p className="text-gray-400 mb-6">
              {selectedCondominium 
                ? 'Não há reservas cadastradas com os filtros aplicados.'
                : 'Escolha um condomínio para visualizar as reservas.'
              }
            </p>
            {selectedCondominium && (
              <button
                onClick={() => openReservationModal('create')}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors"
              >
                Criar Primeira Reserva
              </button>
            )}
          </div>
        )}

        {/* Modal de Reserva */}
        <ReservationModal
          isOpen={reservationModal.isOpen}
          onClose={closeReservationModal}
          mode={reservationModal.mode}
          reservation={reservationModal.data}
          condominiumId={selectedCondominium}
          configuredSpaces={configuredSpaces}
          onSave={handleReservationSave}
        />
      </div>
    </Layout>
  );
};

export default ReservationsPage;
