import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Save, Eye, Edit, Building2, Loader2, Star, Phone, Mail, MapPin } from 'lucide-react';
import supplierService from '../../services/supplierService';
import cepService from '../../services/cepService';
import { condominiumService } from '../../services/structureService';

const SupplierModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  supplier = null,
  onSave,
  categories = {}
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    condominium_id: '',
    company_name: '',
    trade_name: '',
    cnpj: '',
    cpf: '',
    supplier_type: 'company',
    category: '',
    contact_name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    number: '',
    cep: '',
    city: '',
    state: '',
    district: '',
    services_description: '',
    hourly_rate: '',
    monthly_rate: '',
    contract_start: '',
    contract_end: '',
    status: 'active',
    evaluation: '',
    notes: '',
    emergency_contact: '',
    active: true
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [errors, setErrors] = useState({});
  const [condominiums, setCondominiums] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadCondominiums();
      if (supplier && (mode === 'edit' || mode === 'view')) {
        setFormData({
          condominium_id: supplier.condominium_id || '',
          company_name: supplier.company_name || '',
          trade_name: supplier.trade_name || '',
          cnpj: supplier.cnpj || '',
          cpf: supplier.cpf || '',
          supplier_type: supplier.supplier_type || 'company',
          category: supplier.category || '',
          contact_name: supplier.contact_name || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          mobile: supplier.mobile || '',
          address: supplier.address || '',
          number: supplier.number || '',
          cep: supplier.cep || '',
          city: supplier.city || '',
          state: supplier.state || '',
          district: supplier.district || '',
          services_description: supplier.services_description || '',
          hourly_rate: supplier.hourly_rate || '',
          monthly_rate: supplier.monthly_rate || '',
          contract_start: supplier.contract_start || '',
          contract_end: supplier.contract_end || '',
          status: supplier.status || 'active',
          evaluation: supplier.evaluation || '',
          notes: supplier.notes || '',
          emergency_contact: supplier.emergency_contact || '',
          active: supplier.active !== undefined ? supplier.active : true
        });
      } else {
        // Reset form for create mode
        setFormData({
          condominium_id: '',
          company_name: '',
          trade_name: '',
          cnpj: '',
          cpf: '',
          supplier_type: 'company',
          category: '',
          contact_name: '',
          email: '',
          phone: '',
          mobile: '',
          address: '',
          number: '',
          cep: '',
          city: '',
          state: '',
          district: '',
          services_description: '',
          hourly_rate: '',
          monthly_rate: '',
          contract_start: '',
          contract_end: '',
          status: 'active',
          evaluation: '',
          notes: '',
          emergency_contact: '',
          active: true
        });
      }
      setErrors({});
    }
  }, [supplier, mode, isOpen]);

  const loadCondominiums = async () => {
    try {
      const response = await condominiumService.getAll();
      if (response && response.status === 'success') {
        setCondominiums(response.data || []);
      } else {
        setCondominiums([]);
      }
    } catch (error) {
      console.error('Erro ao carregar condomínios:', error);
      setCondominiums([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    // Aplicar formatação para campos específicos
    if (name === 'cnpj') {
      newValue = supplierService.formatCNPJ(value);
    } else if (name === 'cpf') {
      newValue = supplierService.formatCPF(value);
    } else if (name === 'phone' || name === 'mobile') {
      newValue = supplierService.formatPhone(value);
    } else if (name === 'state') {
      newValue = value.toUpperCase();
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCEPChange = async (e) => {
    const formatted = supplierService.formatCEP(e.target.value);
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
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const validateForm = () => {
    const validation = supplierService.validateSupplierData(formData);

    if (!validation.isValid) {
      // Mapear erros para os campos
      const fieldErrors = {};
      validation.errors.forEach(error => {
        // Tentar extrair o nome do campo do erro
        const errorLower = error.toLowerCase();
        if (errorLower.includes('condomínio')) {
          fieldErrors.condominium_id = error;
        } else if (errorLower.includes('nome da empresa') || errorLower.includes('nome do contato')) {
          if (errorLower.includes('contato')) {
            fieldErrors.contact_name = error;
          } else {
            fieldErrors.company_name = error;
          }
        } else if (errorLower.includes('email')) {
          fieldErrors.email = error;
        } else if (errorLower.includes('telefone')) {
          fieldErrors.phone = error;
        } else if (errorLower.includes('categoria')) {
          fieldErrors.category = error;
        } else if (errorLower.includes('cnpj')) {
          fieldErrors.cnpj = error;
        } else if (errorLower.includes('cpf')) {
          fieldErrors.cpf = error;
        } else if (errorLower.includes('endereço')) {
          fieldErrors.address = error;
        } else if (errorLower.includes('cep')) {
          fieldErrors.cep = error;
        } else if (errorLower.includes('cidade')) {
          fieldErrors.city = error;
        } else if (errorLower.includes('estado')) {
          fieldErrors.state = error;
        }
      });

      setErrors(fieldErrors);
    }

    return validation.isValid;
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
        result = await supplierService.create(formData);
      } else if (mode === 'edit') {
        result = await supplierService.update(supplier.id, formData);
      }

      if (result && result.status === 'success') {
        if (onSave) {
          onSave(result.data);
        }
        onClose();
      } else {
        setErrors({ submit: result?.message || 'Erro ao salvar fornecedor. Tente novamente.' });
      }
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      setErrors({ submit: 'Erro ao salvar fornecedor. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Novo Fornecedor';
      case 'edit':
        return 'Editar Fornecedor';
      case 'view':
        return 'Visualizar Fornecedor';
      default:
        return 'Fornecedor';
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

  const renderStars = (evaluation) => {
    if (!evaluation || isNaN(evaluation)) return null;
    
    const numEvaluation = parseFloat(evaluation);
    
    return (
      <div className="flex items-center space-x-1 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= numEvaluation 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-400'
            }`}
          />
        ))}
        <span className={`text-sm ${isDarkMode ? 'text-[#f3f7f1]' : 'text-gray-600'} ml-2`}>{numEvaluation.toFixed(1)}</span>
      </div>
    );
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
          {/* Seção 1: Dados da Empresa */}
          <div className={`${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              <Building2 className="w-5 h-5 mr-2 text-[#ff6600]" />
              Dados da Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Condomínio *
                </label>
                <select
                  name="condominium_id"
                  value={formData.condominium_id}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                    errors.condominium_id ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } focus:border-[#ff6600] focus:outline-none`}
                >
                  <option value="">Selecione um condomínio</option>
                  {condominiums.map((condo) => (
                    <option key={condo.id} value={condo.id}>{condo.name}</option>
                  ))}
                </select>
                {errors.condominium_id && (
                  <p className="text-red-400 text-sm mt-1">{errors.condominium_id}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Tipo de Fornecedor *
                </label>
                <select
                  name="supplier_type"
                  value={formData.supplier_type}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                      errors.supplier_type ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } focus:border-[#ff6600] focus:outline-none`}
                >
                  <option value="company">Empresa</option>
                  <option value="mei">MEI</option>
                  <option value="individual">Pessoa Física</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Razão Social / Nome *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                    errors.company_name ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } focus:border-[#ff6600] focus:outline-none`}
                  placeholder="Ex: Empresa de Manutenção Ltda"
                />
                {errors.company_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.company_name}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  name="trade_name"
                  value={formData.trade_name}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                  placeholder="Ex: Manutenção Rápida"
                />
              </div>

              {formData.supplier_type === 'individual' ? (
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    CPF *
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    maxLength={14}
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                      errors.cpf ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    } focus:border-[#ff6600] focus:outline-none`}
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && (
                    <p className="text-red-400 text-sm mt-1">{errors.cpf}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    maxLength={18}
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                      errors.cnpj ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    } focus:border-[#ff6600] focus:outline-none`}
                    placeholder="00.000.000/0000-00"
                  />
                  {errors.cnpj && (
                    <p className="text-red-400 text-sm mt-1">{errors.cnpj}</p>
                  )}
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Categoria *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                    errors.category ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } focus:border-[#ff6600] focus:outline-none`}
                >
                  <option value="">Selecione uma categoria</option>
                  {Object.entries(categories).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-400 text-sm mt-1">{errors.category}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção 2: Contato */}
          <div className={`${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              <Phone className="w-5 h-5 mr-2 text-[#ff6600]" />
              Informações de Contato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Nome do Contato *
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                    errors.contact_name ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } focus:border-[#ff6600] focus:outline-none`}
                  placeholder="Ex: João Silva"
                />
                {errors.contact_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.contact_name}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                    errors.email ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } focus:border-[#ff6600] focus:outline-none`}
                  placeholder="contato@empresa.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Telefone *
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                    errors.phone ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } focus:border-[#ff6600] focus:outline-none`}
                  placeholder="(11) 1234-5678"
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Celular / WhatsApp
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Contato de Emergência
                </label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Endereço */}
          <div className={`${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              <MapPin className="w-5 h-5 mr-2 text-[#ff6600]" />
              Endereço
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                      errors.cep ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    } focus:border-[#ff6600] focus:outline-none`}
                    placeholder="12345-678"
                  />
                  {loadingCep && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-[#ff6600] animate-spin" />
                    </div>
                  )}
                </div>
                {errors.cep && (
                  <p className="text-red-400 text-sm mt-1">{errors.cep}</p>
                )}
                {loadingCep && (
                  <p className="text-[#ff6600]/80 text-sm mt-1">Buscando endereço...</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                    errors.city ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } focus:border-[#ff6600] focus:outline-none`}
                  placeholder="São Paulo"
                />
                {errors.city && (
                  <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Estado *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  maxLength={2}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                    errors.state ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } focus:border-[#ff6600] focus:outline-none`}
                  placeholder="SP"
                />
                {errors.state && (
                  <p className="text-red-400 text-sm mt-1">{errors.state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Endereço *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'} border rounded-lg ${
                    errors.address ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } focus:border-[#ff6600] focus:outline-none`}
                  placeholder="Ex: Rua das Flores"
                />
                {errors.address && (
                  <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Número
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                  placeholder="123"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Bairro
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                  placeholder="Centro"
                />
              </div>
            </div>
          </div>

          {/* Seção 4: Serviços e Valores */}
          <div className={`${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Serviços e Valores</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Descrição dos Serviços
                </label>
                <textarea
                  name="services_description"
                  value={formData.services_description}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  rows={3}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                  placeholder="Descreva os serviços oferecidos..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Valor por Hora (R$)
                  </label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Valor Mensal (R$)
                  </label>
                  <input
                    type="number"
                    name="monthly_rate"
                    value={formData.monthly_rate}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 5: Contrato e Status */}
          <div className={`${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Contrato e Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Início do Contrato
                </label>
                <input
                  type="date"
                  name="contract_start"
                  value={formData.contract_start}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Fim do Contrato
                </label>
                <input
                  type="date"
                  name="contract_end"
                  value={formData.contract_end}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="pending">Pendente</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>
            </div>

            {mode === 'view' && formData.evaluation && (
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Avaliação
                </label>
                {renderStars(formData.evaluation)}
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Observações
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                rows={3}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:border-[#ff6600] focus:outline-none`}
                placeholder="Observações internas sobre o fornecedor..."
              />
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
                className={`px-4 py-2 ${isDarkMode ? 'text-gray-300 border-gray-600 hover:bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-100'} border rounded-lg transition-colors`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-[#ff6600] ${isDarkMode ? 'text-white' : 'text-gray-900'} rounded-lg hover:bg-[#ff6600]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
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
                className={`px-4 py-2 bg-[#ff6600] ${isDarkMode ? 'text-white' : 'text-gray-900'} rounded-lg hover:bg-[#ff6600]/80 transition-colors`}
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

export default SupplierModal;
