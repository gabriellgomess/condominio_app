import React from 'react';
import { X, User, FileText, Phone, MapPin, Calendar, Clock, Car, AlertCircle } from 'lucide-react';
import config from '../../config/environment';

const ViewVisitorModal = ({ visitor, onClose, isDarkMode }) => {
  if (!visitor) return null;

  const visitorTypes = {
    personal: 'Visitante',
    service: 'Prestador de Serviço',
    delivery: 'Entregador',
    taxi: 'Taxi/App',
    other: 'Outro'
  };

  const documentTypes = {
    rg: 'RG',
    cpf: 'CPF',
    cnh: 'CNH',
    other: 'Outro'
  };

  const statusLabels = {
    pending: 'Aguardando Validação',
    scheduled: 'Agendado',
    checked_in: 'No Condomínio',
    checked_out: 'Saiu',
    cancelled: 'Cancelado',
    rejected: 'Rejeitado'
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    }
    return timeString;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
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
          className={`relative w-full max-w-4xl rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Detalhes do Visitante
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
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Pessoais */}
              <div className="space-y-4">
                <h4 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Informações Pessoais
                </h4>

                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nome
                  </label>
                  <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {visitor.name}
                  </p>
                </div>

                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tipo de Visitante
                  </label>
                  <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {visitorTypes[visitor.visitor_type] || visitor.visitor_type}
                  </p>
                </div>

                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Documento
                  </label>
                  <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {documentTypes[visitor.document_type] || visitor.document_type}
                    {visitor.document_number && `: ${visitor.document_number}`}
                  </p>
                </div>

                {visitor.phone && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Telefone
                    </label>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {visitor.phone}
                    </p>
                  </div>
                )}

                {visitor.purpose && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Motivo da Visita
                    </label>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {visitor.purpose}
                    </p>
                  </div>
                )}
              </div>

              {/* Informações da Visita */}
              <div className="space-y-4">
                <h4 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Informações da Visita
                </h4>

                {visitor.unit && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Unidade
                    </label>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {visitor.unit.block} {visitor.unit.number}
                    </p>
                  </div>
                )}

                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Status
                  </label>
                  <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {statusLabels[visitor.status] || visitor.status}
                  </p>
                </div>

                {visitor.scheduled_date && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Data e Hora Agendada
                    </label>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(visitor.scheduled_date)}
                      {visitor.scheduled_time && ` às ${formatTime(visitor.scheduled_time)}`}
                    </p>
                  </div>
                )}

                {visitor.entry_date && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Data/Hora de Entrada
                    </label>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDateTime(visitor.entry_date)}
                    </p>
                  </div>
                )}

                {visitor.exit_date && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Data/Hora de Saída
                    </label>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDateTime(visitor.exit_date)}
                    </p>
                  </div>
                )}

                {/* Veículo */}
                {(visitor.vehicle_plate || visitor.vehicle_model || visitor.vehicle_color) && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Veículo
                    </label>
                    <div className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {visitor.vehicle_plate && <p>Placa: {visitor.vehicle_plate}</p>}
                      {visitor.vehicle_model && <p>Modelo: {visitor.vehicle_model}</p>}
                      {visitor.vehicle_color && <p>Cor: {visitor.vehicle_color}</p>}
                    </div>
                  </div>
                )}

                {visitor.notes && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Observações
                    </label>
                    <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {visitor.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Fotos dos Documentos */}
            {(visitor.document_photo_front || visitor.document_photo_back) && (
              <div className="mt-6">
                <h4 className={`font-semibold text-lg mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Documentos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visitor.document_photo_front && (
                    <div>
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Frente do Documento
                      </label>
                      <img
                        src={`${config.API_BASE_URL}/storage/${visitor.document_photo_front}`}
                        alt="Frente do documento"
                        className="mt-2 w-full h-64 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  {visitor.document_photo_back && (
                    <div>
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Verso do Documento
                      </label>
                      <img
                        src={`${config.API_BASE_URL}/storage/${visitor.document_photo_back}`}
                        alt="Verso do documento"
                        className="mt-2 w-full h-64 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`flex justify-end gap-3 p-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVisitorModal;
