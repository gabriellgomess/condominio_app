import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { useStructure } from '../../contexts/StructureContext';
import { useAuth } from '../../contexts/AuthContext';
import visitorService from '../../services/visitorService';
import {
  Users,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Trash2,
  Filter,
  Calendar,
  Clock,
  User,
  Car,
  Phone,
  MapPin,
  LogIn,
  LogOut,
  FileText,
  Building
} from 'lucide-react';
import Pagination from '../../components/Pagination';
import ViewVisitorModal from '../../components/modals/ViewVisitorModal';
import ValidateVisitorModal from '../../components/modals/ValidateVisitorModal';
import CheckInOutModal from '../../components/modals/CheckInOutModal';

const VisitorsPage = () => {
  const { isDarkMode } = useTheme();
  const { units, selectedCondominium, condominiums } = useStructure();
  const { user } = useAuth();

  // Estados principais
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    scheduled: 0,
    checked_in: 0,
    checked_out: 0
  });

  // Estado para condomínio selecionado localmente (para SuperAdmin)
  const [localSelectedCondominium, setLocalSelectedCondominium] = useState('');

  // Estados de filtro e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    visitor_type: '',
    unit_id: '',
    scheduled_date: ''
  });

  // Estados de paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    total: 0
  });

  // Estados dos modais
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
  const [validateModal, setValidateModal] = useState({ isOpen: false, data: null });
  const [checkInOutModal, setCheckInOutModal] = useState({ isOpen: false, data: null, action: null });

  // Verificar se é SuperAdmin
  const isSuperAdmin = user?.access_level === 'superadmin';

  // Usar localSelectedCondominium se for SuperAdmin, senão usar selectedCondominium ou user.condominium_id
  const condominiumId = isSuperAdmin
    ? localSelectedCondominium
    : (selectedCondominium || user?.condominium_id);

  // Configuração de status
  const statusConfig = {
    pending: {
      label: 'Aguardando Validação',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      icon: AlertTriangle
    },
    scheduled: {
      label: 'Agendado',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      icon: Calendar
    },
    checked_in: {
      label: 'No Condomínio',
      color: 'text-green-600',
      bg: 'bg-green-100',
      icon: CheckCircle
    },
    checked_out: {
      label: 'Saiu',
      color: 'text-gray-600',
      bg: 'bg-gray-100',
      icon: CheckCircle
    },
    cancelled: {
      label: 'Cancelado',
      color: 'text-red-600',
      bg: 'bg-red-100',
      icon: XCircle
    },
    rejected: {
      label: 'Rejeitado',
      color: 'text-red-600',
      bg: 'bg-red-100',
      icon: XCircle
    }
  };

  // Tipos de visitante
  const visitorTypes = {
    personal: 'Visitante',
    service: 'Prestador de Serviço',
    delivery: 'Entregador',
    taxi: 'Taxi/App',
    other: 'Outro'
  };

  // Carregar visitantes
  const loadVisitors = async () => {
    if (!condominiumId) {
      console.log('Condominium ID não encontrado');
      setLoading(false);
      return;
    }

    console.log('Carregando visitantes para condomínio:', condominiumId);
    setLoading(true);
    try {
      // Criar params apenas com valores não vazios
      const params = {
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage
      };

      // Adicionar search apenas se tiver valor
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Adicionar filtros apenas se tiverem valor
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      console.log('Parâmetros da requisição:', params);
      const response = await visitorService.listVisitors(condominiumId, params);
      console.log('Resposta da API:', response);

      if (response.data) {
        setVisitors(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.total || response.data.length || 0
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar visitantes:', error);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadStats = () => {
    if (!visitors || visitors.length === 0) {
      setStats({
        total: 0,
        pending: 0,
        scheduled: 0,
        checked_in: 0,
        checked_out: 0
      });
      return;
    }

    const newStats = {
      total: visitors.length,
      pending: visitors.filter(v => v.status === 'pending').length,
      scheduled: visitors.filter(v => v.status === 'scheduled').length,
      checked_in: visitors.filter(v => v.status === 'checked_in').length,
      checked_out: visitors.filter(v => v.status === 'checked_out').length
    };

    setStats(newStats);
  };

  useEffect(() => {
    loadVisitors();
  }, [pagination.currentPage, filters, condominiumId]);

  useEffect(() => {
    loadStats();
  }, [visitors]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (pagination.currentPage === 1) {
        loadVisitors();
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Handlers
  const handleView = (visitor) => {
    setViewModal({ isOpen: true, data: visitor });
  };

  const handleValidate = (visitor) => {
    setValidateModal({ isOpen: true, data: visitor });
  };

  const handleCheckIn = (visitor) => {
    setCheckInOutModal({ isOpen: true, data: visitor, action: 'check-in' });
  };

  const handleCheckOut = (visitor) => {
    setCheckInOutModal({ isOpen: true, data: visitor, action: 'check-out' });
  };

  const handleDelete = async (visitorId) => {
    if (!window.confirm('Tem certeza que deseja excluir este visitante?')) return;

    try {
      await visitorService.deleteVisitor(visitorId);
      loadVisitors();
    } catch (error) {
      console.error('Erro ao excluir visitante:', error);
      alert('Erro ao excluir visitante');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      visitor_type: '',
      unit_id: '',
      scheduled_date: ''
    });
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    }
    return timeString;
  };

  const getUnitLabel = (unit) => {
    if (!unit) return '-';
    return `${unit.block || ''} ${unit.number || ''}`.trim();
  };

  return (
    <Layout>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Gestão de Visitantes
                </h1>
                <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Gerencie visitantes, validações e acessos
                </p>
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.total}
                  </p>
                </div>
                <Users className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Aguardando
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Agendados
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.scheduled}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No Condomínio
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.checked_in}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Saíram
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stats.checked_out}
                  </p>
                </div>
                <LogOut className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
            {/* Seletor de Condomínio (apenas para SuperAdmin) */}
            {isSuperAdmin && (
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Selecione o Condomínio
                </label>
                <select
                  value={localSelectedCondominium}
                  onChange={(e) => setLocalSelectedCondominium(e.target.value)}
                  className={`w-full md:w-1/2 px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                >
                  <option value="">Selecione um condomínio...</option>
                  {condominiums.map((cond) => (
                    <option key={cond.id} value={cond.id}>
                      {cond.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Busca */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, documento ou placa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  />
                </div>
              </div>

              {/* Filtro de Status */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                >
                  <option value="">Todos os status</option>
                  <option value="pending">Aguardando</option>
                  <option value="scheduled">Agendado</option>
                  <option value="checked_in">No Condomínio</option>
                  <option value="checked_out">Saiu</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>

              {/* Filtro de Tipo */}
              <div>
                <select
                  value={filters.visitor_type}
                  onChange={(e) => handleFilterChange('visitor_type', e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                >
                  <option value="">Todos os tipos</option>
                  <option value="personal">Visitante</option>
                  <option value="service">Prestador de Serviço</option>
                  <option value="delivery">Entregador</option>
                  <option value="taxi">Taxi/App</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              {/* Botão Limpar Filtros */}
              <div>
                <button
                  onClick={clearFilters}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Tabela de Visitantes */}
          <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
            {!condominiumId && isSuperAdmin ? (
              <div className="text-center py-12">
                <Building className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Selecione um condomínio
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Por favor, selecione um condomínio acima para visualizar os visitantes.
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : visitors.length === 0 ? (
              <div className="text-center py-12">
                <Users className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Nenhum visitante encontrado
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Nenhum visitante corresponde aos filtros selecionados.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Visitante
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Unidade
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Agendamento
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Status
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {visitors.map((visitor) => {
                        const status = statusConfig[visitor.status] || statusConfig.pending;
                        const StatusIcon = status.icon;

                        return (
                          <tr
                            key={visitor.id}
                            className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <User className={`w-10 h-10 p-2 rounded-full ${
                                  isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                                }`} />
                                <div className="ml-4">
                                  <div className={`text-sm font-medium ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {visitor.name}
                                  </div>
                                  <div className={`text-sm ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {visitorTypes[visitor.visitor_type] || visitor.visitor_type}
                                  </div>
                                  {visitor.phone && (
                                    <div className={`text-xs ${
                                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                      {visitor.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                {getUnitLabel(visitor.unit)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                {formatDate(visitor.scheduled_date)}
                                {visitor.scheduled_time && (
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {formatTime(visitor.scheduled_time)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleView(visitor)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Visualizar"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>

                                {visitor.status === 'pending' && (
                                  <button
                                    onClick={() => handleValidate(visitor)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Validar"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                )}

                                {visitor.status === 'scheduled' && (
                                  <button
                                    onClick={() => handleCheckIn(visitor)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Check-in"
                                  >
                                    <LogIn className="w-5 h-5" />
                                  </button>
                                )}

                                {visitor.status === 'checked_in' && (
                                  <button
                                    onClick={() => handleCheckOut(visitor)}
                                    className="text-orange-600 hover:text-orange-900"
                                    title="Check-out"
                                  >
                                    <LogOut className="w-5 h-5" />
                                  </button>
                                )}

                                {(visitor.status === 'pending' || visitor.status === 'rejected') && (
                                  <button
                                    onClick={() => handleDelete(visitor.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {pagination.total > pagination.itemsPerPage && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={Math.ceil(pagination.total / pagination.itemsPerPage)}
                      onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      {viewModal.isOpen && (
        <ViewVisitorModal
          visitor={viewModal.data}
          onClose={() => setViewModal({ isOpen: false, data: null })}
          isDarkMode={isDarkMode}
        />
      )}

      {validateModal.isOpen && (
        <ValidateVisitorModal
          visitor={validateModal.data}
          onClose={() => setValidateModal({ isOpen: false, data: null })}
          onSuccess={() => {
            setValidateModal({ isOpen: false, data: null });
            loadVisitors();
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {checkInOutModal.isOpen && (
        <CheckInOutModal
          visitor={checkInOutModal.data}
          action={checkInOutModal.action}
          onClose={() => setCheckInOutModal({ isOpen: false, data: null, action: null })}
          onSuccess={() => {
            setCheckInOutModal({ isOpen: false, data: null, action: null });
            loadVisitors();
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </Layout>
  );
};

export default VisitorsPage;
