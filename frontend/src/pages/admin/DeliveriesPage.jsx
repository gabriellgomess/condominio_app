import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { useStructure } from '../../contexts/StructureContext';
import deliveryService from '../../services/deliveryService';
import {
  Package,
  Plus,
  Search,
  CheckCircle,
  Mail,
  FileText,
  Eye,
  Trash2,
  QrCode
} from 'lucide-react';
import Pagination from '../../components/Pagination';
import RegisterDeliveryModal from '../../components/modals/RegisterDeliveryModal';
import CollectDeliveryModal from '../../components/modals/CollectDeliveryModal';
import ViewDeliveryModal from '../../components/modals/ViewDeliveryModal';

const DeliveriesPage = () => {
  const { isDarkMode } = useTheme();
  const { units } = useStructure();

  // Estados principais
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  // Estados de filtro e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    unit_id: ''
  });

  // Estados de paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    total: 0
  });

  // Estados dos modais
  const [registerModal, setRegisterModal] = useState({ isOpen: false, data: null });
  const [collectModal, setCollectModal] = useState({ isOpen: false, data: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });

  // Carregar entregas
  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage,
        search: searchTerm,
        ...filters
      };

      const response = await deliveryService.listDeliveries(params);
      // A API retorna diretamente o objeto paginado
      setDeliveries(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0
      }));
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const response = await deliveryService.getDeliveryStats();
      // A API retorna diretamente o objeto de stats
      setStats(response || {});
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats({});
    }
  };

  useEffect(() => {
    loadDeliveries();
    loadStats();
  }, [pagination.currentPage, filters]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (pagination.currentPage === 1) {
        loadDeliveries();
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Handlers
  const handleRegisterSuccess = () => {
    loadDeliveries();
    loadStats();
    setRegisterModal({ isOpen: false, data: null });
  };

  const handleCollectSuccess = () => {
    loadDeliveries();
    loadStats();
    setCollectModal({ isOpen: false, data: null });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta entrega?')) return;

    try {
      await deliveryService.deleteDelivery(id);
      loadDeliveries();
      loadStats();
    } catch (error) {
      console.error('Erro ao excluir entrega:', error);
      alert('Erro ao excluir entrega');
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Funções auxiliares
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'Pendente',
        className: isDarkMode
          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
          : 'bg-yellow-100 text-yellow-800 border-yellow-300'
      },
      collected: {
        label: 'Retirada',
        className: isDarkMode
          ? 'bg-green-500/20 text-green-400 border-green-500/30'
          : 'bg-green-100 text-green-800 border-green-300'
      },
      returned: {
        label: 'Devolvida',
        className: isDarkMode
          ? 'bg-red-500/20 text-red-400 border-red-500/30'
          : 'bg-red-100 text-red-800 border-red-300'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      package: <Package className="w-4 h-4" />,
      letter: <Mail className="w-4 h-4" />,
      document: <FileText className="w-4 h-4" />,
      other: <Package className="w-4 h-4" />
    };
    return icons[type] || icons.package;
  };

  const getTypeLabel = (type) => {
    const labels = {
      package: 'Encomenda',
      letter: 'Carta',
      document: 'Documento',
      other: 'Outro'
    };
    return labels[type] || 'Encomenda';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUnitLabel = (unit) => {
    if (!unit) return '-';
    const blockName = unit.block?.name || unit.block?.number || '';
    if (blockName) {
      return `${blockName} - ${unit.number}`;
    }
    return unit.number;
  };

  return (
    <Layout title="Entregas" breadcrumbs={['Dashboard', 'Portaria', 'Entregas']}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestão de Entregas
          </h2>
          <p className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}>
            Registre e gerencie as entregas recebidas na portaria
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRegisterModal({ isOpen: true, data: null })}
            className="flex items-center gap-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors px-4 py-2"
          >
            <Plus className="w-5 h-5" />
            Registrar Entrega
          </button>

          <button
            onClick={() => setCollectModal({ isOpen: true, data: null })}
            className="flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors px-4 py-2"
          >
            <QrCode className="w-5 h-5" />
            Retirar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`card p-6 text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">{stats.today || 0}</div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Hoje</div>
        </div>

        <div className={`card p-6 text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.pending || 0}</div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Pendentes</div>
        </div>

        <div className={`card p-6 text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <div className="text-3xl font-bold text-green-400 mb-2">{stats.this_week || 0}</div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Esta Semana</div>
        </div>

        <div className={`card p-6 text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">{stats.this_month || 0}</div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Este Mês</div>
        </div>
      </div>

      {/* Filtros */}
      <div className={`card p-6 mb-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ff6600] w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por código, destinatário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white placeholder-[#ff6600]/60' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
            />
          </div>

          {/* Filtro Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className={`px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
          >
            <option value="">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="collected">Retirada</option>
            <option value="returned">Devolvida</option>
          </select>

          {/* Filtro Tipo */}
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className={`px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
          >
            <option value="">Todos os Tipos</option>
            <option value="package">Encomenda</option>
            <option value="letter">Carta</option>
            <option value="document">Documento</option>
            <option value="other">Outro</option>
          </select>
        </div>
      </div>

      {/* Tabela de Entregas */}
      <div className={`card ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-[#080d08]/60' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-[#ff6600]' : 'text-gray-700'} uppercase tracking-wider`}>
                  Código
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-[#ff6600]' : 'text-gray-700'} uppercase tracking-wider`}>
                  Tipo
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-[#ff6600]' : 'text-gray-700'} uppercase tracking-wider`}>
                  Unidade
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-[#ff6600]' : 'text-gray-700'} uppercase tracking-wider`}>
                  Destinatário
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-[#ff6600]' : 'text-gray-700'} uppercase tracking-wider`}>
                  Recebido Em
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${isDarkMode ? 'text-[#ff6600]' : 'text-gray-700'} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-right text-xs font-semibold ${isDarkMode ? 'text-[#ff6600]' : 'text-gray-700'} uppercase tracking-wider`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6600]"></div>
                    </div>
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan="7" className={`px-6 py-12 text-center ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}`}>
                    Nenhuma entrega encontrada
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr
                    key={delivery.id}
                    className={`${isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <td className={`px-6 py-4 text-sm font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {delivery.delivery_code}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-[#ff6600]">{getTypeIcon(delivery.type)}</span>
                        {getTypeLabel(delivery.type)}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-900'}`}>
                      {getUnitLabel(delivery.unit)}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-900'}`}>
                      {delivery.recipient_name}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(delivery.received_at)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(delivery.status)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewModal({ isOpen: true, data: delivery })}
                          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                          title="Ver detalhes"
                        >
                          <Eye className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </button>

                        {delivery.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setCollectModal({ isOpen: true, data: delivery })}
                              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                              title="Registrar retirada"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </button>

                            <button
                              onClick={() => handleDelete(delivery.id)}
                              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {!loading && deliveries.length > 0 && (
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={Math.ceil(pagination.total / pagination.itemsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modais */}
      <RegisterDeliveryModal
        isOpen={registerModal.isOpen}
        onClose={() => setRegisterModal({ isOpen: false, data: null })}
        onSuccess={handleRegisterSuccess}
        units={units}
      />

      <CollectDeliveryModal
        isOpen={collectModal.isOpen}
        onClose={() => setCollectModal({ isOpen: false, data: null })}
        onSuccess={handleCollectSuccess}
        delivery={collectModal.data}
      />

      <ViewDeliveryModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, data: null })}
        delivery={viewModal.data}
      />
    </Layout>
  );
};

export default DeliveriesPage;
