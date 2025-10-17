import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Save, Eye, Edit, Package } from 'lucide-react';
import structureService from '../../services/structureService';

const SpaceModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  space = null,
  condominiums = [],
  units = [],
  onSave 
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    number: '',
    space_type: 'storage',
    location: '',
    area: '',
    height: '',
    status: 'available',
    condominium_id: '',
    unit_id: '',
    description: '',
    climate_controlled: false,
    reservable: false,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [filteredUnits, setFilteredUnits] = useState([]);

  useEffect(() => {
    if (space && (mode === 'edit' || mode === 'view')) {
      setFormData({
        number: space.number || '',
        space_type: space.space_type || 'storage',
        location: space.location || '',
        area: space.area || '',
        height: space.height || '',
        status: space.status || 'available',
        condominium_id: space.condominium_id || '',
        unit_id: space.unit_id || '',
        description: space.description || '',
        climate_controlled: space.climate_controlled !== undefined ? space.climate_controlled : false,
        reservable: space.reservable !== undefined ? space.reservable : false,
        active: space.active !== undefined ? space.active : true
      });
    } else {
      setFormData({
        number: '',
        space_type: 'storage',
        location: '',
        area: '',
        height: '',
        status: 'available',
        condominium_id: space?.condominium_id?.toString() || '', // Usar condominium_id se fornecido
        unit_id: '',
        description: '',
        climate_controlled: false,
        reservable: false,
        active: true
      });
    }
    setErrors({});
  }, [space, mode, isOpen]);

  // Filtrar unidades baseado no condomínio selecionado
  useEffect(() => {
    if (formData.condominium_id) {
      const filtered = units.filter(unit => 
        unit.condominium_id.toString() === formData.condominium_id.toString()
      );
      setFilteredUnits(filtered);
      
      // Se a unidade atual não pertence ao condomínio selecionado, limpar
      if (formData.unit_id && !filtered.find(u => u.id.toString() === formData.unit_id.toString())) {
        setFormData(prev => ({ ...prev, unit_id: '' }));
      }
    } else {
      setFilteredUnits([]);
      setFormData(prev => ({ ...prev, unit_id: '' }));
    }
  }, [formData.condominium_id, units]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.number.trim()) {
      newErrors.number = 'Número é obrigatório';
    }
    
    if (!formData.condominium_id) {
      newErrors.condominium_id = 'Condomínio é obrigatório';
    }
    
    if (!formData.space_type) {
      newErrors.space_type = 'Tipo é obrigatório';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
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
      console.log('🏢 SpaceModal - Dados enviados:', formData);
      let result;
      
      if (mode === 'create') {
        console.log('🏢 SpaceModal - Criando espaço com condominium_id:', formData.condominium_id);
        result = await structureService.space.create(formData.condominium_id, formData);
      } else if (mode === 'edit') {
        result = await structureService.space.update(space.id, formData);
      }
      
      console.log('🏢 SpaceModal - Resposta do backend:', result);
      console.log('🏢 SpaceModal - Status recebido:', result.status);
      console.log('🏢 SpaceModal - Comparação status === "success":', result.status === 'success');
      
      if (result.status === 'success') {
        console.log('✅ SpaceModal - Sucesso, chamando onSave com:', result.data);
        // Chamar onSave e fechar o modal
        onSave(result.data);
        // Não esperar o onSave para evitar problemas - o modal será fechado pelo onSave
      } else {
        console.error('❌ SpaceModal - Erro do backend:', result.message);
        setErrors({ submit: result.message || 'Erro ao salvar espaço' });
      }
    } catch (error) {
      console.error('Erro ao salvar espaço:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: 'Erro ao salvar espaço' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
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

  const getStatusLabel = (status) => {
    const statuses = {
      available: 'Disponível',
      occupied: 'Ocupado',
      reserved: 'Reservado',
      maintenance: 'Manutenção'
    };
    return statuses[status] || status;
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Novo Espaço';
      case 'edit':
        return 'Editar Espaço';
      case 'view':
        return 'Visualizar Espaço';
      default:
        return 'Espaço';
    }
  };

  const getModalIcon = () => {
    switch (mode) {
      case 'create':
        return <Package className="w-6 h-6 text-[#ff6600]" />;
      case 'edit':
        return <Edit className="w-6 h-6 text-[#ff6600]" />;
      case 'view':
        return <Eye className="w-6 h-6 text-[#ff6600]" />;
      default:
        return <Package className="w-6 h-6 text-[#ff6600]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getModalIcon()}
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getModalTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Número e Condomínio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Número *
              </label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.number ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
                placeholder="Ex: D-01, B-01"
              />
              {errors.number && (
                <p className="text-red-400 text-sm mt-1">{errors.number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Condomínio *
              </label>
              <select
                name="condominium_id"
                value={formData.condominium_id}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.condominium_id ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="">Selecione um condomínio</option>
                {condominiums.map(condominium => (
                  <option key={condominium.id} value={condominium.id}>
                    {condominium.name}
                  </option>
                ))}
              </select>
              {errors.condominium_id && (
                <p className="text-red-400 text-sm mt-1">{errors.condominium_id}</p>
              )}
            </div>
          </div>

          {/* Tipo e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Tipo *
              </label>
              <select
                name="space_type"
                value={formData.space_type}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.space_type ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="storage">Depósito</option>
                <option value="gas_depot">Depósito de Gás</option>
                <option value="trash_depot">Depósito de Lixo</option>
                <option value="gym">Academia</option>
                <option value="party_hall">Salão de Festas</option>
                <option value="meeting_room">Sala de Reuniões</option>
                <option value="laundry">Lavanderia</option>
                <option value="storage_room">Depósito Geral</option>
                <option value="other">Outro</option>
              </select>
              {errors.space_type && (
                <p className="text-red-400 text-sm mt-1">{errors.space_type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.status ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="available">Disponível</option>
                <option value="occupied">Ocupado</option>
                <option value="reserved">Reservado</option>
                <option value="maintenance">Manutenção</option>
              </select>
              {errors.status && (
                <p className="text-red-400 text-sm mt-1">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Localização e Unidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Localização
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
                placeholder="Ex: Subsolo, Térreo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Unidade (Opcional)
              </label>
              <select
                name="unit_id"
                value={formData.unit_id}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
              >
                <option value="">Sem unidade vinculada</option>
                {filteredUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.number} - {unit.block?.name || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Área e Altura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Área (m²)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
                placeholder="Ex: 5.50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Altura (m)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
                placeholder="Ex: 2.50"
              />
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
              placeholder="Descrição do espaço..."
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            {/* <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="climate_controlled"
                checked={formData.climate_controlled}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-4 h-4 text-[#ff6600] ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded focus:ring-[#ff6600] focus:ring-2"
              />
              <label className="text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                Controle climático
              </label>
            </div> */}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="reservable"
                checked={formData.reservable}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-4 h-4 text-[#ff6600] ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded focus:ring-[#ff6600] focus:ring-2"
              />
              <label className="text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                Espaço reservável
              </label>
            </div>

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
                Espaço ativo
              </label>
            </div>
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

export default SpaceModal;