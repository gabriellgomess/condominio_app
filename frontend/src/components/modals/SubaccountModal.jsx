import React, { useState, useEffect } from 'react';
import { X, Save, Layers, Building2, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SubaccountModal = ({
  isOpen,
  onClose,
  mode = 'create', // 'create', 'edit', 'view'
  subaccount = null,
  condominiums = [],
  onSave
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    condominium_id: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (subaccount && (mode === 'edit' || mode === 'view')) {
      setFormData({
        condominium_id: subaccount.condominium_id || '',
        name: subaccount.name || ''
      });
    } else {
      resetForm();
    }
  }, [subaccount, mode, isOpen]);

  const resetForm = () => {
    setFormData({
      condominium_id: condominiums.length > 0 ? condominiums[0].id : '',
      name: ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.condominium_id) {
      newErrors.condominium_id = 'Condomínio é obrigatório';
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
      await onSave(formData, mode === 'edit' ? subaccount?.id : null);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar subconta:', error);

      if (error.error?.details) {
        setErrors(error.error.details);
      } else {
        alert('Erro ao salvar subconta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ff6600]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff6600]/20 rounded-lg">
              <Layers className="w-6 h-6 text-[#ff6600]" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {mode === 'create' ? 'Criar Subconta' :
                 mode === 'edit' ? 'Editar Subconta' : 'Visualizar Subconta'}
              </h2>
              {subaccount && mode !== 'create' && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  ID: {subaccount.id}
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
            {/* Condomínio */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                <Building2 className="w-4 h-4 inline mr-2 text-[#ff6600]" />
                Condomínio *
              </label>
              <select
                name="condominium_id"
                value={formData.condominium_id}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                  mode === 'view' ? 'opacity-60' : ''
                } ${errors.condominium_id ? 'border-red-400' : ''}`}
              >
                <option value="" className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>Selecione um condomínio</option>
                {condominiums.map(condo => (
                  <option key={condo.id} value={condo.id} className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>
                    {condo.name}
                  </option>
                ))}
              </select>
              {errors.condominium_id && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.condominium_id}
                </p>
              )}
            </div>

            {/* Nome */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                Nome da Subconta *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                placeholder="Digite o nome da subconta"
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
                    {mode === 'edit' ? 'Salvar Alterações' : 'Criar Subconta'}
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

export default SubaccountModal;
