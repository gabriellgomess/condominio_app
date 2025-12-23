import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import controlService from '../../services/controlService';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Calendar,
  X
} from 'lucide-react';

// Tipos de controle disponíveis
const CONTROL_TYPES = [
  { value: 'PPCI', label: 'PPCI - Plano de Prevenção Contra Incêndio' },
  { value: 'Extintores', label: 'Extintores' },
  { value: 'Alarme de Incêndio', label: 'Sistema de Alarme de Incêndio' },
  { value: 'Estanqueidade Gás', label: 'Teste de Estanqueidade da Central de Gás' },
  { value: 'Reguladores de Gás', label: 'Reguladores de Gás' },
  { value: 'Medidores de Gás', label: 'Medidores de Gás' },
  { value: 'Fossa e Esgoto', label: 'Limpeza de Fossas e Sistema de Esgoto' },
  { value: 'Dedetização', label: 'Desinsetização/Dedetização e Desratização' },
  { value: 'Descarga Elétrica', label: 'Sistema Contra Descarga Elétrica' },
  { value: 'Calhas e Telhados', label: 'Calhas e Telhados' },
  { value: 'Reservatórios de Água', label: 'Reservatórios de Água' },
  { value: 'LTIP', label: 'Laudo Técnico de Inspeção Predial (LTIP)' },
  { value: 'Marquises e Sacadas', label: 'Laudo de Marquises e Sacadas' },
  { value: 'Seguro do Prédio', label: 'Seguro do Prédio' },
  { value: 'Seguro de Funcionários', label: 'Seguro de Funcionários' },
  { value: 'Medicina do Trabalho', label: 'Medicina do Trabalho' },
  { value: 'Orçamentos', label: 'Orçamentos' }
];

const PERIODICITIES = [
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
  { value: 'quinquenal', label: 'Quinquenal (5 anos)' },
  { value: 'decenal', label: 'Decenal (10 anos)' }
];

const ControlsPage = () => {
  const { isDarkMode } = useTheme();
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingControl, setEditingControl] = useState(null);
  const [formData, setFormData] = useState({
    control_type: '',
    name: '',
    validity_date: '',
    periodicity: '',
    quantity: '',
    specifications: '',
    notes: ''
  });

  useEffect(() => {
    loadControls();
  }, [filterType, filterStatus]);

  const loadControls = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType) params.control_type = filterType;
      if (filterStatus) params.status = filterStatus;

      const response = await controlService.getAll(params);
      setControls(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar controles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingControl) {
        await controlService.update(editingControl.id, formData);
      } else {
        await controlService.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadControls();
    } catch (error) {
      console.error('Erro ao salvar controle:', error);
      alert('Erro ao salvar controle');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este controle?')) {
      try {
        await controlService.delete(id);
        loadControls();
      } catch (error) {
        console.error('Erro ao excluir controle:', error);
        alert('Erro ao excluir controle');
      }
    }
  };

  const handleEdit = (control) => {
    setEditingControl(control);

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
      control_type: control.control_type,
      name: control.name,
      validity_date: formatDateForInput(control.validity_date),
      periodicity: control.periodicity || '',
      quantity: control.quantity || '',
      specifications: typeof control.specifications === 'object'
        ? JSON.stringify(control.specifications)
        : control.specifications || '',
      notes: control.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      control_type: '',
      name: '',
      validity_date: '',
      periodicity: '',
      quantity: '',
      specifications: '',
      notes: ''
    });
    setEditingControl(null);
  };

  const getStatusBadge = (status, validityDate) => {
    if (!validityDate) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-500 text-white">Sem Validade</span>;
    }

    const today = new Date();
    const validity = new Date(validityDate);
    const diffDays = Math.ceil((validity - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-500 text-white flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> Vencido ({Math.abs(diffDays)} dias)
      </span>;
    } else if (diffDays <= 30) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500 text-white flex items-center gap-1">
        <Clock className="w-3 h-3" /> Vence em {diffDays} dias
      </span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-500 text-white flex items-center gap-1">
        <CheckCircle className="w-3 h-3" /> Ativo
      </span>;
    }
  };

  const filteredControls = controls.filter(control =>
    control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.control_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Controles de Validade</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Gerencie os controles de validade e manutenções do condomínio
          </p>

          {/* Info Box */}
          <div className={`mt-4 p-4 rounded-lg border-l-4 border-blue-500 ${
            isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
          }`}>
            <p className="text-sm">
              <strong>Como usar:</strong> Cadastre cada controle/certificado/manutenção com sua data de vencimento.
              O sistema alertará automaticamente quando estiver próximo (30 dias) ou vencido.
            </p>
            <p className="text-sm mt-2">
              <strong>Exemplo:</strong> Tipo: "Extintores" | Descrição: "Bloco A - Térreo" | Validade: 31/12/2025 |
              Periodicidade: Anual | Quantidade: 10
            </p>
          </div>
        </div>

        {/* Filtros e Ações */}
        <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar controles..."
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
          {CONTROL_TYPES.map(type => (
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
          <option value="active">Ativos</option>
          <option value="approaching">Próximo do Vencimento</option>
          <option value="expired">Vencidos</option>
        </select>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-[#ff6600] to-[#fa7a25] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Controle
        </button>
        </div>

        {/* Tabela de Controles */}
        <div className={`rounded-lg shadow-md overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
        {loading ? (
          <div className="p-8 text-center">Carregando...</div>
        ) : filteredControls.length === 0 ? (
          <div className="p-8 text-center">Nenhum controle encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Validade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Periodicidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredControls.map((control) => (
                  <tr key={control.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{control.control_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{control.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {control.validity_date
                        ? new Date(control.validity_date).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{control.periodicity || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(control.status, control.validity_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(control)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(control.id)}
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
                {editingControl ? 'Editar Controle' : 'Novo Controle'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Controle *</label>
                  <select
                    required
                    value={formData.control_type}
                    onChange={(e) => setFormData({ ...formData, control_type: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Selecione o tipo de controle...</option>
                    {CONTROL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descrição Complementar *
                    <span className="text-xs font-normal ml-2 opacity-70">
                      (Ex: "Bloco A - 1º Andar", "Reservatório 1", etc.)
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Identifique ou localize este controle"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Data de Validade *
                      <span className="text-xs font-normal ml-2 opacity-70">
                        (Próximo vencimento)
                      </span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.validity_date}
                      onChange={(e) => setFormData({ ...formData, validity_date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Periodicidade da Renovação
                      <span className="text-xs font-normal ml-2 opacity-70">
                        (Frequência de atualização)
                      </span>
                    </label>
                    <select
                      value={formData.periodicity}
                      onChange={(e) => setFormData({ ...formData, periodicity: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Selecione se aplicável...</option>
                      {PERIODICITIES.map(period => (
                        <option key={period.value} value={period.value}>{period.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quantidade de Itens
                    <span className="text-xs font-normal ml-2 opacity-70">
                      (Ex: 10 extintores, 2 reservatórios, etc.)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Deixe em branco se não aplicável"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Especificações Técnicas
                    <span className="text-xs font-normal ml-2 opacity-70">
                      (Ex: marca, modelo, capacidade, etc.)
                    </span>
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Detalhes técnicos relevantes..."
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Observações Gerais
                    <span className="text-xs font-normal ml-2 opacity-70">
                      (Informações adicionais)
                    </span>
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Anotações, histórico, contatos, etc..."
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
                    {editingControl ? 'Atualizar' : 'Criar'}
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

export default ControlsPage;
