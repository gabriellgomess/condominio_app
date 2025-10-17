import React, { useState, useEffect } from 'react';
import { X, Save, Send, FileText, Calendar, Target, AlertTriangle } from 'lucide-react';
import announcementService from '../../services/announcementService';
import { useTheme } from '../../contexts/ThemeContext';

const AnnouncementModal = ({
  isOpen,
  onClose,
  mode = 'create', // 'create', 'edit', 'view'
  announcement = null,
  condominiums = [],
  onSave
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    condominium_id: '',
    title: '',
    content: '',
    priority: 'normal',
    target_type: 'all',
    target_ids: [],
    expires_at: '',
    send_email: false,
    send_notification: true,
    attachments: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (announcement && (mode === 'edit' || mode === 'view')) {
      setFormData({
        condominium_id: announcement.condominium_id || '',
        title: announcement.title || '',
        content: announcement.content || '',
        priority: announcement.priority || 'normal',
        target_type: announcement.target_type || 'all',
        target_ids: announcement.target_ids || [],
        expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : '',
        send_email: announcement.send_email || false,
        send_notification: announcement.send_notification !== undefined ? announcement.send_notification : true,
        attachments: announcement.attachments || [],
        notes: announcement.notes || ''
      });
    } else {
      resetForm();
    }
  }, [announcement, mode, isOpen]);

  const resetForm = () => {
    setFormData({
      condominium_id: condominiums.length > 0 ? condominiums[0].id : '',
      title: '',
      content: '',
      priority: 'normal',
      target_type: 'all',
      target_ids: [],
      expires_at: '',
      send_email: false,
      send_notification: true,
      attachments: [],
      notes: ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.condominium_id) {
      newErrors.condominium_id = 'Condomínio é obrigatório';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    }
    if (formData.expires_at && new Date(formData.expires_at) <= new Date()) {
      newErrors.expires_at = 'Data de expiração deve ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, shouldPublish = false) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        expires_at: formData.expires_at || null
      };

      let response;
      if (mode === 'edit') {
        response = await announcementService.updateAnnouncement(announcement.id, submitData);
      } else {
        response = await announcementService.createAnnouncement(submitData);
      }

      if (response.success) {
        // If should publish and it's a new announcement or was saved as draft
        if (shouldPublish && (mode === 'create' || announcement?.status === 'draft')) {
          await announcementService.publishAnnouncement(response.data.id);
        }

        onSave && onSave();
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar comunicado:', error);

      if (error.error?.details) {
        setErrors(error.error.details);
      } else {
        alert('Erro ao salvar comunicado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-blue-400',
      normal: 'text-gray-400',
      high: 'text-yellow-400',
      urgent: 'text-red-400'
    };
    return colors[priority] || colors.normal;
  };

  const getTargetTypeLabel = (type) => {
    const labels = {
      all: 'Todos os moradores',
      block: 'Bloco específico',
      unit: 'Unidade específica',
      specific: 'Seleção específica'
    };
    return labels[type] || labels.all;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-[#ff6600]/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#ff6600]/20 rounded-lg">
              <FileText className="w-8 h-8 text-[#ff6600]" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {mode === 'create' ? 'Criar Comunicado' :
                 mode === 'edit' ? 'Editar Comunicado' : 'Visualizar Comunicado'}
              </h2>
              {announcement && mode !== 'create' && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Criado em {new Date(announcement.created_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} hover:bg-[#ff6600]/20 rounded-lg transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-3`}>
                    Condomínio *
                  </label>
                  <select
                    name="condominium_id"
                    value={formData.condominium_id}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                      mode === 'view' ? 'opacity-60' : ''
                    } ${errors.condominium_id ? 'border-red-400' : ''}`}
                  >
                    <option value="" className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>Selecione um condomínio</option>
                    {condominiums.map(condo => (
                      <option key={condo.id} value={condo.id} className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>
                        {condo.name}
                      </option>
                    ))}
                  </select>
                  {errors.condominium_id && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.condominium_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-3`}>
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                      mode === 'view' ? 'opacity-60' : ''
                    } ${errors.title ? 'border-red-400' : ''}`}
                    placeholder="Digite o título do comunicado"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-3`}>
                    Conteúdo *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    rows={8}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors resize-none ${
                      mode === 'view' ? 'opacity-60' : ''
                    } ${errors.content ? 'border-red-400' : ''}`}
                    placeholder="Digite o conteúdo do comunicado"
                  />
                  {errors.content && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.content}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-3`}>
                    Notas Internas
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    rows={3}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors resize-none ${
                      mode === 'view' ? 'opacity-60' : ''
                    }`}
                    placeholder="Notas para uso interno (não visíveis aos moradores)"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar Config */}
            <div className="space-y-8">
              {/* Priority */}
              <div className={`${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-4 flex items-center gap-3`}>
                  <AlertTriangle className="w-5 h-5 text-[#ff6600]" />
                  Prioridade
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                    mode === 'view' ? 'opacity-60' : ''
                  }`}
                >
                  <option value="low" className={`${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>Baixa</option>
                  <option value="normal" className={`${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>Normal</option>
                  <option value="high" className={`${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>Alta</option>
                  <option value="urgent" className={`${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>Urgente</option>
                </select>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-3`}>
                  Prioridade: {formData.priority === 'low' ? 'Baixa' :
                              formData.priority === 'normal' ? 'Normal' :
                              formData.priority === 'high' ? 'Alta' : 'Urgente'}
                </div>
              </div>

              {/* Target */}
              <div className={`${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-4 flex items-center gap-3`}>
                  <Target className="w-5 h-5 text-[#ff6600]" />
                  Destinatários
                </label>
                <select
                  name="target_type"
                  value={formData.target_type}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                    mode === 'view' ? 'opacity-60' : ''
                  }`}
                >
                  <option value="all" className={`${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>Todos os moradores</option>
                  <option value="block" className={`${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>Bloco específico</option>
                  <option value="unit" className={`${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>Unidade específica</option>
                  <option value="specific" className={`${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'}`}>Seleção específica</option>
                </select>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-3`}>
                  {getTargetTypeLabel(formData.target_type)}
                </div>
              </div>

              {/* Expiration */}
              <div className={`${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-4 flex items-center gap-3`}>
                  <Calendar className="w-5 h-5 text-[#ff6600]" />
                  Data de Expiração
                </label>
                <input
                  type="date"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:ring-2 focus:ring-[#ff6600]/50 focus:border-[#ff6600] transition-colors ${
                    mode === 'view' ? 'opacity-60' : ''
                  } ${errors.expires_at ? 'border-red-400' : ''}`}
                />
                {errors.expires_at && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.expires_at}
                  </p>
                )}
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-3`}>
                  Deixe vazio para não expirar
                </div>
              </div>

              {/* Notifications */}
              <div className={`${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-4 flex items-center gap-3`}>
                  <Send className="w-5 h-5 text-[#ff6600]" />
                  Notificações
                </h4>
                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="send_notification"
                      checked={formData.send_notification}
                      onChange={handleInputChange}
                      disabled={mode === 'view'}
                      className={`h-5 w-5 text-[#ff6600] rounded focus:ring-[#ff6600]/50 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'}`}
                    />
                    <span className={`ml-3 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Enviar notificação push
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="send_email"
                      checked={formData.send_email}
                      onChange={handleInputChange}
                      disabled={mode === 'view'}
                      className={`h-5 w-5 text-[#ff6600] rounded focus:ring-[#ff6600]/50 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} ${isDarkMode ? 'border-[#ff6600]/20' : 'border-gray-300'}`}
                    />
                    <span className={`ml-3 text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Enviar por e-mail
                    </span>
                  </label>
                </div>
              </div>

              {/* Status Info */}
              {announcement && mode !== 'create' && (
                <div className={`${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-4 flex items-center gap-3`}>
                    <FileText className="w-5 h-5 text-[#ff6600]" />
                    Informações
                  </h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {announcement.status === 'draft' ? 'Rascunho' :
                         announcement.status === 'published' ? 'Publicado' : 'Arquivado'}
                      </span>
                    </div>
                    {announcement.published_at && (
                      <div className="flex items-center justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Publicado em:</span>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(announcement.published_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Autor:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {announcement.user?.name || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {mode !== 'view' && (
            <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-[#ff6600]/20">
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-3 ${isDarkMode ? 'bg-[#0a0a0a] text-gray-400 hover:bg-gray-600/20 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg transition-colors flex items-center gap-3`}
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  'Salvar Rascunho'
                )}
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="px-6 py-3 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Publicando...
                  </>
                ) : (
                  'Salvar e Publicar'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;