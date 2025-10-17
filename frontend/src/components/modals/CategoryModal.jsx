import React, { useState, useEffect } from 'react';
import { X, Save, Tag, Layers, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const CategoryModal = ({
  isOpen,
  onClose,
  mode = 'create', // 'create', 'edit', 'view'
  category = null,
  subaccounts = [],
  onSave
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    subaccount_id: '',
    name: '',
    description: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category && (mode === 'edit' || mode === 'view')) {
      setFormData({
        subaccount_id: category.subaccount_id || '',
        name: category.name || '',
        description: category.description || '',
        is_active: category.is_active !== undefined ? category.is_active : true
      });
    } else {
      resetForm();
    }
  }, [category, mode, isOpen]);

  const resetForm = () => {
    setFormData({
      subaccount_id: subaccounts.length > 0 ? subaccounts[0].id : '',
      name: '',
      description: '',
      is_active: true
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subaccount_id) {
      newErrors.subaccount_id = 'Subconta é obrigatória';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Chama a função onSave passada pelo pai com os dados e o modo
      await onSave(formData, mode === 'edit' ? category?.id : null);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);

      if (error.error?.details) {
        setErrors(error.error.details);
      } else {
        alert('Erro ao salvar categoria. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getSubaccountName = (id) => {
    const sub = subaccounts.find(s => s.id === id);
    return sub ? sub.name : '';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ff6600]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff6600]/20 rounded-lg">
              <Tag className="w-6 h-6 text-[#ff6600]" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {mode === 'create' ? 'Criar Categoria' :
                 mode === 'edit' ? 'Editar Categoria' : 'Visualizar Categoria'}
              </h2>
              {category && mode !== 'create' && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  ID: {category.id}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} hover:bg-[#ff6600]/20 rounded-lg transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Subconta */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                <Layers className="w-4 h-4 inline mr-2 text-[#ff6600]" />
                Subconta *
              </label>
              <select
                name="subaccount_id"
                value={formData.subaccount_id}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                  mode === 'view' ? 'opacity-60' : ''
                } ${errors.subaccount_id ? 'border-red-400' : ''}`}
              >
                <option value="" className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>Selecione uma subconta</option>
                {subaccounts.map(sub => (
                  <option key={sub.id} value={sub.id} className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>
                    {sub.name}
                  </option>
                ))}
              </select>
              {errors.subaccount_id && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.subaccount_id}
                </p>
              )}
            </div>

            {/* Nome */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                Nome da Categoria *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                placeholder="Ex: Manutenção, Limpeza, Segurança..."
                className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                  mode === 'view' ? 'opacity-60' : ''
                } ${errors.name ? 'border-red-400' : ''}`}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                placeholder="Descrição da categoria (opcional)"
                rows={3}
                className={`w-full px-4 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} py-3 bg-[#0a0a0a] border border-[#ff6600]/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors resize-none ${
                  mode === 'view' ? 'opacity-60' : ''
                }`}
              />
            </div>

            {/* Status Ativo */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-5 h-5 rounded border-[#ff6600]/20 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} text-[#ff6600] focus:ring-2 focus:ring-[#ff6600]/50 disabled:opacity-60`}
              />
              <label htmlFor="is_active" className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} cursor-pointer`}>
                Categoria Ativa
              </label>
            </div>
          </div>

          {/* Actions */}
          {mode !== 'view' && (
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#ff6600]/20">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 ${isDarkMode ? 'bg-[#0a0a0a] text-gray-400 hover:bg-gray-600/20 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg transition-colors`}
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 inline mr-2" />
                    {mode === 'edit' ? 'Salvar Alterações' : 'Criar Categoria'}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
