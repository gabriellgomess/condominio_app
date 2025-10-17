import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Camera,
  FileText,
  Calendar,
  Building
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../config/api';

const IncidentModal = ({
  isOpen,
  onClose,
  incident = null,
  onSave,
  condominiums = [],
  blocks = [],
  units = [],
  residents = [],
  onBlocksLoad = null,
  onUnitsLoad = null,
  onResidentsLoad = null
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    condominium_id: '',
    title: '',
    description: '',
    type: '',
    priority: '',
    location: '',
    incident_date: '',
    block_id: '',
    unit_id: '',
    resident_id: '',
    photos: [],
    is_anonymous: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const types = {
    'manutencao': 'Manutenção',
    'seguranca': 'Segurança',
    'ruido': 'Ruído/Barulho',
    'limpeza': 'Limpeza',
    'vizinhanca': 'Vizinhança',
    'outros': 'Outros'
  };

  const priorities = {
    'baixa': 'Baixa',
    'media': 'Média',
    'alta': 'Alta',
    'urgente': 'Urgente'
  };

  const priorityColors = {
    'baixa': 'text-green-600 bg-green-100',
    'media': 'text-yellow-600 bg-yellow-100',
    'alta': 'text-orange-600 bg-orange-100',
    'urgente': 'text-red-600 bg-red-100'
  };

  useEffect(() => {
    if (incident) {
      setFormData({
        condominium_id: incident.condominium_id || '',
        title: incident.title || '',
        description: incident.description || '',
        type: incident.type || '',
        priority: incident.priority || '',
        location: incident.location || '',
        incident_date: incident.incident_date ? new Date(incident.incident_date).toISOString().slice(0, 16) : '',
        block_id: incident.unit?.block_id || '',
        unit_id: incident.unit_id || '',
        resident_id: incident.resident_id || '',
        photos: [],
        is_anonymous: incident.is_anonymous || false
      });

      if (incident.photos) {
        // Se photos for string JSON, fazer parse
        let photosArray = incident.photos;
        if (typeof incident.photos === 'string') {
          try {
            photosArray = JSON.parse(incident.photos);
          } catch (e) {
            console.error('Erro ao fazer parse de photos:', e);
            photosArray = [];
          }
        }

        if (Array.isArray(photosArray) && photosArray.length > 0) {
          setPreviewImages(photosArray.map(photo => `/storage/${photo}`));
        }
      }
    } else {
      // Reset form for new incident
      const defaultCondoId = condominiums.length === 1 ? condominiums[0].id : '';
      setFormData({
        condominium_id: defaultCondoId,
        title: '',
        description: '',
        type: '',
        priority: '',
        location: '',
        incident_date: new Date().toISOString().slice(0, 16),
        block_id: '',
        unit_id: '',
        resident_id: '',
        photos: [],
        is_anonymous: false
      });
      setPreviewImages([]);

      // If there's a default condominium, load its blocks, units and residents
      if (defaultCondoId) {
        loadBlocksUnitsAndResidents(defaultCondoId);
      }
    }
    setErrors({});
  }, [incident, condominiums, isOpen]);

  // Load blocks, units and residents when condominium is selected and modal opens
  useEffect(() => {
    if (isOpen && formData.condominium_id && !incident) {
      loadBlocksUnitsAndResidents(formData.condominium_id);
    }
  }, [isOpen, formData.condominium_id, incident]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If condominium changes, load blocks, units and residents
    if (name === 'condominium_id' && value) {
      loadBlocksUnitsAndResidents(value);
      // Reset block, unit and resident selection
      setFormData(prev => ({
        ...prev,
        condominium_id: value,
        block_id: '',
        unit_id: '',
        resident_id: ''
      }));
      return; // Exit early to avoid setting the value twice
    }

    // If block changes, filter units for that block
    if (name === 'block_id' && value) {
      // Reset unit and resident selection
      setFormData(prev => ({
        ...prev,
        block_id: value,
        unit_id: '',
        resident_id: ''
      }));
      return; // Exit early to avoid setting the value twice
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Function to load blocks, units and residents for a specific condominium
  const loadBlocksUnitsAndResidents = async (condominiumId) => {
    if (!condominiumId) return;

    try {
      const [blocksResponse, unitsResponse, residentsResponse] = await Promise.all([
        api.request(api.endpoints.condominiumBlocks(condominiumId)),
        api.request(api.endpoints.condominiumUnits(condominiumId)),
        api.request(api.endpoints.condominiumResidents(condominiumId))
      ]);

      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json();
        // Update blocks in parent component
        onBlocksLoad && onBlocksLoad(blocksData.data || []);
      }

      if (unitsResponse.ok) {
        const unitsData = await unitsResponse.json();
        // Update units in parent component
        onUnitsLoad && onUnitsLoad(unitsData.data || []);
      }

      if (residentsResponse.ok) {
        const residentsData = await residentsResponse.json();
        // Update residents in parent component
        onResidentsLoad && onResidentsLoad(residentsData.data || []);
      }
    } catch (error) {
      console.error('Error loading blocks, units and residents:', error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      photos: files
    }));

    // Create preview images
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeImage = (index) => {
    const newPhotos = [...formData.photos];
    const newPreviews = [...previewImages];

    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);

    setFormData(prev => ({ ...prev, photos: newPhotos }));
    setPreviewImages(newPreviews);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.condominium_id) newErrors.condominium_id = 'Condomínio é obrigatório';
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.type) newErrors.type = 'Tipo é obrigatório';
    if (!formData.priority) newErrors.priority = 'Prioridade é obrigatória';
    if (!formData.location.trim()) newErrors.location = 'Local é obrigatório';
    if (!formData.incident_date) newErrors.incident_date = 'Data da ocorrência é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'photos') {
          formData.photos.forEach(photo => {
            submitData.append('photos[]', photo);
          });
        } else if (key === 'is_anonymous') {
          // Convert boolean to string for FormData
          submitData.append(key, formData[key] ? '1' : '0');
        } else {
          submitData.append(key, formData[key]);
        }
      });

      await onSave(submitData, incident?.id);
      onClose();
    } catch (error) {
      console.error('Error saving incident:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`
        w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl
        ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
      `}>
        {/* Header */}
        <div className={`
          flex items-center justify-between p-6 border-b
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {incident ? 'Editar Ocorrência' : 'Nova Ocorrência'}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {incident ? 'Atualize as informações da ocorrência' : 'Registre uma nova ocorrência'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
            `}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Condomínio */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <Building className="inline h-4 w-4 mr-1" />
                Condomínio *
              </label>
              <select
                name="condominium_id"
                value={formData.condominium_id}
                onChange={handleInputChange}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                  ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                  ${errors.condominium_id ? 'border-red-500' : ''}
                `}
              >
                <option value="">Selecione um condomínio</option>
                {condominiums.map(condo => (
                  <option key={condo.id} value={condo.id}>{condo.name}</option>
                ))}
              </select>
              {errors.condominium_id && (
                <p className="text-red-500 text-xs mt-1">{errors.condominium_id}</p>
              )}
            </div>

            {/* Título */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <FileText className="inline h-4 w-4 mr-1" />
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Título da ocorrência"
                className={`
                  w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                  ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}
                  ${errors.title ? 'border-red-500' : ''}
                `}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Tipo *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                  ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                  ${errors.type ? 'border-red-500' : ''}
                `}
              >
                <option value="">Selecione um tipo</option>
                {Object.entries(types).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">{errors.type}</p>
              )}
            </div>

            {/* Prioridade */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Prioridade *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                  ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                  ${errors.priority ? 'border-red-500' : ''}
                `}
              >
                <option value="">Selecione uma prioridade</option>
                {Object.entries(priorities).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              {errors.priority && (
                <p className="text-red-500 text-xs mt-1">{errors.priority}</p>
              )}
            </div>

            {/* Local */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <MapPin className="inline h-4 w-4 mr-1" />
                Local *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Local da ocorrência"
                className={`
                  w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                  ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}
                  ${errors.location ? 'border-red-500' : ''}
                `}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            {/* Data da Ocorrência */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <Calendar className="inline h-4 w-4 mr-1" />
                Data da Ocorrência *
              </label>
              <input
                type="datetime-local"
                name="incident_date"
                value={formData.incident_date}
                onChange={handleInputChange}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                  ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                  ${errors.incident_date ? 'border-red-500' : ''}
                `}
              />
              {errors.incident_date && (
                <p className="text-red-500 text-xs mt-1">{errors.incident_date}</p>
              )}
            </div>

            {/* Bloco (opcional) */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <Building className="inline h-4 w-4 mr-1" />
                Bloco/Torre (opcional)
              </label>
              <select
                name="block_id"
                value={formData.block_id}
                onChange={handleInputChange}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                  ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                `}
              >
                <option value="">Selecione um bloco/torre</option>
                {blocks.map(block => (
                  <option key={block.id} value={block.id}>{block.name}</option>
                ))}
              </select>
            </div>

            {/* Unidade (opcional) */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Unidade (opcional)
              </label>
              <select
                name="unit_id"
                value={formData.unit_id}
                onChange={handleInputChange}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500
                  ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}
                `}
              >
                <option value="">Selecione uma unidade</option>
                {units
                  .filter(unit => !formData.block_id || unit.block_id == formData.block_id)
                  .map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.number} {unit.block && `- ${unit.block.name}`}
                    </option>
                  ))}
              </select>
            </div>

          </div>

          {/* Descrição */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Descrição *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Descreva detalhadamente a ocorrência"
              className={`
                w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none
                ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}
                ${errors.description ? 'border-red-500' : ''}
              `}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Fotos */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              <Camera className="inline h-4 w-4 mr-1" />
              Fotos (opcional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className={`
                w-full px-3 py-2 border border-dashed rounded-lg cursor-pointer
                ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}
              `}
            />
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {previewImages.map((src, index) => (
                  <div key={index} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anônimo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_anonymous"
              name="is_anonymous"
              checked={formData.is_anonymous}
              onChange={handleInputChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="is_anonymous" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Registrar como anônimo
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
              `}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : incident ? 'Atualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentModal;