import React from 'react';
import { X, Package, Mail, FileText, User, Home, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ViewDeliveryModal = ({ isOpen, onClose, delivery }) => {
  const { isDarkMode } = useTheme();

  if (!isOpen || !delivery) return null;

  const getTypeIcon = (type) => {
    const icons = {
      package: <Package className="w-5 h-5" />,
      letter: <Mail className="w-5 h-5" />,
      document: <FileText className="w-5 h-5" />,
      other: <Package className="w-5 h-5" />
    };
    return icons[type] || icons.package;
  };

  const getTypeLabel = (type) => {
    const labels = {
      package: 'Encomenda',
      letter: 'Carta',
      document: 'Documento',
      other: 'Outro'
    };
    return labels[type] || 'Encomenda';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'Pendente',
        className: isDarkMode
          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
          : 'bg-yellow-100 text-yellow-800 border-yellow-300'
      },
      collected: {
        label: 'Retirada',
        className: isDarkMode
          ? 'bg-green-500/20 text-green-400 border-green-500/30'
          : 'bg-green-100 text-green-800 border-green-300'
      },
      returned: {
        label: 'Devolvida',
        className: isDarkMode
          ? 'bg-red-500/20 text-red-400 border-red-500/30'
          : 'bg-red-100 text-red-800 border-red-300'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUnitLabel = (unit) => {
    if (!unit) return '-';
    return `${unit.block?.name || ''} - ${unit.number}`.trim();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Detalhes da Entrega
          </h2>
          <button
            onClick={onClose}
            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Código e Status */}
          <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg`}>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Código da Entrega</p>
              <p className={`text-2xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-wider`}>
                {delivery.delivery_code}
              </p>
            </div>
            {getStatusBadge(delivery.status)}
          </div>

          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div className={`flex items-start gap-3 p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
              <div className="text-[#ff6600]">
                {getTypeIcon(delivery.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tipo</p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getTypeLabel(delivery.type)}
                </p>
              </div>
            </div>

            {/* Unidade */}
            <div className={`flex items-start gap-3 p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
              <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unidade</p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getUnitLabel(delivery.unit)}
                </p>
              </div>
            </div>

            {/* Destinatário */}
            <div className={`flex items-start gap-3 p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Destinatário</p>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {delivery.recipient_name}
                </p>
              </div>
            </div>

            {/* Remetente */}
            {delivery.sender && (
              <div className={`flex items-start gap-3 p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remetente</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {delivery.sender}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Descrição */}
          {delivery.description && (
            <div className={`p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Descrição</p>
              <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{delivery.description}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <Clock className="w-5 h-5 text-[#ff6600]" />
              Histórico
            </h3>

            <div className={`space-y-3 pl-3 border-l-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Recebimento */}
              <div className="pl-4 relative">
                <div className="absolute -left-[13px] w-6 h-6 bg-[#ff6600] rounded-full flex items-center justify-center">
                  <Package className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Entrega Recebida
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDateTime(delivery.received_at)}
                  </p>
                  {delivery.received_by_user && (
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Por: {delivery.received_by_user.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Retirada */}
              {delivery.status === 'collected' && delivery.collected_at && (
                <div className="pl-4 relative">
                  <div className="absolute -left-[13px] w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Entrega Retirada
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDateTime(delivery.collected_at)}
                    </p>
                    {delivery.delivered_to_user && (
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Retirado por: {delivery.delivered_to_user.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {delivery.notes && (
            <div className={`p-4 ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${isDarkMode ? 'border-yellow-800' : 'border-yellow-200'} rounded-lg`}>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Observações
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{delivery.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex justify-end px-6 py-4 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg transition-colors`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDeliveryModal;
