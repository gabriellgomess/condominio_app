import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  MapPin,
  User,
  Calendar,
  ChevronDown,
  FileText,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Layout, { useLayout } from '../../components/Layout';
import IncidentModal from '../../components/modals/IncidentModal';
import Pagination from '../../components/Pagination';
import { api } from '../../config/api';

// Componente interno com acesso ao Layout context
const IncidentsPageContent = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { markIncidentAsViewed, loadNotifications } = useLayout();
  const location = useLocation();
  const [incidents, setIncidents] = useState([]);
  const [condominiums, setCondominiums] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [units, setUnits] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    date_from: '',
    date_to: '',
    condominium_id: user?.condominium_id || ''
  });

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    recent: 0
  });

  const types = {
    'manutencao': 'Manutenção',
    'seguranca': 'Segurança',
    'ruido': 'Ruído/Barulho',
    'limpeza': 'Limpeza',
    'vizinhanca': 'Vizinhança',
    'outros': 'Outros'
  };

  const priorities = {
    'baixa': 'Baixa',
    'media': 'Média',
    'alta': 'Alta',
    'urgente': 'Urgente'
  };

  const statuses = {
    'aberta': 'Aberta',
    'em_andamento': 'Em Andamento',
    'resolvida': 'Resolvida',
    'fechada': 'Fechada'
  };

  const priorityColors = {
    'baixa': 'bg-green-100 text-green-800',
    'media': 'bg-yellow-100 text-yellow-800',
    'alta': 'bg-orange-100 text-orange-800',
    'urgente': 'bg-red-100 text-red-800'
  };

  const statusColors = {
    'aberta': 'bg-red-100 text-red-800',
    'em_andamento': 'bg-yellow-100 text-yellow-800',
    'resolvida': 'bg-green-100 text-green-800',
    'fechada': 'bg-gray-100 text-gray-800'
  };

  const statusIcons = {
    'aberta': AlertCircle,
    'em_andamento': Clock,
    'resolvida': CheckCircle2,
    'fechada': XCircle
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [filters, searchTerm, pagination.current_page]);

  // Detectar se veio de uma notificação para abrir o modal
  useEffect(() => {
    if (location.state?.openIncidentId && location.state?.incidentData) {
      setSelectedIncident(location.state.incidentData);
      setShowModal(true);

      // Limpar o state para evitar reabrir ao navegar de volta
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadInitialData = async () => {
    try {
      const [condosResponse, statsResponse] = await Promise.all([
        api.request(api.endpoints.condominiums),
        api.request(api.endpoints.incidentStats)
      ]);

      if (condosResponse.ok) {
        const condosData = await condosResponse.json();
        setCondominiums(condosData.data);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadIncidents = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        per_page: pagination.per_page,
        search: searchTerm,
        ...filters
      });

      const endpoint = filters.condominium_id
        ? `/api/condominiums/${filters.condominium_id}/incidents?${params}`
        : `${api.endpoints.incidents}?${params}`;

      const response = await api.request(endpoint);

      if (response.ok) {
        const data = await response.json();
        setIncidents(data.data.data);
        setPagination({
          current_page: data.data.current_page,
          last_page: data.data.last_page,
          per_page: data.data.per_page,
          total: data.data.total
        });
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnitsAndResidents = async (condominiumId) => {
    if (!condominiumId) return;

    try {
      const [unitsResponse, residentsResponse] = await Promise.all([
        api.request(api.endpoints.condominiumUnits(condominiumId)),
        api.request(api.endpoints.condominiumResidents(condominiumId))
      ]);

      if (unitsResponse.ok) {
        const unitsData = await unitsResponse.json();
        setUnits(unitsData.data);
      }

      if (residentsResponse.ok) {
        const residentsData = await residentsResponse.json();
        setResidents(residentsData.data);
      }
    } catch (error) {
      console.error('Error loading units and residents:', error);
    }
  };

  const handleSave = async (formData, incidentId = null) => {
    try {
      const url = incidentId ? `/api/incidents/${incidentId}` : '/api/incidents';
      const method = incidentId ? 'POST' : 'POST';

      if (incidentId) {
        formData.append('_method', 'PUT');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        loadIncidents();
        loadInitialData(); // Reload stats
        loadNotifications(); // Reload notifications to show new incident
        setShowModal(false);
        setSelectedIncident(null);
      }
    } catch (error) {
      console.error('Error saving incident:', error);
    }
  };

  const handleEdit = (incident) => {
    // Marcar como visualizada quando abrir o modal
    markIncidentAsViewed(incident.id);

    setSelectedIncident(incident);
    loadUnitsAndResidents(incident.condominium_id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta ocorrência?')) return;

    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        loadIncidents();
        loadInitialData(); // Reload stats
      }
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  const handleNewIncident = () => {
    setSelectedIncident(null);
    // Clear blocks, units and residents for new incident
    setBlocks([]);
    setUnits([]);
    setResidents([]);
    setShowModal(true);
  };

  // Handle blocks loading from modal
  const handleBlocksLoad = (loadedBlocks) => {
    setBlocks(loadedBlocks);
  };

  // Handle units loading from modal
  const handleUnitsLoad = (loadedUnits) => {
    setUnits(loadedUnits);
  };

  // Handle residents loading from modal
  const handleResidentsLoad = (loadedResidents) => {
    setResidents(loadedResidents);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      type: '',
      priority: '',
      date_from: '',
      date_to: '',
      condominium_id: user?.condominium_id || ''
    });
    setSearchTerm('');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const incidentDate = new Date(date);
    const diffInHours = Math.floor((now - incidentDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Há alguns minutos';
    if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;

    return formatDate(date);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Gerenciar Ocorrências
              </h1>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Registre e acompanhe ocorrências do condomínio
              </p>
            </div>
            <button
              onClick={handleNewIncident}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Ocorrência</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.total}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Abertas</p>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.in_progress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Resolvidas</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fechadas</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.closed}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recentes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.recent}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm mb-6`}>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Buscar ocorrências..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`
                      w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}
                    `}
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors
                  ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
                `}
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                {/* Condomínio */}
                {!user?.condominium_id && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Condomínio
                    </label>
                    <select
                      value={filters.condominium_id}
                      onChange={(e) => handleFilterChange('condominium_id', e.target.value)}
                      className={`
                        w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                        ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                      `}
                    >
                      <option value="">Todos</option>
                      {condominiums.map(condo => (
                        <option key={condo.id} value={condo.id}>{condo.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className={`
                      w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                    `}
                  >
                    <option value="">Todos</option>
                    {Object.entries(statuses).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Tipo */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Tipo
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className={`
                      w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                    `}
                  >
                    <option value="">Todos</option>
                    {Object.entries(types).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Prioridade */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Prioridade
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className={`
                      w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                    `}
                  >
                    <option value="">Todas</option>
                    {Object.entries(priorities).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className={`
                      w-full px-4 py-2 border rounded-lg transition-colors
                      ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    Limpar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Incidents List */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-900'}`}>
                Nenhuma ocorrência encontrada
              </h3>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Comece criando uma nova ocorrência.
              </p>
            </div>
          ) : (
            <>
              {/* Table Header - Desktop */}
              <div className={`hidden lg:block px-6 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-3">Ocorrência</div>
                  <div className="col-span-2">Tipo/Local</div>
                  <div className="col-span-2">Status/Prioridade</div>
                  <div className="col-span-2">Responsável</div>
                  <div className="col-span-2">Data</div>
                  <div className="col-span-1">Ações</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {incidents.map((incident) => {
                  const StatusIcon = statusIcons[incident.status];

                  return (
                    <div
                      key={incident.id}
                      className={`p-6 hover:bg-opacity-50 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      {/* Desktop Layout */}
                      <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3">
                          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {incident.title}
                          </h3>
                          <p className={`text-sm mt-1 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {incident.description}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <div className="flex flex-col space-y-1">
                            <span className="text-xs font-medium text-gray-500 uppercase">
                              {types[incident.type]}
                            </span>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{incident.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="flex flex-col space-y-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[incident.status]}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statuses[incident.status]}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[incident.priority]}`}>
                              {priorities[incident.priority]}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {incident.user?.name || 'N/A'}
                              </p>
                              {incident.resident && (
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {incident.resident.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatRelativeTime(incident.incident_date)}
                              </p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatDate(incident.incident_date)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-1">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(incident)}
                              className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(incident.id)}
                              className="p-1 rounded-lg transition-colors hover:bg-red-100 text-red-600"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="lg:hidden space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {incident.title}
                            </h3>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {incident.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEdit(incident)}
                              className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(incident.id)}
                              className="p-1 rounded-lg transition-colors hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[incident.status]}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statuses[incident.status]}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[incident.priority]}`}>
                            {priorities[incident.priority]}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {types[incident.type]}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{incident.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatRelativeTime(incident.incident_date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  currentPage={pagination.current_page}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.per_page}
                  onPageChange={(page) => {
                    setPagination(prev => ({ ...prev, current_page: page }));
                    loadIncidents(page);
                  }}
                  onItemsPerPageChange={(newPerPage) => {
                    setPagination(prev => ({
                      ...prev,
                      per_page: newPerPage,
                      current_page: 1
                    }));
                    // Recarregar dados com novo per_page
                    setTimeout(() => loadIncidents(1), 0);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <IncidentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedIncident(null);
        }}
        incident={selectedIncident}
        onSave={handleSave}
        condominiums={condominiums}
        blocks={blocks}
        units={units}
        residents={residents}
        onBlocksLoad={handleBlocksLoad}
        onUnitsLoad={handleUnitsLoad}
        onResidentsLoad={handleResidentsLoad}
      />
    </>
  );
};

// Wrapper component que fornece o Layout
const IncidentsPage = () => {
  return (
    <Layout>
      <IncidentsPageContent />
    </Layout>
  );
};

export default IncidentsPage;