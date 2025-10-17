import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { listSubaccounts, createSubaccount, updateSubaccount, deleteSubaccount } from '../../services/financeService';
import { Plus, Layers, Edit, Trash2, Eye } from 'lucide-react';
import { useStructure } from '../../contexts/StructureContext';
import { useTheme } from '../../contexts/ThemeContext';
import SubaccountModal from '../../components/modals/SubaccountModal';

export default function SubaccountsPage() {
  const { condominiums } = useStructure();
  const { isDarkMode } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubaccount, setSelectedSubaccount] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listSubaccounts();
      setItems(data.data || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreateNew = () => {
    setSelectedSubaccount(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedSubaccount(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (item) => {
    setSelectedSubaccount(item);
    setModalMode('view');
    setShowModal(true);
  };

  const handleModalSave = async (formData, id) => {
    if (id) {
      await updateSubaccount(id, formData);
    } else {
      await createSubaccount(formData);
    }
    await load();
  };

  const onDelete = async (id) => {
    if (!confirm('Excluir subconta?')) return;
    setLoading(true);
    try { await deleteSubaccount(id); await load(); } finally { setLoading(false); }
  };

  const getCondominiumName = (condominiumId) => {
    const condo = condominiums.find(c => c.id === condominiumId);
    return condo ? condo.name : `ID: ${condominiumId}`;
  };

  return (
    <Layout title="Financeiro" breadcrumbs={['Dashboard', 'Financeiro', 'Subcontas']}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <Layers className="w-6 h-6 text-[#ff6600]" /> Subcontas
          </h2>
          <p className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}`}>Gerencie as subcontas financeiras por condomínio</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Subconta</span>
        </button>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lista de Subcontas</h3>
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
              <Layers className="w-12 h-12 text-[#ff6600]/40 mx-auto mb-4" />
              <p className={`${isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-500'} mb-2`}>Nenhuma subconta cadastrada</p>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium mb-4`}>Comece criando sua primeira subconta</p>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Primeira Subconta
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ff6600]/20">
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Condomínio</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Nome</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors">
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{it.id}</td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>{getCondominiumName(it.condominium_id)}</td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{it.name}</td>
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
      <SubaccountModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        subaccount={selectedSubaccount}
        condominiums={condominiums}
        onSave={handleModalSave}
      />
    </Layout>
  );
}


