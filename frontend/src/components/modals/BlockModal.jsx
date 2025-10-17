import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { isDarkMode } = useTheme();
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
        return <Building2 className="w-6 h-6 text-[#ff6600]" />;
      case 'edit':
        return <Edit className="w-6 h-6 text-[#ff6600]" />;
      case 'view':
        return <Eye className="w-6 h-6 text-[#ff6600]" />;
      default:
        return <Building2 className="w-6 h-6 text-[#ff6600]" />;
    }
  };

  const getSelectedCondominiumName = () => {
    const selectedCondominium = condominiums.find(c => c.id.toString() === formData.condominium_id.toString());
    return selectedCondominium ? selectedCondominium.name : '';
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
          {/* Condomínio */}
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

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
              Nome do Bloco/Torre *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                errors.name ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
              } focus:border-[#ff6600] focus:outline-none`}
              placeholder="Ex: Bloco A, Torre 1"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Andares e Unidades por Andar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Número de Andares *
              </label>
              <input
                type="number"
                name="floors"
                value={formData.floors}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                min="1"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.floors ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
                placeholder="Ex: 10"
              />
              {errors.floors && (
                <p className="text-red-400 text-sm mt-1">{errors.floors}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Unidades por Andar *
              </label>
              <input
                type="number"
                name="units_per_floor"
                value={formData.units_per_floor}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                min="1"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                  errors.units_per_floor ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } focus:border-[#ff6600] focus:outline-none`}
                placeholder="Ex: 4"
              />
              {errors.units_per_floor && (
                <p className="text-red-400 text-sm mt-1">{errors.units_per_floor}</p>
              )}
            </div>
          </div>

          {/* Total de Unidades (calculado) */}
          {(formData.floors && formData.units_per_floor) && (
            <div>
              <label className="block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2">
                Total de Unidades (calculado)
              </label>
              <div className="w-full px-3 py-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg text-[#ff6600] font-medium">
                {parseInt(formData.floors) * parseInt(formData.units_per_floor)} unidades
              </div>
            </div>
          )}

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
              placeholder="Descrição opcional do bloco/torre..."
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
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="construction">Em Construção</option>
              <option value="maintenance">Em Manutenção</option>
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

export default BlockModal;