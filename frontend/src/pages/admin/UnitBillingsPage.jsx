import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import billingService from '../../services/billingService';
import { Plus, FileText, Edit, Trash2, Eye, DollarSign, AlertCircle } from 'lucide-react';
import { useStructure } from '../../contexts/StructureContext';
import { useTheme } from '../../contexts/ThemeContext';
import UnitBillingModal from '../../components/modals/UnitBillingModal';
import PaymentModal from '../../components/modals/PaymentModal';

export default function UnitBillingsPage() {
  const { condominiums, units } = useStructure();
  const { isDarkMode } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCondominium, setSelectedCondominium] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCondominium) params.condominium_id = selectedCondominium;
      if (selectedStatus) params.status = selectedStatus;

      const response = await billingService.getUnitBillings(params);
      setItems(response.data || response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedCondominium, selectedStatus]);

  const handleCreateNew = () => {
    setSelectedItem(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setModalMode('view');
    setShowModal(true);
  };

  const handleAddPayment = (item) => {
    setSelectedItem(item);
    setShowPaymentModal(true);
  };

  const handleModalSave = async (formData, id) => {
    if (id) {
      await billingService.updateUnitBilling(id, formData);
    } else {
      await billingService.createUnitBilling(formData);
    }
    await load();
  };

  const handlePaymentSave = async (formData) => {
    await billingService.createPayment(formData);
    await load();
  };

  const onDelete = async (id) => {
    if (!confirm('Excluir cobrança?')) return;
    setLoading(true);
    try {
      await billingService.deleteUnitBilling(id);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const getUnitName = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return `ID: ${unitId}`;
    return `${unit.block?.name || ''} - ${unit.number}`;
  };

  return (
    <Layout title="Cobranças" breadcrumbs={['Dashboard', 'Cobrança', 'Boletos']}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <FileText className="w-6 h-6 text-[#ff6600]" /> Boletos/Cobranças
          </h2>
          <p className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}`}>
            Gerencie os boletos e cobranças de cada unidade
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Cobrança</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Condomínio
              </label>
              <select
                value={selectedCondominium}
                onChange={(e) => setSelectedCondominium(e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="">Todos</option>
                {condominiums.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencido</option>
                <option value="partially_paid">Pago Parcialmente</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Lista de Cobranças
            </h3>
            <div className="px-3 py-1 bg-[#ff6600]/20 text-[#ff6600] rounded-lg text-sm font-medium">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff6600]"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-[#ff6600]/40 mx-auto mb-4" />
              <p className={`${isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-500'} mb-2`}>
                Nenhuma cobrança cadastrada
              </p>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium mb-4`}>
                Comece criando sua primeira cobrança
              </p>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Primeira Cobrança
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ff6600]/20">
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Unidade</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Vencimento</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Valor Total</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Pago</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Saldo</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors">
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                        {item.id}
                      </td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                        {getUnitName(item.unit_id)}
                      </td>
                      <td className={`py-3 px-4`}>
                        <div className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                          {billingService.formatDate(item.due_date)}
                        </div>
                        {item.is_overdue && (
                          <span className="text-red-400 text-xs font-medium">
                            {item.days_overdue} dias de atraso
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-blue-400 font-medium">
                        {billingService.formatCurrency(item.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-green-400 font-medium">
                        {billingService.formatCurrency(item.amount_paid)}
                      </td>
                      <td className={`py-3 px-4 font-medium ${
                        item.balance > 0 ? 'text-red-400' :
                        item.balance < 0 ? 'text-blue-400' :
                        'text-green-400'
                      }`}>
                        {billingService.formatCurrency(Math.abs(item.balance))}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          item.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          item.status === 'overdue' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          item.status === 'partially_paid' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {billingService.getBillingStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {item.status !== 'paid' && item.status !== 'cancelled' && (
                            <button
                              onClick={() => handleAddPayment(item)}
                              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="Registrar Pagamento"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleView(item)}
                            className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
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

      {/* Modals */}
      <UnitBillingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        unitBilling={selectedItem}
        condominiums={condominiums}
        units={units}
        onSave={handleModalSave}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        unitBilling={selectedItem}
        onSave={handlePaymentSave}
      />
    </Layout>
  );
}
