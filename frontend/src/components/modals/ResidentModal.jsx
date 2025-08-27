import React, { useState, useEffect } from 'react';
import { residentService, api } from '../../services/api';
import { X, Save, Eye, Edit, User, Phone, Mail, Home, Building, Calendar, Users, FileText } from 'lucide-react';

const ResidentModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  resident = null,
  condominiums = [],
  units = [],
  onSave 
}) => {
  const [formData, setFormData] = useState({
    // Dados da unidade
    condominium_id: '',
    unit_id: '',
    
    // Dados do proprietário (obrigatório)
    owner: {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      status: 'active',
      notes: ''
    },
    
    // Dados do inquilino (opcional)
    tenant: {
      has_tenant: false,
      name: '',
      email: '',
      phone: '',
      cpf: '',
      status: 'active',
      lease_start: '',
      lease_end: '',
      notes: ''
    },
    
    // Status geral da unidade
    unit_status: 'occupied', // occupied, vacant, maintenance
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [filteredUnits, setFilteredUnits] = useState([]);

  useEffect(() => {
    if (resident && (mode === 'edit' || mode === 'view')) {
      // Se for edição/visualização, carregar dados existentes
      setFormData({
        condominium_id: resident.condominium_id?.toString() || '',
        unit_id: resident.unit_id?.toString() || '',
        owner: {
          name: resident.owner?.name || '',
          email: resident.owner?.email || '',
          phone: resident.owner?.phone || '',
          cpf: resident.owner?.cpf || '',
          status: resident.owner?.status || 'active',
          notes: resident.owner?.notes || ''
        },
        tenant: {
          has_tenant: resident.tenant?.has_tenant || false,
          name: resident.tenant?.name || '',
          email: resident.tenant?.email || '',
          phone: resident.tenant?.phone || '',
          cpf: resident.tenant?.cpf || '',
          status: resident.tenant?.status || 'active',
          lease_start: resident.tenant?.lease_start || '',
          lease_end: resident.tenant?.lease_end || '',
          notes: resident.tenant?.notes || ''
        },
        unit_status: resident.unit_status || 'occupied',
        notes: resident.notes || ''
      });
    } else {
      // Se for criação, usar dados padrão
      setFormData({
        condominium_id: '',
        unit_id: '',
        owner: {
          name: '',
          email: '',
          phone: '',
          cpf: '',
          status: 'active',
          notes: ''
        },
        tenant: {
          has_tenant: false,
          name: '',
          email: '',
          phone: '',
          cpf: '',
          status: 'active',
          lease_start: '',
          lease_end: '',
          notes: ''
        },
        unit_status: 'occupied',
        notes: ''
      });
    }
    setErrors({});
  }, [resident, mode, isOpen]);

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
    
    // Verificar se é um campo aninhado (owner ou tenant)
    if (name.startsWith('owner.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        owner: {
          ...prev.owner,
          [fieldName]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('tenant.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        tenant: {
          ...prev.tenant,
          [fieldName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      // Campo direto
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
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
    
    // Validar dados da unidade
    if (!formData.condominium_id) {
      newErrors.condominium_id = 'Condomínio é obrigatório';
    }
    
    if (!formData.unit_id) {
      newErrors.unit_id = 'Unidade é obrigatória';
    }
    
    // Validar dados do proprietário (obrigatório)
    if (!formData.owner.name.trim()) {
      newErrors['owner.name'] = 'Nome do proprietário é obrigatório';
    }
    
    if (!formData.owner.email.trim()) {
      newErrors['owner.email'] = 'Email do proprietário é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.owner.email)) {
      newErrors['owner.email'] = 'Email do proprietário é inválido';
    }
    
    if (!formData.owner.phone.trim()) {
      newErrors['owner.phone'] = 'Telefone do proprietário é obrigatório';
    }
    
    if (!formData.owner.cpf.trim()) {
      newErrors['owner.cpf'] = 'CPF do proprietário é obrigatório';
    }
    
    // Validar dados do inquilino (se houver)
    if (formData.tenant.has_tenant) {
      if (!formData.tenant.name.trim()) {
        newErrors['tenant.name'] = 'Nome do inquilino é obrigatório';
      }
      
      if (!formData.tenant.email.trim()) {
        newErrors['tenant.email'] = 'Email do inquilino é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(formData.tenant.email)) {
        newErrors['tenant.email'] = 'Email do inquilino é inválido';
      }
      
      if (!formData.tenant.phone.trim()) {
        newErrors['tenant.phone'] = 'Telefone do inquilino é obrigatório';
      }
      
      if (!formData.tenant.cpf.trim()) {
        newErrors['tenant.cpf'] = 'CPF do inquilino é obrigatório';
      }
      
      if (!formData.tenant.lease_start) {
        newErrors['tenant.lease_start'] = 'Data de início do aluguel é obrigatória';
      }
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
      console.log('👥 ResidentModal - Dados enviados:', formData);
      
      let response;
      if (mode === 'edit' && resident?.id) {
        // Atualizar morador existente
        response = await residentService.update(resident.id, formData);
      } else {
        // Criar novo morador
        response = await residentService.create(formData);
      }
      
      console.log('🚀 ResidentModal - Resposta da API:', response);
      
      if (response.status === 'success') {
        console.log('✅ ResidentModal - Sucesso, chamando onSave com:', response.data);
        onSave(response.data);
        onClose();
      } else {
        console.error('❌ ResidentModal - Erro da API:', response.message);
        setErrors({ submit: response.message || 'Erro ao salvar morador' });
      }
    } catch (error) {
      console.error('Erro ao salvar morador:', error);
      setErrors({ submit: 'Erro ao salvar morador' });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      owner: 'Proprietário',
      tenant: 'Inquilino',
      resident: 'Morador'
    };
    return types[type] || type;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente'
    };
    return statuses[status] || status;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-[#31a196]" />
            <h2 className="text-xl font-semibold text-white">
              {mode === 'create' && 'Nova Unidade/Morador'}
              {mode === 'edit' && 'Editar Unidade/Morador'}
              {mode === 'view' && 'Visualizar Unidade/Morador'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção: Dados da Unidade */}
          <div className="border-b border-[#31a196]/30 pb-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-[#31a196]" />
              Dados da Unidade
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Unidade */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unidade *
                </label>
                <select
                  name="unit_id"
                  value={formData.unit_id}
                  onChange={handleInputChange}
                  disabled={mode === 'view' || !formData.condominium_id}
                  className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                    errors.unit_id ? 'border-red-500' : 'border-gray-600'
                  } focus:border-[#31a196] focus:outline-none ${
                    !formData.condominium_id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">
                    {formData.condominium_id ? 'Selecione uma unidade' : 'Primeiro selecione um condomínio'}
                  </option>
                  {filteredUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.number} - {unit.block?.name || 'N/A'}
                    </option>
                  ))}
                </select>
                {errors.unit_id && (
                  <p className="text-red-400 text-sm mt-1">{errors.unit_id}</p>
                )}
              </div>

              {/* Status da Unidade */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status da Unidade
                </label>
                <select
                  name="unit_status"
                  value={formData.unit_status}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
                >
                  <option value="occupied">Ocupada</option>
                  <option value="vacant">Vazia</option>
                  <option value="maintenance">Em Manutenção</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção: Dados do Proprietário */}
          <div className="border-b border-[#31a196]/30 pb-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-[#31a196]" />
              Dados do Proprietário *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Proprietário */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="owner.name"
                  value={formData.owner.name}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                    errors['owner.name'] ? 'border-red-500' : 'border-gray-600'
                  } focus:border-[#31a196] focus:outline-none`}
                  placeholder="Nome completo do proprietário"
                />
                {errors['owner.name'] && (
                  <p className="text-red-400 text-sm mt-1">{errors['owner.name']}</p>
                )}
              </div>

              {/* Email do Proprietário */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="owner.email"
                  value={formData.owner.email}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                    errors['owner.email'] ? 'border-red-500' : 'border-gray-600'
                  } focus:border-[#31a196] focus:outline-none`}
                  placeholder="email@exemplo.com"
                />
                {errors['owner.email'] && (
                  <p className="text-red-400 text-sm mt-1">{errors['owner.email']}</p>
                )}
              </div>

              {/* Telefone do Proprietário */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="owner.phone"
                  value={formData.owner.phone}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                    errors['owner.phone'] ? 'border-red-500' : 'border-gray-600'
                  } focus:border-[#31a196] focus:outline-none`}
                  placeholder="(11) 99999-9999"
                />
                {errors['owner.phone'] && (
                  <p className="text-red-400 text-sm mt-1">{errors['owner.phone']}</p>
                )}
              </div>

              {/* CPF do Proprietário */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CPF *
                </label>
                <input
                  type="text"
                  name="owner.cpf"
                  value={formData.owner.cpf}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                    errors['owner.cpf'] ? 'border-red-500' : 'border-gray-600'
                  } focus:border-[#31a196] focus:outline-none`}
                  placeholder="123.456.789-00"
                />
                {errors['owner.cpf'] && (
                  <p className="text-red-400 text-sm mt-1">{errors['owner.cpf']}</p>
                )}
              </div>

              {/* Status do Proprietário */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="owner.status"
                  value={formData.owner.status}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>

              {/* Observações do Proprietário */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  name="owner.notes"
                  value={formData.owner.notes}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
                  placeholder="Observações sobre o proprietário..."
                />
              </div>
            </div>
          </div>

          {/* Seção: Dados do Inquilino */}
          <div className="border-b border-[#31a196]/30 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-[#31a196]" />
                Dados do Inquilino
              </h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="tenant.has_tenant"
                  checked={formData.tenant.has_tenant}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  className="w-4 h-4 text-[#31a196] bg-[#2a2a2a] border-gray-600 rounded focus:ring-[#31a196] focus:ring-2"
                />
                <span className="text-sm text-gray-300">Tem inquilino</span>
              </label>
            </div>
            
            {formData.tenant.has_tenant && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome do Inquilino */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="tenant.name"
                    value={formData.tenant.name}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                      errors['tenant.name'] ? 'border-red-500' : 'border-gray-600'
                    } focus:border-[#31a196] focus:outline-none`}
                    placeholder="Nome completo do inquilino"
                  />
                  {errors['tenant.name'] && (
                    <p className="text-red-400 text-sm mt-1">{errors['tenant.name']}</p>
                  )}
                </div>

                {/* Email do Inquilino */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="tenant.email"
                    value={formData.tenant.email}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                      errors['tenant.email'] ? 'border-red-500' : 'border-gray-600'
                    } focus:border-[#31a196] focus:outline-none`}
                    placeholder="email@exemplo.com"
                  />
                  {errors['tenant.email'] && (
                    <p className="text-red-400 text-sm mt-1">{errors['tenant.email']}</p>
                  )}
                </div>

                {/* Telefone do Inquilino */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    name="tenant.phone"
                    value={formData.tenant.phone}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                      errors['tenant.phone'] ? 'border-red-500' : 'border-gray-600'
                    } focus:border-[#31a196] focus:outline-none`}
                    placeholder="(11) 99999-9999"
                  />
                  {errors['tenant.phone'] && (
                    <p className="text-red-400 text-sm mt-1">{errors['tenant.phone']}</p>
                  )}
                </div>

                {/* CPF do Inquilino */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    name="tenant.cpf"
                    value={formData.tenant.cpf}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                      errors['tenant.cpf'] ? 'border-red-500' : 'border-gray-600'
                    } focus:border-[#31a196] focus:outline-none`}
                    placeholder="123.456.789-00"
                  />
                  {errors['tenant.cpf'] && (
                    <p className="text-red-400 text-sm mt-1">{errors['tenant.cpf']}</p>
                  )}
                </div>

                {/* Data de Início do Aluguel */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Início do Aluguel *
                  </label>
                  <input
                    type="date"
                    name="tenant.lease_start"
                    value={formData.tenant.lease_start}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    className={`w-full px-3 py-2 bg-[#2a2a2a] border rounded-lg text-white ${
                      errors['tenant.lease_start'] ? 'border-red-500' : 'border-gray-600'
                    } focus:border-[#31a196] focus:outline-none`}
                  />
                  {errors['tenant.lease_start'] && (
                    <p className="text-red-400 text-sm mt-1">{errors['tenant.lease_start']}</p>
                  )}
                </div>

                {/* Data de Fim do Aluguel */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fim do Aluguel
                  </label>
                  <input
                    type="date"
                    name="tenant.lease_end"
                    value={formData.tenant.lease_end}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
                  />
                </div>

                {/* Status do Inquilino */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="tenant.status"
                    value={formData.tenant.status}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>

                {/* Observações do Inquilino */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    name="tenant.notes"
                    value={formData.tenant.notes}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    rows={2}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
                  placeholder="Observações sobre o inquilino..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seção: Observações Gerais */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-4 mr-2 text-[#31a196]" />
              Observações Gerais
            </h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              rows={3}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-[#31a196] focus:outline-none"
              placeholder="Observações gerais sobre a unidade..."
            />
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

export default ResidentModal;
