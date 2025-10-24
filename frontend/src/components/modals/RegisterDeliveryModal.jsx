import React, { useState, useEffect } from 'react';
import { X, Package, Mail, FileText, AlertCircle } from 'lucide-react';
import deliveryService from '../../services/deliveryService';
import { useTheme } from '../../contexts/ThemeContext';

const RegisterDeliveryModal = ({ isOpen, onClose, onSuccess, units }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    unit_id: '',
    recipient_name: '',
    type: 'package',
    sender: '',
    description: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      unit_id: '',
      recipient_name: '',
      type: 'package',
      sender: '',
      description: '',
      notes: ''
    });
    setErrors({});
    setGeneratedCode(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.unit_id) {
      newErrors.unit_id = 'Selecione a unidade';
    }

    if (!formData.recipient_name.trim()) {
      newErrors.recipient_name = 'Nome do destinatário é obrigatório';
    }

    if (!formData.type) {
      newErrors.type = 'Selecione o tipo de entrega';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await deliveryService.createDelivery(formData);
      // A API retorna diretamente o objeto, não precisa de .data
      setGeneratedCode(response.delivery.delivery_code);

      // Aguarda 3 segundos para mostrar o código antes de fechar
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error) {
      console.error('Erro ao registrar entrega:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Erro ao registrar entrega. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const deliveryTypes = [
    { value: 'package', label: 'Encomenda', icon: Package },
    { value: 'letter', label: 'Carta', icon: Mail },
    { value: 'document', label: 'Documento', icon: FileText },
    { value: 'other', label: 'Outro', icon: Package }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Registrar Nova Entrega
          </h2>
          <button
            onClick={onClose}
            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Código Gerado */}
        {generatedCode && (
          <div className={`p-6 ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'} border-b ${isDarkMode ? 'border-green-800' : 'border-green-200'}`}>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'} rounded-full mb-4`}>
                <Package className="w-8 h-8 text-green-500" />
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Entrega Registrada com Sucesso!
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Código para retirada:
              </p>
              <div className="text-4xl font-bold font-mono text-[#ff6600] tracking-wider">
                {generatedCode}
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>
                Informe este código ao morador para retirada
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        {!generatedCode && (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Unidade */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Unidade <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit_id"
                  value={formData.unit_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#ff6600] ${
                    errors.unit_id ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Selecione a unidade</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.block?.name ? `${unit.block.name} - ` : ''}{unit.number}
                    </option>
                  ))}
                </select>
                {errors.unit_id && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.unit_id}
                  </p>
                )}
              </div>

              {/* Nome do Destinatário */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Nome do Destinatário <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="recipient_name"
                  value={formData.recipient_name}
                  onChange={handleChange}
                  placeholder="Digite o nome do destinatário"
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#ff6600] ${
                    errors.recipient_name ? 'border-red-500' : ''
                  }`}
                />
                {errors.recipient_name && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.recipient_name}
                  </p>
                )}
              </div>

              {/* Tipo de Entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Entrega <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {deliveryTypes.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                        formData.type === value
                          ? 'border-[#ff6600] bg-[#ff6600]/10 text-[#ff6600]'
                          : isDarkMode
                          ? 'border-gray-700 hover:border-[#ff6600]/50 text-gray-300'
                          : 'border-gray-300 hover:border-[#ff6600]/50 text-gray-700'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.type}
                  </p>
                )}
              </div>

              {/* Remetente */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Remetente
                </label>
                <input
                  type="text"
                  name="sender"
                  value={formData.sender}
                  onChange={handleChange}
                  placeholder="Nome da empresa ou remetente"
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                />
              </div>

              {/* Descrição */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descrição adicional da entrega"
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                />
              </div>

              {/* Observações */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Observações
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Observações internas"
                  rows="2"
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                />
              </div>
            </div>

            {/* Footer */}
            <div className={`flex justify-end gap-3 px-6 py-4 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 ${
                  isDarkMode
                    ? 'text-gray-300 bg-gray-700 hover:bg-gray-600 border-gray-600'
                    : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
                } border rounded-lg transition-colors`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#ff6600] hover:bg-[#ff6600]/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Registrar Entrega'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterDeliveryModal;
