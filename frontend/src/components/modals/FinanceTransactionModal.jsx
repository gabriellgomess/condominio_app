import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Building2, AlertTriangle, Calendar, Layers } from 'lucide-react';
import { listSubaccounts } from '../../services/financeService';
import { useTheme } from '../../contexts/ThemeContext';

const FinanceTransactionModal = ({
  isOpen,
  onClose,
  mode = 'create', // 'create', 'edit', 'view'
  transaction = null,
  condominiums = [],
  type = 'revenue', // 'revenue' or 'expense'
  onSave
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    condominium_id: '',
    subaccount_id: '',
    source: 'cota',
    destination: 'cota',
    type: 'fixa',
    title: '',
    description: '',
    competency_date: '',
    amount: '',
    is_forecast: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [subaccounts, setSubaccounts] = useState([]);
  const [loadingSubaccounts, setLoadingSubaccounts] = useState(false);

  // Carregar subcontas quando o modal abrir ou o condomínio mudar
  useEffect(() => {
    const loadSubaccounts = async () => {
      if (!isOpen) return;

      setLoadingSubaccounts(true);
      try {
        const { data } = await listSubaccounts();
        setSubaccounts(data.data || data);
      } catch (error) {
        console.error('Erro ao carregar subcontas:', error);
        setSubaccounts([]);
      } finally {
        setLoadingSubaccounts(false);
      }
    };

    loadSubaccounts();
  }, [isOpen]);

  useEffect(() => {
    if (transaction && (mode === 'edit' || mode === 'view')) {
      setFormData({
        condominium_id: transaction.condominium_id || '',
        subaccount_id: transaction.subaccount_id || '',
        source: transaction.source || 'cota',
        destination: transaction.destination || 'cota',
        type: transaction.type || 'fixa',
        title: transaction.title || '',
        description: transaction.description || '',
        competency_date: transaction.competency_date?.slice(0, 10) || '',
        amount: transaction.amount || '',
        is_forecast: !!transaction.is_forecast
      });
    } else {
      resetForm();
    }
  }, [transaction, mode, isOpen]);

  const resetForm = () => {
    setFormData({
      condominium_id: condominiums.length > 0 ? condominiums[0].id : '',
      subaccount_id: '',
      source: 'cota',
      destination: 'cota',
      type: 'fixa',
      title: '',
      description: '',
      competency_date: '',
      amount: '',
      is_forecast: false
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
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
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.competency_date) {
      newErrors.competency_date = 'Data de competência é obrigatória';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
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
      const submitData = {
        ...formData,
        amount: Number(formData.amount)
      };

      // Chama a função onSave passada pelo pai com os dados e o modo
      await onSave(submitData, mode === 'edit' ? transaction?.id : null);
      onClose();
      resetForm();
    } catch (error) {
      console.error(`Erro ao salvar ${type === 'revenue' ? 'receita' : 'despesa'}:`, error);

      if (error.error?.details) {
        setErrors(error.error.details);
      } else {
        alert(`Erro ao salvar ${type === 'revenue' ? 'receita' : 'despesa'}. Tente novamente.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const title = type === 'revenue' ? 'Receita' : 'Despesa';
  const Icon = DollarSign;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ff6600]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff6600]/20 rounded-lg">
              <Icon className="w-6 h-6 text-[#ff6600]" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {mode === 'create' ? `Criar ${title}` :
                 mode === 'edit' ? `Editar ${title}` : `Visualizar ${title}`}
              </h2>
              {transaction && mode !== 'create' && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  ID: {transaction.id}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Condomínio */}
            <div className="lg:col-span-2">
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

            {/* Subconta */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                <Layers className="w-4 h-4 inline mr-2 text-[#ff6600]" />
                Subconta (Opcional)
              </label>
              <select
                name="subaccount_id"
                value={formData.subaccount_id}
                onChange={handleInputChange}
                disabled={mode === 'view' || loadingSubaccounts}
                className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                  mode === 'view' || loadingSubaccounts ? 'opacity-60' : ''
                }`}
              >
                <option value="" className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>
                  {loadingSubaccounts ? 'Carregando...' : 'Selecione uma subconta'}
                </option>
                {subaccounts
                  .filter(sub => !formData.condominium_id || sub.condominium_id === parseInt(formData.condominium_id))
                  .map(sub => (
                    <option key={sub.id} value={sub.id} className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>
                      {sub.name} {sub.code ? `(${sub.code})` : ''}
                    </option>
                  ))
                }
              </select>
            </div>

            {/* Título */}
            <div className="lg:col-span-3">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                placeholder={`Título da ${type === 'revenue' ? 'receita' : 'despesa'}`}
                className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                  mode === 'view' ? 'opacity-60' : ''
                } ${errors.title ? 'border-red-400' : ''}`}
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="lg:col-span-3">
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                Descrição (Opcional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                rows={3}
                placeholder={`Descrição da ${type === 'revenue' ? 'receita' : 'despesa'}`}
                className={`w-full ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} px-4 py-3 bg-[#0a0a0a] border border-[#ff6600]/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors resize-none ${
                  mode === 'view' ? 'opacity-60' : ''
                }`}
              />
            </div>

            {/* Origem */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                Origem
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                  mode === 'view' ? 'opacity-60' : ''
                }`}
              >
                <option value="cota" className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>Cota</option>
                <option value="po" className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>PO</option>
              </select>
            </div>

            {/* Destino */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                Destino
              </label>
              <select
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                  mode === 'view' ? 'opacity-60' : ''
                }`}
              >
                <option value="cota" className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>Cota</option>
                <option value="po" className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>PO</option>
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                Tipo
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                  mode === 'view' ? 'opacity-60' : ''
                }`}
              >
                <option value="fixa" className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>Fixa</option>
                <option value="variavel" className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>Variável</option>
              </select>
            </div>

            {/* Data de Competência */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                <Calendar className="w-4 h-4 inline mr-2 text-[#ff6600]" />
                Data de Competência *
              </label>
              <input
                type="date"
                name="competency_date"
                value={formData.competency_date}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                  mode === 'view' ? 'opacity-60' : ''
                } ${errors.competency_date ? 'border-red-400' : ''}`}
              />
              {errors.competency_date && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.competency_date}
                </p>
              )}
            </div>

            {/* Valor */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                placeholder="0,00"
                className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                  mode === 'view' ? 'opacity-60' : ''
                } ${errors.amount ? 'border-red-400' : ''}`}
              />
              {errors.amount && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Previsão */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-[#f3f7f1] cursor-pointer mt-6">
                <input
                  type="checkbox"
                  name="is_forecast"
                  checked={formData.is_forecast}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-4 h-4 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border border-[#ff6600]/20 rounded text-[#ff6600] focus:ring-2 focus:ring-[#ff6600]`}
                />
                <span className="text-sm">É uma previsão?</span>
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
                    {mode === 'edit' ? 'Salvar Alterações' : `Criar ${title}`}
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

export default FinanceTransactionModal;
