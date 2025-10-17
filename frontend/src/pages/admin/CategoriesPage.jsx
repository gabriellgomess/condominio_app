import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { listCategories, createCategory, updateCategory, deleteCategory, listSubaccounts } from '../../services/financeService';
import { Plus, Tag, Edit, Trash2, Eye, Filter, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import CategoryModal from '../../components/modals/CategoryModal';

export default function CategoriesPage() {
  const { isDarkMode } = useTheme();
  const [items, setItems] = useState([]);
  const [subaccounts, setSubaccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  // Filtros
  const [filterSubaccount, setFilterSubaccount] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadSubaccounts = async () => {
    try {
      const { data } = await listSubaccounts();
      setSubaccounts(data.data || data);
    } catch (error) {
      console.error('Erro ao carregar subcontas:', error);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterSubaccount) params.subaccount_id = filterSubaccount;
      if (filterStatus !== '') params.is_active = filterStatus === 'true';
      if (searchTerm) params.search = searchTerm;

      const { data } = await listCategories(params);
      setItems(data.data || data);
    } finally {
      setLoading(false);
    }
  }, [filterSubaccount, filterStatus, searchTerm]);

  useEffect(() => {
    loadSubaccounts();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateNew = () => {
    setSelectedCategory(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedCategory(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (item) => {
    setSelectedCategory(item);
    setModalMode('view');
    setShowModal(true);
  };

  const handleModalSave = async (formData, id) => {
    if (id) {
      await updateCategory(id, formData);
    } else {
      await createCategory(formData);
    }
    await load();
  };

  const onDelete = async (id) => {
    if (!confirm('Excluir categoria?')) return;
    setLoading(true);
    try {
      await deleteCategory(id);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const getSubaccountName = (subaccountId) => {
    const sub = subaccounts.find(s => s.id === subaccountId);
    return sub ? sub.name : `ID: ${subaccountId}`;
  };

  const clearFilters = () => {
    setFilterSubaccount('');
    setFilterStatus('');
    setSearchTerm('');
  };

  return (
    <Layout title="Financeiro" breadcrumbs={['Dashboard', 'Financeiro', 'Categorias']}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <Tag className="w-6 h-6 text-[#ff6600]" /> Categorias
          </h2>
          <p className={`${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'}`}>Gerencie as categorias financeiras por subconta</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#ff6600]" />
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                <Search className="w-4 h-4 inline mr-2 text-[#ff6600]" />
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome da categoria..."
                className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600]`}
              />
            </div>

            {/* Subconta */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                Subconta
              </label>
              <select
                value={filterSubaccount}
                onChange={(e) => setFilterSubaccount(e.target.value)}
                className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600]`}
              >
                <option value="">Todas</option>
                {subaccounts.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-4 py-2 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600]`}
              >
                <option value="">Todos</option>
                <option value="true">Ativas</option>
                <option value="false">Inativas</option>
              </select>
            </div>
          </div>

          {(filterSubaccount || filterStatus || searchTerm) && (
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[#ff6600]/20 text-[#ff6600] rounded-lg hover:bg-[#ff6600]/30 transition-colors text-sm"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lista de Categorias</h3>
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
              <Tag className="w-12 h-12 text-[#ff6600]/40 mx-auto mb-4" />
              <p className={`${isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-500'} mb-2`}>Nenhuma categoria cadastrada</p>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium mb-4`}>Comece criando sua primeira categoria</p>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Primeira Categoria
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ff6600]/20">
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Subconta</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Nome</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[#ff6600] font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-[#ff6600]/10 hover:bg-[#ff6600]/5 transition-colors">
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{it.id}</td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                        {it.subaccount?.name || getSubaccountName(it.subaccount_id)}
                      </td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{it.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          it.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {it.is_active ? 'Ativa' : 'Inativa'}
                        </span>
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
      <CategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        category={selectedCategory}
        subaccounts={subaccounts}
        onSave={handleModalSave}
      />
    </Layout>
  );
}
