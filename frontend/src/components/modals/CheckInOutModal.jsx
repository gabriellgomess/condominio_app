import React, { useState } from 'react';
import { X, LogIn, LogOut, AlertTriangle, CheckCircle } from 'lucide-react';
import visitorService from '../../services/visitorService';

const CheckInOutModal = ({ visitor, action, onClose, onSuccess, isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!visitor || !action) return null;

  const isCheckIn = action === 'check-in';
  const Icon = isCheckIn ? LogIn : LogOut;
  const title = isCheckIn ? 'Registrar Entrada' : 'Registrar Saída';
  const buttonText = isCheckIn ? 'Registrar Entrada' : 'Registrar Saída';
  const buttonColor = isCheckIn ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = isCheckIn
        ? await visitorService.checkInVisitor(visitor.id)
        : await visitorService.checkOutVisitor(visitor.id);

      if (response.status === 'success') {
        onSuccess();
      } else {
        setError(response.message || `Erro ao realizar ${isCheckIn ? 'check-in' : 'check-out'}`);
      }
    } catch (err) {
      console.error(`Erro ao realizar ${action}:`, err);
      setError(err.message || `Erro ao realizar ${isCheckIn ? 'check-in' : 'check-out'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={`relative w-full max-w-md rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isCheckIn ? 'bg-green-100 dark:bg-green-900/20' : 'bg-orange-100 dark:bg-orange-900/20'
              }`}>
                <Icon className={`w-6 h-6 ${
                  isCheckIn ? 'text-green-600' : 'text-orange-600'
                }`} />
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Informações do Visitante */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {visitor.name}
                </h4>
                <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {visitor.unit && (
                    <p>Unidade: {visitor.unit.block} {visitor.unit.number}</p>
                  )}
                  {visitor.phone && (
                    <p>Telefone: {visitor.phone}</p>
                  )}
                  {visitor.vehicle_plate && (
                    <p>Veículo: {visitor.vehicle_plate}</p>
                  )}
                  {visitor.scheduled_date && (
                    <p>
                      Agendamento: {new Date(visitor.scheduled_date).toLocaleDateString('pt-BR')}
                      {visitor.scheduled_time && ` às ${visitor.scheduled_time}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Mensagem de Confirmação */}
              <div className={`flex items-start gap-3 p-4 rounded-lg ${
                isCheckIn
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-orange-50 dark:bg-orange-900/20'
              }`}>
                <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  isCheckIn ? 'text-green-600' : 'text-orange-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    isCheckIn ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'
                  }`}>
                    {isCheckIn
                      ? 'Confirme o registro de entrada do visitante'
                      : 'Confirme o registro de saída do visitante'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    isCheckIn ? 'text-green-700 dark:text-green-200' : 'text-orange-700 dark:text-orange-200'
                  }`}>
                    {isCheckIn
                      ? 'A data e hora atuais serão registradas como entrada.'
                      : 'A data e hora atuais serão registradas como saída.'}
                  </p>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`flex justify-end gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-lg transition-colors ${buttonColor} text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                <Icon className="w-5 h-5" />
                {loading ? 'Processando...' : buttonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckInOutModal;
