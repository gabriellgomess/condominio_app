import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, Home } from 'lucide-react';
import structureService from '../../services/structureService';

const UnitModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  unit = null,
  condominiums = [],
  blocks = [],
  onSave 
}) => {
  const [formData, setFormData] = useState({
    number: '',
    floor: '',
    type: 'apartment',
    bedrooms: '',
    bathrooms: '',
    area: '',
    condominium_id: '',
    block_id: '',
    description: '',
    status: 'available'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [filteredBlocks, setFilteredBlocks] = useState([]);

  useEffect(() => {
    if (unit && (mode === 'edit' || mode === 'view')) {
      setFormData({
        number: unit.number || '',
        floor: unit.floor || '',
        type: unit.type || 'apartment',
        bedrooms: unit.bedrooms || '',
        bathrooms: unit.bathrooms || '',
        area: unit.area || '',
        condominium_id: unit.condominium_id || '',
        block_id: unit.block_id || '',
        description: unit.description || '',
        status: unit.status || 'available'
      });
    } else {
      setFormData({
        number: '',
        floor: '',
        type: 'apartment',
        bedrooms: '',
        bathrooms: '',
        area: '',
        condominium_id: unit?.condominium_id || '', // Usar condominium_id se fornecido
        block_id: '',
        description: '',
        status: 'available'
      });
    }
    setErrors({});
  }, [unit, mode, isOpen]);

  // Filtrar blocos baseado no condomínio selecionado
  useEffect(() => {
    if (formData.condominium_id) {
      const filtered = blocks.filter(block => 
        block.condominium_id.toString() === formData.condominium_id.toString()
      );
      setFilteredBlocks(filtered);
      
      // Se o bloco atual não pertence ao condomínio selecionado, limpar
      if (formData.block_id && !filtered.find(b => b.id.toString() === formData.block_id.toString())) {
        setFormData(prev => ({ ...prev, block_id: '' }));
      }
    } else {
      setFilteredBlocks([]);
      setFormData(prev => ({ ...prev, block_id: '' }));
    }
  }, [formData.condominium_id, blocks]);

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
    
    if (!formData.number.trim()) {
      newErrors.number = 'Número é obrigatório';
    }
    
    if (!formData.condominium_id) {
      newErrors.condominium_id = 'Condomínio é obrigatório';
    }
    
    if (!formData.floor || formData.floor < 0) {
      newErrors.floor = 'Andar deve ser maior ou igual a 0';
    }
    
    if (formData.bedrooms && formData.bedrooms < 0) {
      newErrors.bedrooms = 'Quartos deve ser maior ou igual a 0';
    }
    
    if (formData.bathrooms && formData.bathrooms < 0) {
      newErrors.bathrooms = 'Banheiros deve ser maior ou igual a 0';
    }
    
    if (formData.area && formData.area <= 0) {
      newErrors.area = 'Área deve ser maior que 0';
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
        floor: parseInt(formData.floor),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area: formData.area ? parseFloat(formData.area) : null,
        block_id: formData.block_id || null
      };
      
      if (mode === 'create') {
        result = await structureService.unit.create(submitData.condominium_id, submitData);
      } else if (mode === 'edit') {
        result = await structureService.unit.update(unit.id, submitData);
      }
      
      if (onSave) {
        onSave(result);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar unidade:', error);
      // Aqui você pode adicionar uma notificação de erro
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Nova Unidade';
      case 'edit':
        return 'Editar Unidade';
      case 'view':
        return 'Visualizar Unidade';
      default:
        return 'Unidade';
    }
  };

  const getModalIcon = () => {
    switch (mode) {
      case 'create':
        return <Home className="w-6 h-6" />;
      case 'edit':
        return <Edit className="w-6 h-6" />;
      case 'view':
        return <Eye className="w-6 h-6" />;
      default:
        return <Home className="w-6 h-6" />;
    }
  };

  const getSelectedCondominiumName = () => {
    const selectedCondominium = condominiums.find(c => c.id.toString() === formData.condominium_id.toString());
    return selectedCondominium ? selectedCondominium.name : '';
  };

  const getSelectedBlockName = () => {
    const selectedBlock = filteredBlocks.find(b => b.id.toString() === formData.block_id.toString());
    return selectedBlock ? selectedBlock.name : 'Sem bloco';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0f0a] border border-[#31a196]/30 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
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
            {/* Condomínio e Bloco */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Bloco/Torre
                </label>
                {mode === 'view' ? (
                  <div className="w-full px-4 py-3 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white">
                    {getSelectedBlockName()}
                  </div>
                ) : (
                  <select
                    name="block_id"
                    value={formData.block_id}
                    onChange={handleInputChange}
                    disabled={!formData.condominium_id}
                    className="w-full px-4 py-3 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Sem bloco (casa/térrea)</option>
                    {filteredBlocks.map(block => (
                      <option key={block.id} value={block.id}>
                        {block.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Número e Andar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Número da Unidade *
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.number ? 'border-red-500' : 'border-[#31a196]/30'
                  } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="Ex: 101, A, Casa 1"
                />
                {errors.number && (
                  <p className="mt-1 text-sm text-red-400">{errors.number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Andar *
                </label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="0"
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.floor ? 'border-red-500' : 'border-[#31a196]/30'
                  } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="Ex: 0 (térreo), 1, 2..."
                />
                {errors.floor && (
                  <p className="mt-1 text-sm text-red-400">{errors.floor}</p>
                )}
              </div>
            </div>

            {/* Tipo e Área */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Tipo de Unidade
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border border-[#31a196]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    mode === 'view' ? 'cursor-not-allowed opacity-70' : ''
                  }`}
                >
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="commercial">Comercial</option>
                  <option value="office">Escritório</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Área (m²)
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.area ? 'border-red-500' : 'border-[#31a196]/30'
                  } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="Ex: 85.50"
                />
                {errors.area && (
                  <p className="mt-1 text-sm text-red-400">{errors.area}</p>
                )}
              </div>
            </div>

            {/* Quartos e Banheiros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Quartos
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="0"
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.bedrooms ? 'border-red-500' : 'border-[#31a196]/30'
                  } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="Ex: 3"
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-400">{errors.bedrooms}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Banheiros
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  min="0"
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.bathrooms ? 'border-red-500' : 'border-[#31a196]/30'
                  } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="Ex: 2"
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-400">{errors.bathrooms}</p>
                )}
              </div>
            </div>

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
                placeholder="Descrição opcional da unidade..."
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
                <option value="available">Disponível</option>
                <option value="occupied">Ocupada</option>
                <option value="maintenance">Em Manutenção</option>
                <option value="reserved">Reservada</option>
                <option value="inactive">Inativa</option>
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

export default UnitModal;