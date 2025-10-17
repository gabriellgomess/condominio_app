import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Save, Eye, Edit, Calendar, Clock, Settings } from 'lucide-react';
import { reservationConfigService } from '../../services/reservationService';

const ReservationConfigModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  config = null,
  condominiumId = '',
  reservableSpaces = [],
  onSave 
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    space_id: '',
    available_days: [],
    start_time: '08:00',
    end_time: '22:00',
    duration_minutes: 60,
    min_advance_hours: 24,
    max_advance_days: 30,
    max_reservations_per_day: null,
    max_reservations_per_user_per_month: null,
    hourly_rate: null,
    daily_rate: null,
    description: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const daysOfWeek = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  useEffect(() => {
    console.log('🔧 ReservationConfigModal - useEffect executado');
    console.log('🔧 ReservationConfigModal - reservableSpaces:', reservableSpaces);
    console.log('🔧 ReservationConfigModal - mode:', mode);
    console.log('🔧 ReservationConfigModal - config:', config);
    
    if (config && (mode === 'edit' || mode === 'view')) {
      setFormData({
        space_id: config.space_id || '',
        available_days: config.available_days || [],
        start_time: config.start_time || '08:00',
        end_time: config.end_time || '22:00',
        duration_minutes: config.duration_minutes || 60,
        min_advance_hours: config.min_advance_hours || 24,
        max_advance_days: config.max_advance_days || 30,
        max_reservations_per_day: config.max_reservations_per_day || null,
        max_reservations_per_user_per_month: config.max_reservations_per_user_per_month || null,
        hourly_rate: config.hourly_rate || null,
        daily_rate: config.daily_rate || null,
        description: config.description || '',
        active: config.active !== undefined ? config.active : true
      });
    } else {
      setFormData({
        space_id: '',
        available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        start_time: '08:00',
        end_time: '22:00',
        duration_minutes: 60,
        min_advance_hours: 24,
        max_advance_days: 30,
        max_reservations_per_day: null,
        max_reservations_per_user_per_month: null,
        hourly_rate: null,
        daily_rate: null,
        description: '',
        active: true
      });
    }
    setErrors({});
  }, [config, mode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.space_id) {
      newErrors.space_id = 'Espaço é obrigatório';
    }
    
    if (formData.available_days.length === 0) {
      newErrors.available_days = 'Selecione pelo menos um dia da semana';
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Horário de início é obrigatório';
    }
    
    if (!formData.end_time) {
      newErrors.end_time = 'Horário de fim é obrigatório';
    }
    
    if (formData.start_time >= formData.end_time) {
      newErrors.end_time = 'Horário de fim deve ser posterior ao horário de início';
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
      console.log('📅 ReservationConfigModal - Dados enviados:', formData);
      let result;
      
      if (mode === 'create') {
        console.log('📅 ReservationConfigModal - Criando configuração com condominium_id:', condominiumId);
        result = await reservationConfigService.create(condominiumId, formData);
      } else if (mode === 'edit') {
        result = await reservationConfigService.update(config.id, formData);
      }
      
      console.log('📅 ReservationConfigModal - Resposta do backend:', result);
      
      if (result.status === 'success') {
        console.log('✅ ReservationConfigModal - Sucesso, chamando onSave com:', result.data);
        onSave(result.data);
      } else {
        console.error('❌ ReservationConfigModal - Erro do backend:', result.message);
        setErrors({ submit: result.message || 'Erro ao salvar configuração' });
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: 'Erro ao salvar configuração' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Nova Configuração de Reserva';
      case 'edit':
        return 'Editar Configuração';
      case 'view':
        return 'Visualizar Configuração';
      default:
        return 'Configuração';
    }
  };

  const getModalIcon = () => {
    switch (mode) {
      case 'create':
        return <Settings className="w-6 h-6 text-[#ff6600]" />;
      case 'edit':
        return <Edit className="w-6 h-6 text-[#ff6600]" />;
      case 'view':
        return <Eye className="w-6 h-6 text-[#ff6600]" />;
      default:
        return <Settings className="w-6 h-6 text-[#ff6600]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-[#ff6600]/20">
          <div className="flex items-center space-x-3">
            {getModalIcon()}
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getModalTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} rounded-lg transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Espaço */}
          <div>
            <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
              Espaço *
            </label>
            <select
              name="space_id"
              value={formData.space_id}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                errors.space_id ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
              } focus:border-[#ff6600] focus:outline-none`}
            >
              <option value="">Selecione um espaço</option>
              {console.log('🔧 Modal - Renderizando options com reservableSpaces:', reservableSpaces)}
              {reservableSpaces && reservableSpaces.length > 0 ? (
                reservableSpaces.map(space => (
                  <option key={space.id} value={space.id}>
                    {space.number} - {space.space_type === 'party_hall' ? 'Salão de Festas' : 
                     space.space_type === 'gym' ? 'Academia' : 
                     space.space_type === 'meeting_room' ? 'Sala de Reuniões' : 
                     space.space_type === 'storage' ? 'Depósito' : space.space_type}
                  </option>
                ))
              ) : (
                <option value="" disabled>Nenhum espaço disponível</option>
              )}
            </select>
            {errors.space_id && (
              <p className="text-red-400 text-sm mt-1">{errors.space_id}</p>
            )}
          </div>

          {/* Dias da Semana */}
          <div>
            <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3">
              Dias Disponíveis *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {daysOfWeek.map(day => (
                <label key={day.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available_days.includes(day.key)}
                    onChange={() => handleDayToggle(day.key)}
                    disabled={mode === 'view'}
                    className="w-4 h-4 text-[#ff6600] ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded focus:ring-[#ff6600] focus:ring-2"
                  />
                  <span className="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">{day.label}</span>
                </label>
              ))}
            </div>
            {errors.available_days && (
              <p className="text-red-400 text-sm mt-1">{errors.available_days}</p>
            )}
          </div>

          {/* Horários */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Horário de Início *
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.start_time ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              />
              {errors.start_time && (
                <p className="text-red-400 text-sm mt-1">{errors.start_time}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Horário de Fim *
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.end_time ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              />
              {errors.end_time && (
                <p className="text-red-400 text-sm mt-1">{errors.end_time}</p>
              )}
            </div>
          </div>

          {/* Configurações Avançadas */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-[#ff6600]" />
              Configurações Avançadas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                  Duração Mínima (minutos)
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="15"
                  max="1440"
                  className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                  Antecedência Mínima (horas)
                </label>
                <input
                  type="number"
                  name="min_advance_hours"
                  value={formData.min_advance_hours}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="1"
                  max="168"
                  className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                  Antecedência Máxima (dias)
                </label>
                <input
                  type="number"
                  name="max_advance_days"
                  value={formData.max_advance_days}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                  Máx. Reservas por Dia
                </label>
                <input
                  type="number"
                  name="max_reservations_per_day"
                  value={formData.max_reservations_per_day || ''}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="1"
                  className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
                  placeholder="Sem limite"
                />
              </div>
            </div>
          </div>

          {/* Taxas (Opcional) */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-[#ff6600]" />
              Taxas (Opcional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                  Taxa por Hora (R$)
                </label>
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate || ''}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                  Taxa por Dia (R$)
                </label>
                <input
                  type="number"
                  name="daily_rate"
                  value={formData.daily_rate || ''}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              rows={3}
              className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
              placeholder="Regras especiais ou observações sobre a reserva..."
            />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              className="w-4 h-4 text-[#ff6600] ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded focus:ring-[#ff6600] focus:ring-2"
            />
            <label className="text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
              Configuração ativa
            </label>
          </div>

          {/* Erro geral */}
          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Botões */}
          {mode !== 'view' && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#ff6600] ${isDarkMode ? 'text-white' : 'text-gray-900'} rounded-lg hover:bg-[#ff6600]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </>
                )}
              </button>
            </div>
          )}

          {mode === 'view' && (
            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#ff6600] ${isDarkMode ? 'text-white' : 'text-gray-900'} rounded-lg hover:bg-[#ff6600]/80 transition-colors"
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

export default ReservationConfigModal;
