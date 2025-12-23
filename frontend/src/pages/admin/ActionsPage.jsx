import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import actionService from '../../services/actionService';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle,
  Calendar,
  User,
  DollarSign,
  X,
  TrendingUp,
  Wrench,
  AlertTriangle,
  Droplets,
  Zap,
  Paintbrush,
  TreePine,
  Shield,
  Package
} from 'lucide-react';

// Tipos de ação disponíveis
const ACTION_TYPES = [
  { value: 'maintenance_general', label: 'Manutenção Geral', icon: Wrench, color: 'text-blue-500' },
  { value: 'maintenance_plumbing', label: 'Manutenção Hidráulica', icon: Droplets, color: 'text-cyan-500' },
  { value: 'maintenance_electrical', label: 'Manutenção Elétrica', icon: Zap, color: 'text-yellow-500' },
  { value: 'maintenance_painting', label: 'Pintura', icon: Paintbrush, color: 'text-purple-500' },
  { value: 'maintenance_garden', label: 'Jardinagem', icon: TreePine, color: 'text-green-500' },
  { value: 'maintenance_cleaning', label: 'Limpeza Especial', icon: Package, color: 'text-indigo-500' },
  { value: 'maintenance_security', label: 'Segurança', icon: Shield, color: 'text-red-500' },
  { value: 'improvement', label: 'Melhoria/Benfeitoria', icon: TrendingUp, color: 'text-emerald-500' },
  { value: 'inspection', label: 'Inspeção/Vistoria', icon: AlertCircle, color: 'text-orange-500' },
  { value: 'other', label: 'Outros', icon: Package, color: 'text-gray-500' }
];

