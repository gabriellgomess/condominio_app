import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, Package } from 'lucide-react';
import structureService from '../../services/structureService';

const StorageModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  storage = null,
  condominiums = [],
  units = [],
  onSave 
}) => {
  const [formData, setFormData] = useState({
    number: '',
    type: 'storage',
    location: '',
    area: '',
    height: '',
    status: 'available',
    condominium_id: '',
    unit_id: '',
    description: '',
    climate_controlled: false,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [filteredUnits, setFilteredUnits] = useState([]);

  useEffect(() => {
    if (storage && (mode === 'edit' || mode === 'view')) {
      setFormData({
        number: storage.number || '',
        type: storage.type || 'storage',
        location: storage.location || '',
        area: storage.area || '',
        height: storage.height || '',
        status: storage.status || 'available',
        condominium_id: storage.condominium_id || '',
        unit_id: storage.unit_id || '',
        description: storage.description || '',
        climate_controlled: storage.climate_controlled !== undefined ? storage.climate_controlled : false,
        active: storage.active !== undefined ? storage.active : true
      });
    } else {
      setFormData({
        number: '',
        type: 'storage',
        location: '',
        area: '',
        height: '',
        status: 'available',
        condominium_id: storage?.condominium_id?.toString() || '', // Usar condominium_id se fornecido
        unit_id: '',
        description: '',
        climate_controlled: false,
        active: true
      });
    }
    setErrors({});
  }, [storage, mode, isOpen]);

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
    
    if (!formData.type) {
      newErrors.type = 'Tipo é obrigatório';
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
      console.log('📦 StorageModal - Dados enviados:', formData);
      let result;
      
      if (mode === 'create') {
        console.log('📦 StorageModal - Criando depósito com condominium_id:', formData.condominium_id);
        result = await structureService.storage.create(formData.condominium_id, formData);
      } else if (mode === 'edit') {
        result = await structureService.storage.update(storage.id, formData);
      }
      
      console.log('📦 StorageModal - Resposta do backend:', result);
      console.log('📦 StorageModal - Status recebido:', result.status);
      console.log('📦 StorageModal - Comparação status === "success":', result.status === 'success');
      
      if (result.status === 'success') {
        console.log('✅ StorageModal - Sucesso, chamando onSave com:', result.data);
        // Chamar onSave e fechar o modal
        onSave(result.data);
        // Não esperar o onSave para evitar problemas - o modal será fechado pelo onSave
      } else {
        console.error('❌ StorageModal - Erro do backend:', result.message);
        setErrors({ submit: result.message || 'Erro ao salvar depósito' });
      }
    } catch (error) {
      console.error('Erro ao salvar depósito:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: 'Erro ao salvar depósito' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      storage: 'Depósito',
      box: 'Box',
      cellar: 'Adega',
      attic: 'Sótão'
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-[#31a196]" />
            <h2 className="text-xl font-semibold text-white">
              {mode === 'create' && 'Novo Depósito'}
              {mode === 'edit' && 'Editar Depósito'}
              {mode === 'view' && 'Visualizar Depósito'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número *
              </label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                  errors.number ? 'border-red-500' : 'border-gray-600'
                } focus:border-[#31a196] focus:outline-none`}
                placeholder="Ex: D-01, B-01"
              />
              {errors.number && (
                <p className="text-red-400 text-sm mt-1">{errors.number}</p>
              )}
            </div>

            {/* Condomínio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Condomínio *
              </label>
              <select
                name="condominium_id"
                value={formData.condominium_id}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                  errors.condominium_id ? 'border-red-500' : 'border-gray-600'
                } focus:border-[#31a196] focus:outline-none`}
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

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                  errors.type ? 'border-red-500' : 'border-gray-600'
                } focus:border-[#31a196] focus:outline-none`}
              >
                <option value="storage">Depósito</option>
                <option value="box">Box</option>
                <option value="cellar">Adega</option>
                <option value="attic">Sótão</option>
              </select>
              {errors.type && (
                <p className="text-red-400 text-sm mt-1">{errors.type}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                  errors.status ? 'border-red-500' : 'border-gray-600'
                } focus:border-[#31a196] focus:outline-none`}
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

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Localização
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
                placeholder="Ex: Subsolo, Térreo"
              />
            </div>

            {/* Unidade */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Unidade (Opcional)
              </label>
              <select
                name="unit_id"
                value={formData.unit_id}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
              >
                <option value="">Sem unidade vinculada</option>
                {filteredUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.number} - {unit.block?.name || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            {/* Área */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
                placeholder="Ex: 5.50"
              />
            </div>

            {/* Altura */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
                placeholder="Ex: 2.50"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              rows={3}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
              placeholder="Descrição do depósito..."
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="climate_controlled"
                checked={formData.climate_controlled}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-4 h-4 text-[#31a196] bg-[#2a2a2a] border-gray-600 rounded focus:ring-[#31a196] focus:ring-2"
              />
              <label className="text-sm font-medium text-gray-300">
                Controle climático
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-4 h-4 text-[#31a196] bg-[#2a2a2a] border-gray-600 rounded focus:ring-[#31a196] focus:ring-2"
              />
              <label className="text-sm font-medium text-gray-300">
                Depósito ativo
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
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#31a196] text-white rounded-lg hover:bg-[#31a196]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#31a196] text-white rounded-lg hover:bg-[#31a196]/80 transition-colors"
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

export default StorageModal;
