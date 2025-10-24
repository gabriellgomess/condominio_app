import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import billingService from '../../services/billingService';

export default function PaymentModal({ isOpen, onClose, unitBilling, onSave }) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    unit_billing_id: '',
    payment_date: new Date().toISOString().slice(0, 10),
    amount_paid: '',
    payment_method: 'bank_slip',
    reference: '',
    bank_reference: '',
    source: 'manual',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && unitBilling) {
      setFormData(prev => ({
        ...prev,
        unit_billing_id: unitBilling.id,
        amount_paid: unitBilling.balance > 0 ? unitBilling.balance.toFixed(2) : ''
      }));
      setErrors({});
    }
  }, [isOpen, unitBilling]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.payment_date) newErrors.payment_date = 'Data de pagamento é obrigatória';
    if (!formData.amount_paid || parseFloat(formData.amount_paid) <= 0) {
      newErrors.amount_paid = 'Valor pago deve ser maior que zero';
    }
    if (!formData.payment_method) newErrors.payment_method = 'Método de pagamento é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors({ submit: 'Erro ao registrar pagamento. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !unitBilling) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-[#ff6600] px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Registrar Pagamento
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

          {/* Informações da Cobrança */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Informações da Cobrança
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className={isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-500'}>Unidade:</span>
                <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {unitBilling.unit?.block?.name} - {unitBilling.unit?.number}
                </span>
              </div>
              <div>
                <span className={isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-500'}>Vencimento:</span>
                <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {billingService.formatDate(unitBilling.due_date)}
                </span>
              </div>
              <div>
                <span className={isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-500'}>Valor Total:</span>
                <span className="ml-2 text-blue-400 font-medium">
                  {billingService.formatCurrency(unitBilling.total_amount)}
                </span>
              </div>
              <div>
                <span className={isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-500'}>Já Pago:</span>
                <span className="ml-2 text-green-400 font-medium">
                  {billingService.formatCurrency(unitBilling.amount_paid)}
                </span>
              </div>
              <div className="col-span-2">
                <span className={isDarkMode ? 'text-[#f3f7f1]/60' : 'text-gray-500'}>Saldo Devedor:</span>
                <span className="ml-2 text-red-400 font-medium">
                  {billingService.formatCurrency(unitBilling.balance)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data do Pagamento */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Data do Pagamento *
              </label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.payment_date ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              />
              {errors.payment_date && <p className="text-red-400 text-sm mt-1">{errors.payment_date}</p>}
            </div>

            {/* Valor Pago */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Valor Pago (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                name="amount_paid"
                value={formData.amount_paid}
                onChange={handleChange}
                placeholder="0.00"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.amount_paid ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              />
              {errors.amount_paid && <p className="text-red-400 text-sm mt-1">{errors.amount_paid}</p>}
            </div>

            {/* Método de Pagamento */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Método de Pagamento *
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.payment_method ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="bank_slip">Boleto</option>
                <option value="transfer">Transferência Bancária</option>
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="cash">Dinheiro</option>
                <option value="other">Outro</option>
              </select>
              {errors.payment_method && <p className="text-red-400 text-sm mt-1">{errors.payment_method}</p>}
            </div>

            {/* Origem */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Origem do Registro
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="manual">Manual</option>
                <option value="bank_file">Arquivo Bancário</option>
                <option value="api">API/Integração</option>
              </select>
            </div>

            {/* Referência */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Referência/Comprovante
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Número do comprovante"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              />
            </div>

            {/* Referência Bancária */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-700'}`}>
                Código de Autenticação
              </label>
              <input
                type="text"
                name="bank_reference"
                value={formData.bank_reference}
                onChange={handleChange}
                placeholder="Código de autenticação bancária"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              />
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
              rows="3"
              className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              } focus:border-[#ff6600] focus:outline-none`}
              placeholder="Observações sobre o pagamento..."
            />
          </div>

          {/* Footer */}
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
              className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Registrando...' : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Registrar Pagamento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
