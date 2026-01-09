import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import visitorService from '../../services/visitorService';

const ValidateVisitorModal = ({ visitor, onClose, onSuccess, isDarkMode }) => {
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!visitor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!action) {
      setError('Selecione uma ação (Aprovar ou Rejeitar)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await visitorService.validateVisitor(visitor.id, action, notes || null);

      if (response.status === 'success') {
        onSuccess();
      } else {
        setError(response.message || 'Erro ao validar visitante');
      }
    } catch (err) {
      console.error('Erro ao validar visitante:', err);
      setError(err.message || 'Erro ao validar visitante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 transition-opacity"
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
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Validar Visitante
            </h3>
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
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {visitor.unit && `Unidade: ${visitor.unit.block} ${visitor.unit.number}`}
                </p>
                {visitor.scheduled_date && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Data: {new Date(visitor.scheduled_date).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              {/* Ação */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Ação *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAction('approve')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      action === 'approve'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : isDarkMode
                        ? 'border-gray-600 hover:border-green-500'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                      action === 'approve' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      action === 'approve'
                        ? 'text-green-600'
                        : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Aprovar
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction('reject')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      action === 'reject'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : isDarkMode
                        ? 'border-gray-600 hover:border-red-500'
                        : 'border-gray-300 hover:border-red-500'
                    }`}
                  >
                    <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                      action === 'reject' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      action === 'reject'
                        ? 'text-red-600'
                        : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Rejeitar
                    </p>
                  </button>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Observações (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Adicione observações sobre a validação..."
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                />
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
                disabled={loading || !action}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : action === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ValidateVisitorModal;