const ActionsPage = () => {
  const { isDarkMode } = useTheme();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'maintenance_general',
    description: '',
    responsible: '',
    start_date: '',
    end_date: '',
    actual_start_date: '',
    actual_end_date: '',
    status: 'pending',
    priority: 'medium',
    estimated_cost: '',
    actual_cost: '',
    notes: ''
  });

  useEffect(() => {
    loadActions();
    loadStatistics();
  }, [filterType, filterStatus, filterPriority]);

  const loadActions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;

      const response = await actionService.getAll(params);
      setActions(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar ações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await actionService.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAction) {
        await actionService.update(editingAction.id, formData);
      } else {
        await actionService.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadActions();
      loadStatistics();
    } catch (error) {
      console.error('Erro ao salvar ação:', error);
      alert('Erro ao salvar ação');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta ação?')) {
      try {
        await actionService.delete(id);
        loadActions();
        loadStatistics();
      } catch (error) {
        console.error('Erro ao excluir ação:', error);
        alert('Erro ao excluir ação');
      }
    }
  };

  const handleEdit = (action) => {
    setEditingAction(action);

    // Formatar data para o formato YYYY-MM-DD que o input date aceita
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setFormData({
      title: action.title,
      type: action.type,
      description: action.description || '',
      responsible: action.responsible || '',
      start_date: formatDateForInput(action.start_date),
      end_date: formatDateForInput(action.end_date),
      actual_start_date: formatDateForInput(action.actual_start_date),
      actual_end_date: formatDateForInput(action.actual_end_date),
      status: action.status,
      priority: action.priority,
      estimated_cost: action.estimated_cost || '',
      actual_cost: action.actual_cost || '',
      notes: action.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'maintenance_general',
      description: '',
      responsible: '',
      start_date: '',
      end_date: '',
      actual_start_date: '',
      actual_end_date: '',
      status: 'pending',
      priority: 'medium',
      estimated_cost: '',
      actual_cost: '',
      notes: ''
    });
    setEditingAction(null);
  };

  const getTypeInfo = (typeValue) => {
    return ACTION_TYPES.find(t => t.value === typeValue) || ACTION_TYPES[0];
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: Clock, label: 'Pendente', color: 'bg-yellow-500' },
      in_progress: { icon: PlayCircle, label: 'Em Andamento', color: 'bg-blue-500' },
      completed: { icon: CheckCircle, label: 'Concluída', color: 'bg-green-500' },
      cancelled: { icon: XCircle, label: 'Cancelada', color: 'bg-red-500' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" /> {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { label: 'Baixa', color: 'bg-gray-500' },
      medium: { label: 'Média', color: 'bg-blue-500' },
      high: { label: 'Alta', color: 'bg-orange-500' },
      urgent: { label: 'Urgente', color: 'bg-red-500' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color} text-white`}>
        {config.label}
      </span>
    );
  };

  const isOverdue = (action) => {
    if (!action.end_date || action.status === 'completed' || action.status === 'cancelled') {
      return false;
    }
    const today = new Date();
    const endDate = new Date(action.end_date);
    return endDate < today;
  };

  const filteredActions = actions.filter(action =>
    action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (action.responsible && action.responsible.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Ações a Realizar</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Gerencie manutenções e melhorias do condomínio
          </p>
        </div>

        {/* Estatísticas */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70">Total</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-500">{statistics.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70">Em Andamento</p>
                  <p className="text-2xl font-bold text-blue-500">{statistics.in_progress}</p>
                </div>
                <PlayCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70">Concluídas</p>
                  <p className="text-2xl font-bold text-green-500">{statistics.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70">Atrasadas</p>
                  <p className="text-2xl font-bold text-red-500">{statistics.overdue}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filtros e Ações */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar ações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Todos os Tipos</option>
            {ACTION_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Todas as Prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] text-white rounded-lg hover:opacity-90 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Nova Ação
          </button>
        </div>

        {/* Tabela de Ações */}
        <div className={`rounded-lg shadow-md overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {loading ? (
            <div className="p-8 text-center">Carregando...</div>
          ) : filteredActions.length === 0 ? (
            <div className="p-8 text-center">Nenhuma ação encontrada</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Responsável</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Prazo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Prioridade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredActions.map((action) => (
                    <tr
                      key={action.id}
                      className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${
                        isOverdue(action) ? 'bg-red-50/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const typeInfo = getTypeInfo(action.type);
                            const Icon = typeInfo.icon;
                            return <Icon className={`w-4 h-4 ${typeInfo.color}`} />;
                          })()}
                          <div>
                            <div className="font-medium">{action.title}</div>
                            {isOverdue(action) && (
                              <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> Atrasada
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getTypeInfo(action.type).label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{action.responsible || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {action.end_date
                          ? new Date(action.end_date).toLocaleDateString('pt-BR')
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getPriorityBadge(action.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(action.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(action)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(action.id)}
                            className="text-red-500 hover:text-red-700"
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

        {/* Modal de Criar/Editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingAction ? 'Editar Ação' : 'Nova Ação'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Trocar o piso da piscina"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo *</label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {ACTION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Status *</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="pending">Pendente</option>
                        <option value="in_progress">Em Andamento</option>
                        <option value="completed">Concluída</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Prioridade *</label>
                      <select
                        required
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <textarea
                      rows="3"
                      placeholder="Descreva os detalhes da ação..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Responsável</label>
                    <input
                      type="text"
                      placeholder="Nome do responsável"
                      value={formData.responsible}
                      onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Data Início Prevista</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Data Fim Prevista</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Data Início Real</label>
                      <input
                        type="date"
                        value={formData.actual_start_date}
                        onChange={(e) => setFormData({ ...formData, actual_start_date: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Data Fim Real</label>
                      <input
                        type="date"
                        value={formData.actual_end_date}
                        onChange={(e) => setFormData({ ...formData, actual_end_date: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Custo Estimado (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.estimated_cost}
                        onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Custo Real (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.actual_cost}
                        onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Observações</label>
                    <textarea
                      rows="3"
                      placeholder="Informações adicionais..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] text-white rounded-lg hover:opacity-90"
                    >
                      {editingAction ? 'Atualizar' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ActionsPage;
