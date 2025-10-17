import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { listRevenues, createRevenue, updateRevenue, deleteRevenue } from '../../services/financeService';
import { Plus, Receipt, Edit, Trash2, Eye } from 'lucide-react';
import { useStructure } from '../../contexts/StructureContext';
import { useTheme } from '../../contexts/ThemeContext';
import FinanceTransactionModal from '../../components/modals/FinanceTransactionModal';

export default function RevenuesPage() {
  const { condominiums } = useStructure();
  const { isDarkMode } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listRevenues();
      setItems(data.data || data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreateNew = () => {
    setSelectedRevenue(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedRevenue(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (item) => {
    setSelectedRevenue(item);
    setModalMode('view');
    setShowModal(true);
  };

  const handleModalSave = async (formData, id) => {
    if (id) {
      await updateRevenue(id, formData);
    } else {
      await createRevenue(formData);
    }
    await load();
  };

  const onDelete = async (id) => {
    if (!confirm('Excluir receita?')) return;
    setLoading(true);
    try { await deleteRevenue(id); await load(); } finally { setLoading(false); }
  };

  const getCondominiumName = (condominiumId) => {
    const condo = condominiums.find(c => c.id === condominiumId);
    return condo ? condo.name : `ID: ${condominiumId}`;
  };

  return (
    <Layout title="Financeiro" breadcrumbs={['Dashboard', 'Financeiro', 'Receitas']}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <Receipt className="w-6 h-6 text-[#ff6600]" /> Receitas
          </h2>
          <p className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}`}>Cadastre e gerencie receitas por subconta e competência</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Receita</span>
        </button>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lista de Receitas</h3>
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
              <Receipt className="w-12 h-12 text-[#ff6600]/40 mx-auto mb-4" />
              <p className={`${isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-500'} mb-2`}>Nenhuma receita cadastrada</p>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium mb-4`}>Comece criando sua primeira receita</p>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Primeira Receita
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ff6600]/20">
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Condomínio</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Subconta</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Título</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Competência</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Tipo</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Valor</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Previsão</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors">
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{it.id}</td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>{getCondominiumName(it.condominium_id)}</td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>{it.subaccount_id || '-'}</td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{it.title}</td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>{(it.competency_date || '').slice(0, 10)}</td>
                      <td className="py-3 px-4 text-[#f3f7f1]">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          it.type === 'fixa'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {it.type === 'fixa' ? 'Fixa' : 'Variável'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-green-400 font-medium">
                        R$ {Number(it.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {it.is_forecast ? (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                            Sim
                          </span>
                        ) : (
                          <span className="text-[#f3f7f1]/60 text-sm">Não</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(it)}
                            className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(it)}
                            className="p-2 text-[#ff6600] hover:bg-[#ff6600]/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(it.id)}
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
      <FinanceTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        transaction={selectedRevenue}
        condominiums={condominiums}
        type="revenue"
        onSave={handleModalSave}
      />
    </Layout>
  );
}


