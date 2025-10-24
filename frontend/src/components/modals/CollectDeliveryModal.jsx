import React, { useState, useEffect } from 'react';
import { X, QrCode, AlertCircle, CheckCircle, Package } from 'lucide-react';
import deliveryService from '../../services/deliveryService';
import { useTheme } from '../../contexts/ThemeContext';

const CollectDeliveryModal = ({ isOpen, onClose, onSuccess, delivery }) => {
  const { isDarkMode } = useTheme();
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [searchedDelivery, setSearchedDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    } else if (delivery) {
      setSearchedDelivery(delivery);
    }
  }, [isOpen, delivery]);

  const resetForm = () => {
    setCode('');
    setNotes('');
    setSearchedDelivery(null);
    setError('');
    setSuccess(false);
  };

  const handleSearchByCode = async () => {
    if (code.length !== 8) {
      setError('O código deve ter 8 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await deliveryService.findByCode(code);
      // A API retorna diretamente o objeto da entrega
      setSearchedDelivery(response);

      if (response.status !== 'pending') {
        setError('Esta entrega já foi retirada ou devolvida');
      }
    } catch (error) {
      setError('Código não encontrado ou inválido');
      setSearchedDelivery(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async () => {
    if (!searchedDelivery) {
      setError('Busque uma entrega primeiro');
      return;
    }

    if (searchedDelivery.status !== 'pending') {
      setError('Esta entrega não está disponível para retirada');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deliveryService.collectDelivery(searchedDelivery.id, code, notes);
      setSuccess(true);

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Erro ao coletar entrega:', error);
      setError(error.response?.data?.message || 'Erro ao registrar retirada');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 8) {
      setCode(value);
      setError('');
    }
  };

  if (!isOpen) return null;

  const getUnitLabel = (unit) => {
    if (!unit) return '-';
    return `${unit.block?.name || ''} - ${unit.number}`.trim();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-lg w-full border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <QrCode className="w-6 h-6 text-[#ff6600]" />
            Registrar Retirada
          </h2>
          <button
            onClick={onClose}
            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="p-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'} rounded-full mb-4`}>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Retirada Registrada!
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                A entrega foi marcada como coletada com sucesso.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Input do Código */}
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Código da Entrega
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="Digite o código"
                    maxLength={8}
                    className={`flex-1 px-4 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white placeholder-[#ff6600]/40'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } font-mono text-lg text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-[#ff6600] ${
                      error ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    onClick={handleSearchByCode}
                    disabled={loading || code.length !== 8}
                    className="px-4 py-2 bg-[#ff6600] hover:bg-[#ff6600]/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
                <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Digite o código de 8 caracteres fornecido ao morador
                </p>
              </div>

              {/* Erro */}
              {error && (
                <div className={`p-3 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${isDarkMode ? 'border-red-800' : 'border-red-200'} rounded-lg`}>
                  <div className={`flex items-center gap-2 ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Informações da Entrega Encontrada */}
              {searchedDelivery && (
                <div className={`p-4 ${isDarkMode ? 'bg-[#ff6600]/10' : 'bg-orange-50'} border ${isDarkMode ? 'border-[#ff6600]/30' : 'border-orange-200'} rounded-lg`}>
                  <div className="flex items-start gap-3">
                    <Package className="w-8 h-8 text-[#ff6600] mt-1" />
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Entrega Encontrada
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Código:</span>
                          <span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {searchedDelivery.delivery_code}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Unidade:</span>
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {getUnitLabel(searchedDelivery.unit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Destinatário:</span>
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {searchedDelivery.recipient_name}
                          </span>
                        </div>
                        {searchedDelivery.sender && (
                          <div className="flex justify-between">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Remetente:</span>
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                              {searchedDelivery.sender}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Recebido em:</span>
                          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                            {new Date(searchedDelivery.received_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Observações */}
              {searchedDelivery && searchedDelivery.status === 'pending' && (
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Observações (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione observações sobre a retirada..."
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-[#080d08]/80 border-[#ff6600]/30 text-white placeholder-[#ff6600]/40'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-[#ff6600]`}
                  />
                </div>
              )}
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
                onClick={handleCollect}
                disabled={!searchedDelivery || searchedDelivery.status !== 'pending' || loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Confirmar Retirada'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CollectDeliveryModal;
