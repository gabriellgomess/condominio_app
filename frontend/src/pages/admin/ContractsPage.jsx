import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Building2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import contractService from '../../services/contractService';
import { useStructure } from '../../contexts/StructureContext';

const ContractsPage = () => {
  const { condominiums } = useStructure();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [formData, setFormData] = useState({
    condominium_id: '',
    contract_type: '',
    company_name: '',
    description: '',
    start_date: '',
    end_date: '',
    adjustment_index: '',
    termination_notice_date: '',
    contract_value: '',
    status: 'active',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    if (condominiums.length > 0 && !formData.condominium_id && !editingContract) {
      setFormData(prev => ({
        ...prev,
        condominium_id: condominiums[0].id
      }));
    }
  }, [condominiums, formData.condominium_id, editingContract]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await contractService.getAll();
      setContracts(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      setError('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingContract) {
        await contractService.update(editingContract.id, formData);
        setSuccess('Contrato atualizado com sucesso!');
      } else {
        await contractService.create(formData);
        setSuccess('Contrato criado com sucesso!');
      }

      fetchContracts();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar contrato');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este contrato?')) return;

    try {
      await contractService.delete(id);
      setSuccess('Contrato excluído com sucesso!');
      fetchContracts();
    } catch (error) {
      setError('Erro ao excluir contrato');
    }
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setFormData({
      condominium_id: contract.condominium_id || '',
      contract_type: contract.contract_type || '',
      company_name: contract.company_name || '',
      description: contract.description || '',
      start_date: contract.start_date || '',
      end_date: contract.end_date || '',
      adjustment_index: contract.adjustment_index || '',
      termination_notice_date: contract.termination_notice_date || '',
      contract_value: contract.contract_value || '',
      status: contract.status || 'active',
      notes: contract.notes || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContract(null);
    setFormData({
      condominium_id: condominiums.length > 0 ? condominiums[0].id : '',
      contract_type: '',
      company_name: '',
      description: '',
      start_date: '',
      end_date: '',
      adjustment_index: '',
      termination_notice_date: '',
      contract_value: '',
      status: 'active',
      notes: ''
    });
    setError('');
  };

  const getCondominiumName = (condominiumId) => {
    const condo = condominiums.find(c => c.id === condominiumId);
    return condo ? condo.name : `ID: ${condominiumId}`;
  };

  const isContractExpired = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const contractEnd = new Date(endDate);
    contractEnd.setHours(0, 0, 0, 0);
    return contractEnd < today;
  };

  const isContractExpiringSoon = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tenDaysFromNow = new Date(today);
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
    const contractEnd = new Date(endDate);
    contractEnd.setHours(0, 0, 0, 0);
    return contractEnd >= today && contractEnd <= tenDaysFromNow;
  };

  const expiredContracts = contracts.filter(contract =>
    contract.status === 'active' && isContractExpired(contract.end_date)
  );

  const expiringSoonContracts = contracts.filter(contract =>
    contract.status === 'active' && isContractExpiringSoon(contract.end_date)
  );

  const filteredContracts = contracts.filter(contract =>
    contract.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contract_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Ativo', class: 'bg-green-100 text-green-800' },
      expired: { label: 'Vencido', class: 'bg-red-100 text-red-800' },
      terminated: { label: 'Rescindido', class: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const contractTypes = [
    'Fornecimento de Gás',
    'Manutenção de Portões',
    'Manutenção de Interfones',
    'Zeladoria e Limpeza',
    'Portaria',
    'Controle de Acesso',
    'Jardinagem',
    'Elevador',
    'Academia',
    'Administradora',
    'Síndico',
    'Dedetização/Desinsetização',
    'Limpeza de Reservatórios',
    'Seguro',
    'Outro'
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contratos</h1>
          <p className="text-gray-600">Gestão de contratos com prestadores de serviços</p>
        </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Alertas de Contratos Vencidos */}
      {expiredContracts.length > 0 && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-2">
                Atenção: {expiredContracts.length} {expiredContracts.length === 1 ? 'contrato vencido' : 'contratos vencidos'}
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                {expiredContracts.map(contract => (
                  <li key={contract.id}>
                    <strong>{contract.contract_type}</strong> - {contract.company_name}
                    <span className="text-red-600 ml-2">
                      (Vencido em {new Date(contract.end_date).toLocaleDateString('pt-BR')})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Alertas de Contratos Vencendo em Breve */}
      {expiringSoonContracts.length > 0 && (
        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                {expiringSoonContracts.length} {expiringSoonContracts.length === 1 ? 'contrato vence' : 'contratos vencem'} nos próximos 10 dias
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                {expiringSoonContracts.map(contract => (
                  <li key={contract.id}>
                    <strong>{contract.contract_type}</strong> - {contract.company_name}
                    <span className="text-yellow-600 ml-2">
                      (Vence em {new Date(contract.end_date).toLocaleDateString('pt-BR')})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por empresa ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Contrato
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condomínio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Início
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Nenhum contrato encontrado
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {getCondominiumName(contract.condominium_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {contract.contract_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contract.start_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.contract_value
                        ? `R$ ${parseFloat(contract.contract_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(contract)}
                        className="text-orange-600 hover:text-orange-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contract.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingContract ? 'Editar Contrato' : 'Novo Contrato'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building2 className="w-4 h-4 inline mr-2 text-orange-600" />
                    Condomínio *
                  </label>
                  <select
                    value={formData.condominium_id}
                    onChange={(e) => setFormData({ ...formData, condominium_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Selecione um condomínio</option>
                    {condominiums.map(condo => (
                      <option key={condo.id} value={condo.id}>
                        {condo.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Contrato *
                    </label>
                    <select
                      value={formData.contract_type}
                      onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {contractTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Empresa/Prestador *
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Vencimento *
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Índice de Reajuste
                    </label>
                    <input
                      type="text"
                      value={formData.adjustment_index}
                      onChange={(e) => setFormData({ ...formData, adjustment_index: e.target.value })}
                      placeholder="Ex: IGPM, IPCA"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor do Contrato
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.contract_value}
                      onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Notificação de Rescisão
                    </label>
                    <input
                      type="date"
                      value={formData.termination_notice_date}
                      onChange={(e) => setFormData({ ...formData, termination_notice_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="active">Ativo</option>
                      <option value="expired">Vencido</option>
                      <option value="terminated">Rescindido</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:shadow-lg"
                  >
                    {editingContract ? 'Atualizar' : 'Criar'} Contrato
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

export default ContractsPage;
