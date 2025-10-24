import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import billingService from '../../services/billingService';

export default function UnitBillingModal({ isOpen, onClose, mode, unitBilling, condominiums, units, onSave }) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    monthly_fee_id: '',
    unit_id: '',
    condominium_id: '',
    ideal_fraction: '',
    base_amount: '',
    additional_charges: '0',
    discounts: '0',
    total_amount: '',
    barcode: '',
    digitable_line: '',
    our_number: '',
    due_date: '',
    status: 'pending',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [monthlyFees, setMonthlyFees] = useState([]);

  useEffect(() => {
    if (isOpen && formData.condominium_id) {
      loadMonthlyFees(formData.condominium_id);
    }
  }, [isOpen, formData.condominium_id]);

  const loadMonthlyFees = async (condominiumId) => {
    try {
      const response = await billingService.getMonthlyFees({ condominium_id: condominiumId });
      setMonthlyFees(response.data || response);
    } catch (error) {
      console.error('Erro ao carregar mensalidades:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (unitBilling && mode !== 'create') {
        setFormData({
          monthly_fee_id: unitBilling.monthly_fee_id || '',
          unit_id: unitBilling.unit_id || '',
          condominium_id: unitBilling.monthly_fee?.condominium_id || '',
          ideal_fraction: unitBilling.ideal_fraction || '',
          base_amount: unitBilling.base_amount || '',
          additional_charges: unitBilling.additional_charges || '0',
          discounts: unitBilling.discounts || '0',
          total_amount: unitBilling.total_amount || '',
          barcode: unitBilling.barcode || '',
          digitable_line: unitBilling.digitable_line || '',
          our_number: unitBilling.our_number || '',
          due_date: unitBilling.due_date ? unitBilling.due_date.slice(0, 10) : '',
          status: unitBilling.status || 'pending',
          notes: unitBilling.notes || ''
        });
      } else {
        setFormData({
          monthly_fee_id: '',
          unit_id: '',
          condominium_id: '',
          ideal_fraction: '',
          base_amount: '',
          additional_charges: '0',
          discounts: '0',
          total_amount: '',
          barcode: '',
          digitable_line: '',
          our_number: '',
          due_date: '',
          status: 'pending',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, unitBilling, mode]);

  useEffect(() => {
    // Recalcula total quando mudam os valores
    const base = parseFloat(formData.base_amount) || 0;
    const additional = parseFloat(formData.additional_charges) || 0;
    const disc = parseFloat(formData.discounts) || 0;
    const total = base + additional - disc;
    setFormData(prev => ({ ...prev, total_amount: total.toFixed(2) }));
  }, [formData.base_amount, formData.additional_charges, formData.discounts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Debug: quando mudar o condomínio, mostrar quantas unidades foram filtradas
    if (name === 'condominium_id') {
      const filtered = units.filter(u => {
        if (!value) return true;
        const selectedCondoId = parseInt(value);
        return u.condominium_id === selectedCondoId || u.block?.condominium_id === selectedCondoId;
      });
      console.log(`Condomínio ${value} selecionado. ${filtered.length} unidades encontradas.`);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.monthly_fee_id) newErrors.monthly_fee_id = 'Mensalidade é obrigatória';
    if (!formData.unit_id) newErrors.unit_id = 'Unidade é obrigatória';
    if (!formData.base_amount) newErrors.base_amount = 'Valor base é obrigatório';
    if (!formData.total_amount) newErrors.total_amount = 'Valor total é obrigatório';
    if (!formData.due_date) newErrors.due_date = 'Data de vencimento é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Remove condominium_id do formData antes de enviar (é apenas para filtros)
      const { condominium_id, ...dataToSave } = formData;
      await onSave(dataToSave, unitBilling?.id);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors({ submit: 'Erro ao salvar cobrança. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-[#ff6600] px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {mode === 'create' && 'Nova Cobrança'}
            {mode === 'edit' && 'Editar Cobrança'}
            {mode === 'view' && 'Visualizar Cobrança'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

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
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Selecione...</option>
                {condominiums.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Mensalidade */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Mensalidade *
              </label>
              <select
                name="monthly_fee_id"
                value={formData.monthly_fee_id}
                onChange={handleChange}
                disabled={isViewMode || !formData.condominium_id}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.monthly_fee_id ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode || !formData.condominium_id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {!formData.condominium_id ? 'Selecione o condomínio primeiro' : 'Selecione...'}
                </option>
                {monthlyFees.map(mf => (
                  <option key={mf.id} value={mf.id}>
                    {new Date(mf.reference_month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
              {errors.monthly_fee_id && <p className="text-red-400 text-sm mt-1">{errors.monthly_fee_id}</p>}
            </div>

            {/* Unidade */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Unidade *
              </label>
              <select
                name="unit_id"
                value={formData.unit_id}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.unit_id ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Selecione...</option>
                {units
                  .filter(u => {
                    if (!formData.condominium_id) return true;
                    const selectedCondoId = parseInt(formData.condominium_id);
                    return u.condominium_id === selectedCondoId || u.block?.condominium_id === selectedCondoId;
                  })
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.block?.name || 'Sem bloco'} - {u.number}
                    </option>
                  ))}
              </select>
              {errors.unit_id && <p className="text-red-400 text-sm mt-1">{errors.unit_id}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Fração Ideal
              </label>
              <input
                type="number"
                step="0.000001"
                name="ideal_fraction"
                value={formData.ideal_fraction}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="0.012345"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Valor Base (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                name="base_amount"
                value={formData.base_amount}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.base_amount ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.base_amount && <p className="text-red-400 text-sm mt-1">{errors.base_amount}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Taxas Adicionais (R$)
              </label>
              <input
                type="number"
                step="0.01"
                name="additional_charges"
                value={formData.additional_charges}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Descontos (R$)
              </label>
              <input
                type="number"
                step="0.01"
                name="discounts"
                value={formData.discounts}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Valor Total (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleChange}
                disabled={true}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } opacity-50 cursor-not-allowed`}
              />
            </div>

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
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencido</option>
                <option value="partially_paid">Pago Parcialmente</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Código de Barras
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Código de barras do boleto"
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Linha Digitável
              </label>
              <input
                type="text"
                name="digitable_line"
                value={formData.digitable_line}
                onChange={handleChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Linha digitável do boleto"
              />
            </div>
          </div>

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
            />
          </div>

          {!isViewMode && (
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#ff6600]/30 text-[#ff6600] rounded-lg hover:bg-[#ff6600]/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 disabled:opacity-50"
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
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80"
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
