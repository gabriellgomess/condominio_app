import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, Building, Loader2 } from 'lucide-react';
import structureService from '../../services/structureService';
import cepService from '../../services/cepService';

const CondominiumModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  condominium = null,
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    number: '',
    cep: '',
    district: '',
    city: '',
    state: '',
    description: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (condominium && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: condominium.name || '',
        address: condominium.address || '',
        number: condominium.number || '',
        cep: condominium.cep || '',
        district: condominium.district || '',
        city: condominium.city || '',
        state: condominium.state || '',
        description: condominium.description || '',
        status: condominium.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        address: '',
        number: '',
        cep: '',
        district: '',
        city: '',
        state: '',
        description: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [condominium, mode, isOpen]);

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
    
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }
    
    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!/^\d{5}-?\d{3}$/.test(formData.cep)) {
      newErrors.cep = 'CEP deve ter o formato 12345-678';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    } else if (formData.state.length !== 2) {
      newErrors.state = 'Estado deve ter 2 caracteres (ex: SP)';
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
      if (mode === 'create') {
        result = await structureService.condominium.create(formData);
      } else if (mode === 'edit') {
        result = await structureService.condominium.update(condominium.id, formData);
      }
      
      if (onSave) {
        onSave(result);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar condomínio:', error);
      // Aqui você pode adicionar uma notificação de erro
    } finally {
      setLoading(false);
    }
  };

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCEPChange = async (e) => {
    const formatted = formatCEP(e.target.value);
    setFormData(prev => ({
      ...prev,
      cep: formatted
    }));

    // Limpar erro do CEP
    if (errors.cep) {
      setErrors(prev => ({
        ...prev,
        cep: ''
      }));
    }

    // Buscar endereço automaticamente quando CEP estiver completo
    const cleanCep = formatted.replace(/\D/g, '');
    if (cleanCep.length === 8 && mode !== 'view') {
      setLoadingCep(true);
      try {
        const addressData = await cepService.searchByCep(cleanCep);
        if (addressData.status === 'success') {
          setFormData(prev => ({
            ...prev,
            city: addressData.data.city || prev.city,
            state: addressData.data.state || prev.state,
            district: addressData.data.district || prev.district,
            address: addressData.data.street || prev.address
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        // Não exibir erro para o usuário, apenas log
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Novo Condomínio';
      case 'edit':
        return 'Editar Condomínio';
      case 'view':
        return 'Visualizar Condomínio';
      default:
        return 'Condomínio';
    }
  };

  const getModalIcon = () => {
    switch (mode) {
      case 'create':
        return <Building className="w-6 h-6" />;
      case 'edit':
        return <Edit className="w-6 h-6" />;
      case 'view':
        return <Eye className="w-6 h-6" />;
      default:
        return <Building className="w-6 h-6" />;
    }
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

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-[#31a196] mb-2">
                Nome do Condomínio *
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
                placeholder="Ex: Residencial Verde"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* CEP */}
            <div>
              <label className="block text-sm font-medium text-[#31a196] mb-2">
                CEP *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleCEPChange}
                  disabled={mode === 'view' || loadingCep}
                  maxLength={9}
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.cep ? 'border-red-500' : 'border-[#31a196]/30'
                  } ${mode === 'view' || loadingCep ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="12345-678"
                />
                {loadingCep && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-5 h-5 text-[#31a196] animate-spin" />
                  </div>
                )}
              </div>
              {errors.cep && (
                <p className="mt-1 text-sm text-red-400">{errors.cep}</p>
              )}
              {loadingCep && (
                <p className="mt-1 text-sm text-[#31a196]/80">Buscando endereço...</p>
              )}
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-medium text-[#31a196] mb-2">
                Endereço *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                  errors.address ? 'border-red-500' : 'border-[#31a196]/30'
                } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                placeholder="Ex: Rua das Flores, 123"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-400">{errors.address}</p>
              )}
            </div>

            {/* Número */}
            <div>
              <label className="block text-sm font-medium text-[#31a196] mb-2">
                Número
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
                placeholder="Ex: 123, 456-A"
              />
              {errors.number && (
                <p className="mt-1 text-sm text-red-400">{errors.number}</p>
              )}
            </div>

            {/* Bairro, Cidade e Estado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.district ? 'border-red-500' : 'border-[#31a196]/30'
                  } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="Centro"
                />
                {errors.district && (
                  <p className="mt-1 text-sm text-red-400">{errors.district}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.city ? 'border-red-500' : 'border-[#31a196]/30'
                  } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="São Paulo"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-400">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#31a196] mb-2">
                  Estado *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  maxLength={2}
                  className={`w-full px-4 py-3 bg-[#080d08]/80 border rounded-lg text-white placeholder-[#31a196]/60 focus:outline-none focus:ring-2 focus:ring-[#31a196] focus:border-transparent transition-colors ${
                    errors.state ? 'border-red-500' : 'border-[#31a196]/30'
                  } ${mode === 'view' ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="SP"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-400">{errors.state}</p>
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
                placeholder="Descrição opcional do condomínio..."
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

export default CondominiumModal;