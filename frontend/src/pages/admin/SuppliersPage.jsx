import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import SupplierModal from '../../components/modals/SupplierModal';
import SupplierRatingModal from '../../components/modals/SupplierRatingModal';
import supplierService from '../../services/supplierService';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Star,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react';

const SuppliersPage = () => {
  const { isDarkMode } = useTheme();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    blocked: 0,
    by_category: {},
    contracts_expiring: 0,
    average_evaluation: 0,
    evaluation_stats: {
      average: 0,
      total_evaluated: 0,
      total_suppliers: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      percentage_evaluated: 0
    },
    category_stats: {}
  });
  const [categories, setCategories] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    min_evaluation: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [supplierToRate, setSupplierToRate] = useState(null);
  const [error, setError] = useState('');

  const loadSuppliers = useCallback(async () => {
    try {
      const response = await supplierService.getAll(filters);
      if (response && response.status === 'success') {
        setSuppliers(response.data || []);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      setSuppliers([]);
    }
  }, [filters]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSuppliers(),
        loadStats(),
        loadCategories()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados dos fornecedores');
    } finally {
      setLoading(false);
    }
  }, [loadSuppliers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadSuppliers();
  }, [filters, loadSuppliers]);

  const loadStats = async () => {
    try {
      const response = await supplierService.getStats();
      if (response && response.status === 'success') {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await supplierService.getCategories();
      if (response && response.status === 'success') {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDeleteSupplier = async (supplier) => {
    if (!window.confirm(`Tem certeza que deseja excluir o fornecedor "${supplier.company_name}"?`)) {
      return;
    }

    try {
      const response = await supplierService.delete(supplier.id);
      if (response.status === 'success') {
        await loadData();
      }
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      setError('Erro ao excluir fornecedor');
    }
  };

  const handleModalSave = async () => {
    await loadData();
    setModalOpen(false);
  };

  const handleRateSupplier = (supplier) => {
    setSupplierToRate(supplier);
    setRatingModalOpen(true);
  };

  const handleRatingSaved = async () => {
    await loadData();
    setRatingModalOpen(false);
    setSupplierToRate(null);
  };

  const handleViewContract = async (supplier) => {
    try {
      const result = await supplierService.downloadContract(supplier.id);
      if (result.status === 'success') {
        // Mostrar mensagem de sucesso (opcional)
        console.log('Contrato aberto com sucesso');
      } else {
        console.error('Erro ao abrir contrato:', result.message);
      }
    } catch (error) {
      console.error('Erro ao abrir contrato:', error);
    }
  };

  const renderStars = (evaluation) => {
    if (!evaluation || isNaN(evaluation)) return <span className="text-gray-500">Sem avaliação</span>;
    
    const numEvaluation = parseFloat(evaluation);
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= numEvaluation 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-400'
            }`}
          />
        ))}
        <span className={`text-sm ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} ml-2`}>{numEvaluation.toFixed(1)}</span>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${supplierService.getStatusColor(status)}`}>
        {supplierService.getStatusName(status)}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    return (
      <span className="px-2 py-1 bg-[#ff6600]/20 text-[#ff6600] rounded text-xs font-medium">
        {supplierService.getCategoryName(category)}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout title="Fornecedores" breadcrumbs={['Dashboard', 'Fornecedores']}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Fornecedores" breadcrumbs={['Dashboard', 'Fornecedores']}>
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Fornecedores</h2>
          <p className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}>Gerencie os fornecedores e prestadores de serviços</p>
        </div>
        <button 
          onClick={handleAddSupplier}
          className="btn-primary flex items-center space-x-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors px-4 py-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Fornecedor</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div className={`card p-6 text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">{stats.total}</div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Total</div>
        </div>
        <div className={`card p-6 text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <div className="text-3xl font-bold text-green-400 mb-2">{stats.active}</div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Ativos</div>
        </div>
        <div className={`card p-6 text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <div className="text-3xl font-bold text-gray-400 mb-2">{stats.inactive}</div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Inativos</div>
        </div>
        <div className={`card p-6 text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.contracts_expiring}</div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Contratos Vencendo</div>
        </div>
        <div className={`card p-6 text-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <div className="text-3xl font-bold text-[#ff6600] mb-2">
            {stats.evaluation_stats?.average ? stats.evaluation_stats.average.toFixed(1) : '0.0'}
          </div>
          <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}>Avaliação Média</div>
          <div className={`text-xs ${isDarkMode ? 'text-[#ff6600]/80' : 'text-gray-600'} mt-1`}>
            {stats.evaluation_stats?.total_evaluated || 0} de {stats.total} avaliados
          </div>
        </div>
      </div>

      {/* Detailed Evaluation Stats */}
      {stats.evaluation_stats && stats.evaluation_stats.total_evaluated > 100000000 && (
        <div className={`card p-6 mb-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Star className='w-5 h-5 mr-2 text-[#ff6600]' />
            Estatísticas de Avaliação
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Distribuição por estrelas */}
            <div>
              <h4 className={`text-md font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-3`}>Distribuição por Estrelas</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-16">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= stars 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <div className={`flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                      <div 
                        className="bg-[#ff6600] h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${stats.evaluation_stats.distribution[stars] > 0 
                            ? (stats.evaluation_stats.distribution[stars] / stats.evaluation_stats.total_evaluated) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} w-8 text-right`}>
                      {stats.evaluation_stats.distribution[stars]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo */}
            <div>
              <h4 className={`text-md font-medium ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'} mb-3`}>Resumo</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}>Avaliação Média:</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-bold text-[#ff6600]">
                      {stats.evaluation_stats.average.toFixed(1)}
                    </span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}>Fornecedores Avaliados:</span>
                  <span className="text-lg font-bold text-green-400">
                    {stats.evaluation_stats.total_evaluated}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}>Percentual Avaliado:</span>
                  <span className="text-lg font-bold text-[#ff6600]">
                    {stats.evaluation_stats.percentage_evaluated.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}>Total de Fornecedores:</span>
                  <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.evaluation_stats.total_suppliers}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`card p-6 mb-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#ff6600] w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white placeholder-[#ff6600]/60' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
            />
          </div>
          
          <select 
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={`px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
          >
            <option value="">Todas as categorias</option>
            {Object.entries(categories).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>

          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="pending">Pendente</option>
            <option value="blocked">Bloqueado</option>
          </select>

          <select 
            value={filters.min_evaluation}
            onChange={(e) => handleFilterChange('min_evaluation', e.target.value)}
            className={`px-4 py-2 ${isDarkMode ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent`}
          >
            <option value="">Qualquer avaliação</option>
            <option value="4">4+ estrelas</option>
            <option value="3">3+ estrelas</option>
            <option value="2">2+ estrelas</option>
            <option value="1">1+ estrelas</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className={`card ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-500'} rounded-xl`}>
        <div className='p-6'>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lista de Fornecedores</h3>
            <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}`}>
              <Users className="w-5 h-5" />
              <span>{suppliers.length} fornecedores</span>
            </div>
          </div>

          {suppliers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-[#ff6600]/50 mx-auto mb-4" />
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Nenhum fornecedor encontrado</h3>
              <p className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} mb-4`}>
                {filters.search || filters.category || filters.status 
                  ? 'Tente ajustar os filtros para encontrar fornecedores'
                  : 'Comece adicionando o primeiro fornecedor'
                }
              </p>
              {!filters.search && !filters.category && !filters.status && (
                <button 
                  onClick={handleAddSupplier}
                  className="btn-primary bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors px-4 py-2 cursor-pointer flex m-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Fornecedor
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Empresa</th>
                    <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Categoria</th>
                    <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Contato</th>
                    <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Avaliação</th>
                    <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Status</th>
                    <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Contrato</th>
                    <th className={`text-left py-3 px-4 text-[#ff6600] font-medium`}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className={`border-b ${isDarkMode ? 'border-[#ff6600]/10 hover:bg-[#ff6600]/5' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                      <td className="py-4 px-4">
                        <div>
                          <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{supplier.company_name}</div>
                          {supplier.trade_name && (
                            <div className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} text-sm`}>{supplier.trade_name}</div>
                          )}
                          <div className={`${isDarkMode ? 'text-[#ff6600]/80' : 'text-gray-500'} text-xs font-mono`}>
                            {supplier.cnpj || supplier.cpf}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getCategoryBadge(supplier.category)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className={`flex items-center ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} text-sm`}>
                            <Phone className="w-3 h-3 mr-1" />
                            {supplier.phone}
                          </div>
                          <div className={`flex items-center ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} text-sm`}>
                            <Mail className="w-3 h-3 mr-1" />
                            {supplier.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {renderStars(supplier.evaluation)}
                          <button 
                            onClick={() => handleRateSupplier(supplier)}
                            className="ml-2 p-1 text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                            title="Avaliar"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(supplier.status)}
                      </td>
                      <td className="py-4 px-4">
                        {supplier.contract_end ? (
                          <div className="text-sm">
                            <div className={isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}>
                              Até {new Date(supplier.contract_end).toLocaleDateString('pt-BR')}
                            </div>
                            {supplierService.isContractExpiring(supplier.contract_end) && (
                              <div className="text-yellow-400 text-xs">
                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                Vencendo em breve
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>Sem contrato</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewSupplier(supplier)}
                            className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditSupplier(supplier)}
                            className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRateSupplier(supplier)}
                            className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                            title="Avaliar"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleViewContract(supplier)}
                            className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                            title="Visualizar Contrato"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSupplier(supplier)}
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
          )}
        </div>
      </div>

      {/* Modal */}
      <SupplierModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        supplier={selectedSupplier}
        onSave={handleModalSave}
        categories={categories}
      />

      {/* Rating Modal */}
      <SupplierRatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        supplier={supplierToRate}
        onRatingSaved={handleRatingSaved}
      />
    </Layout>
  );
};

export default SuppliersPage;
