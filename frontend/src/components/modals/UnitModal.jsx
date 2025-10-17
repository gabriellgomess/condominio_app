import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { isDarkMode } = useTheme();
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
        return <Home className="w-6 h-6 text-[#ff6600]" />;
      case 'edit':
        return <Edit className="w-6 h-6 text-[#ff6600]" />;
      case 'view':
        return <Eye className="w-6 h-6 text-[#ff6600]" />;
      default:
        return <Home className="w-6 h-6 text-[#ff6600]" />;
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
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto`}>
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
          {/* Condomínio e Bloco */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Condomínio *
              </label>
              {mode === 'view' ? (
                <div className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}">
                  {getSelectedCondominiumName()}
                </div>
              ) : (
                <select
                  name="condominium_id"
                  value={formData.condominium_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none ${
                    errors.condominium_id ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
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
                <p className="text-red-400 text-sm mt-1">{errors.condominium_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Bloco/Torre
              </label>
              {mode === 'view' ? (
                <div className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}">
                  {getSelectedBlockName()}
                </div>
              ) : (
                <select
                  name="block_id"
                  value={formData.block_id}
                  onChange={handleInputChange}
                  disabled={!formData.condominium_id}
                  className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Número da Unidade *
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
                placeholder="Ex: 101, A, Casa 1"
              />
              {errors.number && (
                <p className="text-red-400 text-sm mt-1">{errors.number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Andar *
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                min="0"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.floor ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
                placeholder="Ex: 0 (térreo), 1, 2..."
              />
              {errors.floor && (
                <p className="text-red-400 text-sm mt-1">{errors.floor}</p>
              )}
            </div>
          </div>

          {/* Tipo e Área */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Tipo de Unidade
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
              >
                <option value="apartment">Apartamento</option>
                <option value="house">Casa</option>
                <option value="commercial">Comercial</option>
                <option value="office">Escritório</option>
                <option value="studio">Studio</option>
              </select>
            </div>

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
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.area ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
                placeholder="Ex: 85.50"
              />
              {errors.area && (
                <p className="text-red-400 text-sm mt-1">{errors.area}</p>
              )}
            </div>
          </div>

          {/* Quartos e Banheiros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Quartos
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                min="0"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.bedrooms ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
                placeholder="Ex: 3"
              />
              {errors.bedrooms && (
                <p className="text-red-400 text-sm mt-1">{errors.bedrooms}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Banheiros
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                min="0"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.bathrooms ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
                placeholder="Ex: 2"
              />
              {errors.bathrooms && (
                <p className="text-red-400 text-sm mt-1">{errors.bathrooms}</p>
              )}
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
              placeholder="Descrição opcional da unidade..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none"
            >
              <option value="available">Disponível</option>
              <option value="occupied">Ocupada</option>
              <option value="maintenance">Em Manutenção</option>
              <option value="reserved">Reservada</option>
              <option value="inactive">Inativa</option>
            </select>
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

export default UnitModal;