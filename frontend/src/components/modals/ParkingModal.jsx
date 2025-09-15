import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, Car } from 'lucide-react';
import structureService from '../../services/structureService';

const ParkingModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  parking = null,
  condominiums = [],
  units = [],
  onSave 
}) => {
  const [formData, setFormData] = useState({
    number: '',
    type: 'covered',
    size: 'standard',
    status: 'available',
    condominium_id: '',
    unit_id: '',
    description: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [filteredUnits, setFilteredUnits] = useState([]);

  useEffect(() => {
    if (parking && (mode === 'edit' || mode === 'view')) {
      setFormData({
        number: parking.number || '',
        type: parking.type || 'covered',
        size: parking.size || 'standard',
        status: parking.status || 'available',
        condominium_id: parking.condominium_id || '',
        unit_id: parking.unit_id || '',
        description: parking.description || '',
        active: parking.active !== undefined ? parking.active : true
      });
    } else {
      setFormData({
        number: '',
        type: 'covered',
        size: 'standard',
        status: 'available',
        condominium_id: parking?.condominium_id?.toString() || '', // Usar condominium_id se fornecido
        unit_id: '',
        description: '',
        active: true
      });
    }
    setErrors({});
  }, [parking, mode, isOpen]);

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
    
    // Size é opcional, não validar como obrigatório
    
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
      console.log('🚗 ParkingModal - Dados enviados:', formData);
      let result;
      
      if (mode === 'create') {
        console.log('🚗 ParkingModal - Criando vaga com condominium_id:', formData.condominium_id);
        result = await structureService.parking.create(formData.condominium_id, formData);
      } else if (mode === 'edit') {
        result = await structureService.parking.update(parking.id, formData);
      }
      
      console.log('🚗 ParkingModal - Resposta do backend:', result);
      console.log('🚗 ParkingModal - Status recebido:', result.status);
      console.log('🚗 ParkingModal - Tipo do status:', typeof result.status);
      console.log('🚗 ParkingModal - Comparação status === "success":', result.status === 'success');
      
      if (result.status === 'success') {
        console.log('✅ ParkingModal - Sucesso, chamando onSave com:', result.data);
        // Chamar onSave e fechar o modal
        onSave(result.data);
        // Não esperar o onSave para evitar problemas - o modal será fechado pelo onSave
      } else {
        console.error('❌ ParkingModal - Erro do backend:', result.message);
        setErrors({ submit: result.message || 'Erro ao salvar vaga de garagem' });
      }
    } catch (error) {
      console.error('Erro ao salvar vaga de garagem:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: 'Erro ao salvar vaga de garagem' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      covered: 'Coberta',
      uncovered: 'Descoberta',
      garage: 'Garagem',
      motorcycle: 'Moto'
    };
    return types[type] || type;
  };

  const getSizeLabel = (size) => {
    const sizes = {
      compact: 'Compacta',
      standard: 'Padrão',
      large: 'Grande',
      motorcycle: 'Moto'
    };
    return sizes[size] || size;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      available: 'Disponível',
      occupied: 'Ocupada',
      reserved: 'Reservada',
      maintenance: 'Manutenção'
    };
    return statuses[status] || status;
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Nova Vaga de Garagem';
      case 'edit':
        return 'Editar Vaga de Garagem';
      case 'view':
        return 'Visualizar Vaga de Garagem';
      default:
        return 'Vaga de Garagem';
    }
  };

  const getModalIcon = () => {
    switch (mode) {
      case 'create':
        return <Car className="w-6 h-6 text-[#ff6600]" />;
      case 'edit':
        return <Edit className="w-6 h-6 text-[#ff6600]" />;
      case 'view':
        return <Eye className="w-6 h-6 text-[#ff6600]" />;
      default:
        return <Car className="w-6 h-6 text-[#ff6600]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getModalIcon()}
            <h2 className="text-xl font-semibold text-white">{getModalTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Número e Condomínio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                } focus:border-[#ff6600] focus:outline-none`}
                placeholder="Ex: G-01, P-01"
              />
              {errors.number && (
                <p className="text-red-400 text-sm mt-1">{errors.number}</p>
              )}
            </div>

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

          {/* Tipo e Tamanho */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                } focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="covered">Coberta</option>
                <option value="uncovered">Descoberta</option>
                <option value="garage">Garagem</option>
                <option value="motorcycle">Moto</option>
              </select>
              {errors.type && (
                <p className="text-red-400 text-sm mt-1">{errors.type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tamanho
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                  errors.size ? 'border-red-500' : 'border-gray-600'
                } focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="compact">Compacta</option>
                <option value="standard">Padrão</option>
                <option value="large">Grande</option>
                <option value="motorcycle">Moto</option>
              </select>
              {errors.size && (
                <p className="text-red-400 text-sm mt-1">{errors.size}</p>
              )}
            </div>
          </div>

          {/* Status e Unidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                } focus:border-[#ff6600] focus:outline-none`}
              >
                <option value="available">Disponível</option>
                <option value="occupied">Ocupada</option>
                <option value="reserved">Reservada</option>
                <option value="maintenance">Manutenção</option>
              </select>
              {errors.status && (
                <p className="text-red-400 text-sm mt-1">{errors.status}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Unidade (Opcional)
              </label>
              <select
                name="unit_id"
                value={formData.unit_id}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none"
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
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#ff6600] focus:outline-none"
              placeholder="Descrição da vaga de garagem..."
            />
          </div>

          {/* Ativo */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              className="w-4 h-4 text-[#ff6600] bg-[#2a2a2a] border-gray-600 rounded focus:ring-[#ff6600] focus:ring-2"
            />
            <label className="text-sm font-medium text-gray-300">
              Vaga ativa
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
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

export default ParkingModal;