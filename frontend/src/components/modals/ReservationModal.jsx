import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, Calendar, Clock, User, MapPin, AlertTriangle } from 'lucide-react';
import { reservationService } from '../../services/reservationService';

const ReservationModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  reservation = null,
  condominiumId = '',
  configuredSpaces = [],
  onSave 
}) => {
  const [formData, setFormData] = useState({
    space_id: '',
    reservation_date: '',
    start_time: '',
    end_time: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    event_type: '',
    event_description: '',
    expected_guests: '',
    user_notes: ''
  });
  
  const [availability, setAvailability] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (reservation && (mode === 'edit' || mode === 'view')) {
      setFormData({
        space_id: reservation.space_id || '',
        reservation_date: reservation.reservation_date || '',
        start_time: reservation.start_time?.substring(0, 5) || '', // HH:MM
        end_time: reservation.end_time?.substring(0, 5) || '', // HH:MM
        contact_name: reservation.contact_name || '',
        contact_phone: reservation.contact_phone || '',
        contact_email: reservation.contact_email || '',
        event_type: reservation.event_type || '',
        event_description: reservation.event_description || '',
        expected_guests: reservation.expected_guests || '',
        user_notes: reservation.user_notes || ''
      });
    } else {
      setFormData({
        space_id: '',
        reservation_date: '',
        start_time: '',
        end_time: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        event_type: '',
        event_description: '',
        expected_guests: '',
        user_notes: ''
      });
    }
    setErrors({});
    setAvailability(null);
    setConflicts([]);
  }, [reservation, mode, isOpen]);

  // Verificar disponibilidade quando data e espaço mudarem
  useEffect(() => {
    if (formData.space_id && formData.reservation_date) {
      checkAvailability();
    }
  }, [formData.space_id, formData.reservation_date]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value) : '') : value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Limpar conflitos quando dados relevantes mudarem
    if (['space_id', 'reservation_date', 'start_time', 'end_time'].includes(name)) {
      setConflicts([]);
      if (errors.submit) {
        setErrors(prev => ({
          ...prev,
          submit: ''
        }));
      }
    }
  };

  const checkAvailability = async () => {
    if (!formData.space_id || !formData.reservation_date) return;

    setCheckingAvailability(true);
    try {
      const response = await reservationService.getAvailability(formData.space_id, formData.reservation_date);
      if (response.status === 'success') {
        setAvailability(response.data);
        
        // Se não estiver disponível, limpar horários
        if (!response.data.available) {
          setFormData(prev => ({
            ...prev,
            start_time: '',
            end_time: ''
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.space_id) {
      newErrors.space_id = 'Espaço é obrigatório';
    }
    
    if (!formData.reservation_date) {
      newErrors.reservation_date = 'Data é obrigatória';
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Horário de início é obrigatório';
    }
    
    if (!formData.end_time) {
      newErrors.end_time = 'Horário de fim é obrigatório';
    }
    
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = 'Horário de fim deve ser posterior ao horário de início';
    }
    
    if (!formData.contact_name) {
      newErrors.contact_name = 'Nome do responsável é obrigatório';
    }
    
    if (!formData.contact_phone) {
      newErrors.contact_phone = 'Telefone de contato é obrigatório';
    }
    
    // Validar se está dentro do horário permitido
    if (availability && availability.config && formData.start_time && formData.end_time) {
      const configStart = availability.config.start_time;
      const configEnd = availability.config.end_time;
      
      if (formData.start_time < configStart || formData.end_time > configEnd) {
        newErrors.start_time = `Horário deve estar entre ${configStart} e ${configEnd}`;
      }
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
      console.log('🎯 ReservationModal - Dados enviados:', formData);
      let result;
      
      if (mode === 'create') {
        result = await reservationService.create(formData);
      } else if (mode === 'edit') {
        result = await reservationService.update(reservation.id, formData);
      }
      
      console.log('🎯 ReservationModal - Resposta do backend:', result);
      
      if (result.status === 'success') {
        console.log('✅ ReservationModal - Sucesso, chamando onSave com:', result.data);
        onSave(result.data);
      } else {
        console.error('❌ ReservationModal - Erro do backend:', result.message);
        
        // Verificar se é erro de conflito
        if (result.conflicts) {
          setConflicts(result.conflicts);
        }
        
        setErrors({ submit: result.message || 'Erro ao salvar reserva' });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar reserva:', error);
      console.error('❌ Status do erro:', error.response?.status);
      console.error('❌ Dados do erro:', error.response?.data);
      
      // Verificar se é erro de conflito (409) ou erro de validação (422)
      if (error.response?.status === 409) {
        // Erro de conflito de horário
        const responseData = error.response.data;
        console.log('⚠️ Conflito detectado:', responseData.conflicts);
        if (responseData.conflicts) {
          setConflicts(responseData.conflicts);
        }
        setErrors({ submit: responseData.message || 'Já existe uma reserva neste horário' });
      } else if (error.response?.status === 422) {
        // Erro de validação
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ submit: error.response.data.message || 'Dados inválidos' });
        }
      } else if (error.response?.status === 400) {
        // Erro de regra de negócio
        setErrors({ submit: error.response.data.message || 'Erro de validação' });
      } else {
        // Outros erros
        setErrors({ submit: error.response?.data?.message || 'Erro ao salvar reserva' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Nova Reserva';
      case 'edit':
        return 'Editar Reserva';
      case 'view':
        return 'Visualizar Reserva';
      default:
        return 'Reserva';
    }
  };

  const getModalIcon = () => {
    switch (mode) {
      case 'create':
        return <Calendar className="w-6 h-6 text-[#ff6600]" />;
      case 'edit':
        return <Edit className="w-6 h-6 text-[#ff6600]" />;
      case 'view':
        return <Eye className="w-6 h-6 text-[#ff6600]" />;
      default:
        return <Calendar className="w-6 h-6 text-[#ff6600]" />;
    }
  };

  const getSpaceTypeLabel = (type) => {
    const types = {
      storage: 'Depósito',
      gas_depot: 'Depósito de Gás',
      trash_depot: 'Depósito de Lixo',
      gym: 'Academia',
      party_hall: 'Salão de Festas',
      meeting_room: 'Sala de Reuniões',
      laundry: 'Lavanderia',
      storage_room: 'Depósito Geral',
      other: 'Outro'
    };
    return types[type] || type;
  };

  const formatCurrency = (value) => {
    if (!value) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateEstimatedCost = () => {
    if (!availability?.config || !formData.start_time || !formData.end_time) return null;

    const startTime = new Date(`2000-01-01T${formData.start_time}:00`);
    const endTime = new Date(`2000-01-01T${formData.end_time}:00`);
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);

    if (availability.config.hourly_rate) {
      return availability.config.hourly_rate * durationHours;
    } else if (availability.config.daily_rate && durationHours >= 8) {
      return availability.config.daily_rate;
    }

    return 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-[#ff6600]/20">
          <div className="flex items-center space-x-3">
            {getModalIcon()}
            <h2 className="text-xl font-bold text-white">{getModalTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Seleção de Espaço e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Espaço *
              </label>
              <select
                name="space_id"
                value={formData.space_id}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                  errors.space_id ? 'border-red-500' : 'border-gray-600'
                } focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="">Selecione um espaço</option>
                {configuredSpaces.map(config => (
                  <option key={config.space_id} value={config.space_id}>
                    {config.space?.number} - {getSpaceTypeLabel(config.space?.space_type)}
                  </option>
                ))}
              </select>
              {errors.space_id && (
                <p className="text-red-400 text-sm mt-1">{errors.space_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data da Reserva *
              </label>
              <input
                type="date"
                name="reservation_date"
                value={formData.reservation_date}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                min={new Date().toISOString().split('T')[0]} // Não permitir datas passadas
                className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                  errors.reservation_date ? 'border-red-500' : 'border-gray-600'
                } focus:border-[#ff6600] focus:outline-none`}
              />
              {errors.reservation_date && (
                <p className="text-red-400 text-sm mt-1">{errors.reservation_date}</p>
              )}
            </div>
          </div>

          {/* Verificação de Disponibilidade */}
          {checkingAvailability && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-400 text-sm">Verificando disponibilidade...</p>
              </div>
            </div>
          )}

          {availability && !availability.available && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 text-sm">{availability.reason}</p>
              </div>
            </div>
          )}

          {availability && availability.available && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-green-400" />
                <p className="text-green-400 text-sm font-medium">Espaço disponível!</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Horário de funcionamento:</span>
                  <div className="text-white font-medium">
                    {availability.config.start_time} - {availability.config.end_time}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Duração mínima:</span>
                  <div className="text-white font-medium">
                    {availability.config.duration_minutes} minutos
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Taxa:</span>
                  <div className="text-white font-medium">
                    {availability.config.hourly_rate ? 
                      `${formatCurrency(availability.config.hourly_rate)}/hora` :
                      availability.config.daily_rate ?
                      `${formatCurrency(availability.config.daily_rate)}/dia` :
                      'Gratuito'
                    }
                  </div>
                </div>
              </div>

              {/* Reservas existentes */}
              {availability.existing_reservations && availability.existing_reservations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-500/20">
                  <p className="text-green-400 text-sm font-medium mb-2">Reservas existentes nesta data:</p>
                  <div className="space-y-1">
                    {availability.existing_reservations.map((existing, index) => (
                      <div key={index} className="text-xs text-gray-300 bg-[#2a2a2a] rounded px-2 py-1">
                        {existing.start_time} - {existing.end_time} | {existing.contact_name} | {existing.status}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Horários */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Horário de Início *
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                disabled={mode === 'view' || !availability?.available}
                className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                  errors.start_time ? 'border-red-500' : 'border-gray-600'
                } focus:border-[#ff6600] focus:outline-none disabled:opacity-50`}
              />
              {errors.start_time && (
                <p className="text-red-400 text-sm mt-1">{errors.start_time}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Horário de Fim *
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                disabled={mode === 'view' || !availability?.available}
                className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                  errors.end_time ? 'border-red-500' : 'border-gray-600'
                } focus:border-[#ff6600] focus:outline-none disabled:opacity-50`}
              />
              {errors.end_time && (
                <p className="text-red-400 text-sm mt-1">{errors.end_time}</p>
              )}
            </div>
          </div>

          {/* Custo estimado */}
          {calculateEstimatedCost() !== null && (
            <div className="bg-[#2a2a2a] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Custo estimado:</span>
                <span className="text-[#ff6600] font-bold text-lg">
                  {formatCurrency(calculateEstimatedCost())}
                </span>
              </div>
            </div>
          )}

          {/* Informações de Contato */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-[#ff6600]" />
              Informações de Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                    errors.contact_name ? 'border-red-500' : 'border-gray-600'
                  } focus:border-[#ff6600] focus:outline-none`}
                  placeholder="Nome completo do responsável"
                />
                {errors.contact_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.contact_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone de Contato *
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                    errors.contact_phone ? 'border-red-500' : 'border-gray-600'
                  } focus:border-[#ff6600] focus:outline-none`}
                  placeholder="(11) 99999-9999"
                />
                {errors.contact_phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.contact_phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email de Contato
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número de Convidados
                </label>
                <input
                  type="number"
                  name="expected_guests"
                  value={formData.expected_guests}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="1"
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none"
                  placeholder="Ex: 50"
                />
              </div>
            </div>
          </div>

          {/* Detalhes do Evento */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-[#ff6600]" />
              Detalhes do Evento
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Evento
                </label>
                <input
                  type="text"
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none"
                  placeholder="Ex: Festa de Aniversário, Reunião, Casamento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição do Evento
                </label>
                <textarea
                  name="event_description"
                  value={formData.event_description}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none"
                  placeholder="Descreva brevemente o evento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  name="user_notes"
                  value={formData.user_notes}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none"
                  placeholder="Observações especiais, equipamentos necessários, etc..."
                />
              </div>
            </div>
          </div>

          {/* Conflitos */}
          {conflicts.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 font-medium">Conflito de Horário Detectado!</p>
              </div>
              <p className="text-red-400 text-sm mb-3">
                Não é possível fazer a reserva pois há conflito com as seguintes reservas existentes:
              </p>
              <div className="space-y-2">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-red-300 font-medium">
                          📅 {conflict.start_time} - {conflict.end_time}
                        </div>
                        <div className="text-red-300 text-sm">
                          👤 Responsável: {conflict.contact_name}
                        </div>
                        <div className="text-red-300 text-sm">
                          📋 Status: {conflict.status}
                        </div>
                      </div>
                      <div className="text-red-400">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-red-500/20 rounded border border-red-500/40">
                <p className="text-red-300 text-xs">
                  💡 <strong>Dica:</strong> Escolha um horário diferente ou selecione outra data para fazer sua reserva.
                </p>
              </div>
            </div>
          )}

          {/* Erro geral */}
          {/* {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 font-medium">❌ Erro ao Salvar Reserva</p>
              </div>
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )} */}

          {/* Aviso quando há conflitos */}
          {/* {conflicts.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <p className="text-orange-400 text-sm font-medium">
                  ⚠️ Não é possível salvar devido ao conflito de horário acima.
                </p>
              </div>
            </div>
          )} */}

          {/* Botões */}
          {mode !== 'view' && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !availability?.available || conflicts.length > 0}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                title={conflicts.length > 0 ? 'Resolva o conflito de horário para continuar' : ''}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>
                      {conflicts.length > 0 ? 'Conflito Detectado' : 'Salvar Reserva'}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {mode === 'view' && (
            <div className="flex justify-end pt-4">
              <button
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
};

export default ReservationModal;
