import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, Building2 } from 'lucide-react';
import structureService from '../../services/structureService';

const BlockModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  block = null,
  condominiums = [],
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    condominium_id: '',
    floors: '',
    units_per_floor: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (block && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: block.name || '',
        description: block.description || '',
        condominium_id: block.condominium_id || '',
        floors: block.floors || '',
        units_per_floor: block.units_per_floor || '',
        status: block.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        condominium_id: block?.condominium_id || '', // Usar condominium_id se fornecido
        floors: '',
        units_per_floor: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [block, mode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.condominium_id) {
      newErrors.condominium_id = 'Condomínio é obrigatório';
    }
    
    if (!formData.floors || formData.floors < 1) {
      newErrors.floors = 'Número de andares deve ser maior que 0';
    }
    
    if (!formData.units_per_floor || formData.units_per_floor < 1) {
      newErrors.units_per_floor = 'Unidades por andar deve ser maior que 0';
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
      let result;
      const submitData = {
        ...formData,
        floors: parseInt(formData.floors),
        units_per_floor: parseInt(formData.units_per_floor)
      };
      
      if (mode === 'create') {
        result = await structureService.block.create(submitData.condominium_id, submitData);
      } else if (mode === 'edit') {
        result = await structureService.block.update(block.id, submitData);
      }
      
      if (onSave) {
        onSave(result);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar bloco:', error);
      // Aqui você pode adicionar uma notificação de erro
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Novo Bloco/Torre';
      case 'edit':
        return 'Editar Bloco/Torre';
      case 'view':
        return 'Visualizar Bloco/Torre';
      default:
        return 'Bloco/Torre';
    }
  };

  const getModalIcon = () => {
    switch (mode) {
      case 'create':
        return <Building2 className="w-6 h-6" />;
      case 'edit':
        return <Edit className="w-6 h-6" />;
      case 'view':
        return <Eye className="w-6 h-6" />;
      default:
        return <Building2 className="w-6 h-6" />;
    }
  };

  const getSelectedCondominiumName = () => {
    const selectedCondominium = condominiums.find(c => c.id.toString() === formData.condominium_id.toString());
    return selectedCondominium ? selectedCondominium.name : '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0f0a] border border-[#31a196]/30 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#31a196]/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#31a196]/20 rounded-lg text-[#31a196]">
              {getModalIcon()}
            </div>
            <h3 className="text-xl font-bold text-white">{getModalTitle()}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#31a196]/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Condomínio */}
            <div>
              <label className="block text-sm font-medium text-[#31a196] mb-2">
                Condomínio *
              </label>
              {mode === 'view' ? (
                <div className="w-full px-4 py-3 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white">
                  {getSelectedCondominiumName()}
                </div>
              ) : (
                <select
                  name="condominium_id"
                  value={formData.condominium_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.condominium_id ? 'border-red-500' : 'border-[#31a196]/30'
                  }`}
                >
                  <option value="">Selecione um condomínio</option>
                  {condominiums.map(condominium => (
                    <option key={condominium.id} value={condominium.id}>
                      {condominium.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.condominium_id && (
                <p className="mt-1 text-sm text-red-400">{errors.condominium_id}</p>
              )}
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-[#31a196] mb-2">
                Nome do Bloco/Torre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                  errors.name ? 'border-red-500' : 'border-[#31a196]/30'
                } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                placeholder="Ex: Bloco A, Torre 1"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Andares e Unidades por Andar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Número de Andares *
                </label>
                <input
                  type="number"
                  name="floors"
                  value={formData.floors}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="1"
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.floors ? 'border-red-500' : 'border-[#31a196]/30'
                  } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="Ex: 10"
                />
                {errors.floors && (
                  <p className="mt-1 text-sm text-red-400">{errors.floors}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Unidades por Andar *
                </label>
                <input
                  type="number"
                  name="units_per_floor"
                  value={formData.units_per_floor}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="1"
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.units_per_floor ? 'border-red-500' : 'border-[#31a196]/30'
                  } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="Ex: 4"
                />
                {errors.units_per_floor && (
                  <p className="mt-1 text-sm text-red-400">{errors.units_per_floor}</p>
                )}
              </div>
            </div>

            {/* Total de Unidades (calculado) */}
            {(formData.floors && formData.units_per_floor) && (
              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Total de Unidades (calculado)
                </label>
                <div className="w-full px-4 py-3 bg-[#080d08]/50 border border-[#31a196]/20 rounded-lg text-[#31a196] font-medium">
                  {parseInt(formData.floors) * parseInt(formData.units_per_floor)} unidades
                </div>
              </div>
            )}

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-[#31a196] mb-2">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                rows={3}
                className={`w-full px-4 py-3 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors resize-none ${
                  mode === 'view' ? 'cursor-not-allowed opacity-70' : ''
                }`}
                placeholder="Descrição opcional do bloco/torre..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#31a196] mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-4 py-3 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                  mode === 'view' ? 'cursor-not-allowed opacity-70' : ''
                }`}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="construction">Em Construção</option>
                <option value="maintenance">Em Manutenção</option>
              </select>
            </div>
          </form>
        </div>

        {/* Footer */}
        {mode !== 'view' && (
          <div className="flex justify-end space-x-3 p-6 border-t border-[#31a196]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-[#31a196] text-white rounded-lg hover:bg-[#31a196]/80 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{mode === 'create' ? 'Criar' : 'Salvar'}</span>
            </button>
          </div>
        )}

        {mode === 'view' && (
          <div className="flex justify-end p-6 border-t border-[#31a196]/20">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockModal;