import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function MonthlyFeeModal({ isOpen, onClose, mode, monthlyFee, condominiums, onSave }) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    condominium_id: '',
    reference_month: '',
    base_value: '',
    due_date: '',
    issue_date: '',
    status: 'draft',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (monthlyFee && mode !== 'create') {
        setFormData({
          condominium_id: monthlyFee.condominium_id || '',
          reference_month: monthlyFee.reference_month ? monthlyFee.reference_month.slice(0, 10) : '',
          base_value: monthlyFee.base_value || '',
          due_date: monthlyFee.due_date ? monthlyFee.due_date.slice(0, 10) : '',
          issue_date: monthlyFee.issue_date ? monthlyFee.issue_date.slice(0, 10) : '',
          status: monthlyFee.status || 'draft',
          notes: monthlyFee.notes || ''
        });
      } else {
        setFormData({
          condominium_id: '',
          reference_month: '',
          base_value: '',
          due_date: '',
          issue_date: '',
          status: 'draft',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, monthlyFee, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.condominium_id) newErrors.condominium_id = 'Condomínio é obrigatório';
    if (!formData.reference_month) newErrors.reference_month = 'Mês de referência é obrigatório';
    if (!formData.base_value) newErrors.base_value = 'Valor base é obrigatório';
    if (!formData.due_date) newErrors.due_date = 'Data de vencimento é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave(formData, monthlyFee?.id);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors({ submit: 'Erro ao salvar mensalidade. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="sticky top-0 bg-[#ff6600] px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {mode === 'create' && 'Nova Mensalidade'}
            {mode === 'edit' && 'Editar Mensalidade'}
            {mode === 'view' && 'Visualizar Mensalidade'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condomínio */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Condomínio *
              </label>
              <select
                name="condominium_id"
                value={formData.condominium_id}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.condominium_id ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Selecione...</option>
                {condominiums.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.condominium_id && <p className="text-red-400 text-sm mt-1">{errors.condominium_id}</p>}
            </div>

            {/* Mês de Referência */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Mês de Referência *
              </label>
              <input
                type="date"
                name="reference_month"
                value={formData.reference_month}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.reference_month ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.reference_month && <p className="text-red-400 text-sm mt-1">{errors.reference_month}</p>}
            </div>

            {/* Valor Base */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Valor Base (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                name="base_value"
                value={formData.base_value}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="0.00"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.base_value ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.base_value && <p className="text-red-400 text-sm mt-1">{errors.base_value}</p>}
            </div>

            {/* Data de Vencimento */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Data de Vencimento *
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.due_date ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.due_date && <p className="text-red-400 text-sm mt-1">{errors.due_date}</p>}
            </div>

            {/* Data de Emissão */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Data de Emissão
              </label>
              <input
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="draft">Rascunho</option>
                <option value="issued">Emitido</option>
                <option value="closed">Fechado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
              Observações
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isViewMode}
              rows="3"
              className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Footer */}
          {!isViewMode && (
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#ff6600]/30 text-[#ff6600] rounded-lg hover:bg-[#ff6600]/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}

          {isViewMode && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
