import { api } from './api.js';

// Serviços para Fornecedores
export const supplierService = {
  // Listar fornecedores com filtros e paginação
  getAll: async (params = {}) => {
    try {
      return await api.get('/suppliers', params);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return {
        status: 'error',
        message: 'Erro ao buscar fornecedores',
        data: []
      };
    }
  },

  // Listar fornecedores de um condomínio
  getByCondominium: (condominiumId, params = {}) => {
    return api.get(`/condominiums/${condominiumId}/suppliers`, params);
  },

  // Obter fornecedor por ID
  getById: (id) => {
    return api.get(`/suppliers/${id}`);
  },

  // Criar novo fornecedor
  create: (data) => {
    return api.post('/suppliers', data);
  },

  // Atualizar fornecedor
  update: (id, data) => {
    return api.put(`/suppliers/${id}`, data);
  },

  // Excluir fornecedor
  delete: (id) => {
    return api.delete(`/suppliers/${id}`);
  },

  // Obter fornecedores por categoria
  getByCategory: (category, params = {}) => {
    return api.get(`/suppliers/category/${category}`, params);
  },

  // Avaliar fornecedor
  evaluate: (id, evaluation) => {
    return api.post(`/suppliers/${id}/evaluate`, evaluation);
  },

  downloadContract: async (id) => {
    try {
      // Criar um link temporário com href absoluto
      const link = document.createElement('a');
      link.href = `http://localhost:8000/api/suppliers/${id}/contract`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Adicionar ao DOM temporariamente e clicar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return {
        status: 'success',
        message: 'Contrato aberto em nova aba'
      };
    } catch (error) {
      console.error('Erro ao abrir contrato:', error);
      return {
        status: 'error',
        message: 'Erro ao abrir contrato'
      };
    }
  },

  // Obter estatísticas dos fornecedores
  getStats: async (params = {}) => {
    try {
      return await api.get('/suppliers-stats', params);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        status: 'error',
        message: 'Erro ao buscar estatísticas',
        data: {
          total: 0,
          active: 0,
          inactive: 0,
          blocked: 0,
          by_category: {},
          contracts_expiring: 0,
          average_evaluation: 0
        }
      };
    }
  },

  // Obter categorias disponíveis
  getCategories: async () => {
    try {
      return await api.get('/supplier-categories');
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return {
        status: 'error',
        message: 'Erro ao buscar categorias',
        data: {
          'gas_supply': 'Fornecimento de gás',
          'gate_maintenance': 'Manutenção de portões',
          'intercom_maintenance': 'Manutenção de interfones',
          'cleaning': 'Zeladoria e limpeza',
          'reception': 'Portaria',
          'access_control': 'Controle de acesso',
          'gardening': 'Jardinagem',
          'elevator_maintenance': 'Manutenção de elevadores',
          'gym_maintenance': 'Manutenção da academia',
          'guarantee_company': 'Empresa garantidora (taxas de administração)',
          'condominium_admin': 'Administradora de condomínio',
          'third_party_manager': 'Síndico terceirizado',
          'pest_control': 'Dedetização / desinsetização / desratização',
          'water_tank_cleaning': 'Limpeza de reservatórios de água',
          'other': 'Outros'
        }
      };
    }
  },

  // Obter tipos de fornecedor disponíveis
  getSupplierTypes: () => {
    return api.get('/supplier-types');
  },

  // Validar dados do fornecedor
  validateSupplierData: (data) => {
    const errors = [];

    // Validações básicas
    if (!data.company_name || data.company_name.trim() === '') {
      errors.push('Nome da empresa é obrigatório');
    }

    if (!data.contact_name || data.contact_name.trim() === '') {
      errors.push('Nome do contato é obrigatório');
    }

    if (!data.email || data.email.trim() === '') {
      errors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email deve ter um formato válido');
    }

    if (!data.phone || data.phone.trim() === '') {
      errors.push('Telefone é obrigatório');
    }

    if (!data.category) {
      errors.push('Categoria é obrigatória');
    }

    if (!data.supplier_type) {
      errors.push('Tipo de fornecedor é obrigatório');
    }

    // Validações condicionais baseadas no tipo
    if (data.supplier_type === 'company') {
      if (!data.cnpj || data.cnpj.trim() === '') {
        errors.push('CNPJ é obrigatório para empresas');
      } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(data.cnpj)) {
        errors.push('CNPJ deve ter o formato 00.000.000/0000-00');
      }
    } else if (data.supplier_type === 'individual' || data.supplier_type === 'mei') {
      if (!data.cpf || data.cpf.trim() === '') {
        errors.push('CPF é obrigatório');
      } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(data.cpf)) {
        errors.push('CPF deve ter o formato 000.000.000-00');
      }
    }

    if (!data.address || data.address.trim() === '') {
      errors.push('Endereço é obrigatório');
    }

    if (!data.cep || data.cep.trim() === '') {
      errors.push('CEP é obrigatório');
    } else if (!/^\d{5}-?\d{3}$/.test(data.cep)) {
      errors.push('CEP deve ter o formato 12345-678');
    }

    if (!data.city || data.city.trim() === '') {
      errors.push('Cidade é obrigatória');
    }

    if (!data.state || data.state.trim() === '') {
      errors.push('Estado é obrigatório');
    } else if (data.state.length !== 2) {
      errors.push('Estado deve ter 2 caracteres (ex: SP)');
    }

    // Validar datas se fornecidas
    if (data.contract_start && data.contract_end) {
      const startDate = new Date(data.contract_start);
      const endDate = new Date(data.contract_end);
      
      if (endDate <= startDate) {
        errors.push('Data de fim do contrato deve ser posterior à data de início');
      }
    }

    // Validar avaliação se fornecida
    if (data.evaluation !== null && data.evaluation !== undefined) {
      const eval_num = parseFloat(data.evaluation);
      if (isNaN(eval_num) || eval_num < 1 || eval_num > 5) {
        errors.push('Avaliação deve ser um número entre 1 e 5');
      }
    }

    // Validar valores se fornecidos
    if (data.hourly_rate && (isNaN(data.hourly_rate) || data.hourly_rate < 0)) {
      errors.push('Valor por hora deve ser um número positivo');
    }

    if (data.monthly_rate && (isNaN(data.monthly_rate) || data.monthly_rate < 0)) {
      errors.push('Valor mensal deve ser um número positivo');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Formatar CNPJ
  formatCNPJ: (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers;
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  },

  // Formatar CPF
  formatCPF: (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return numbers.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else if (numbers.length <= 9) {
      return numbers.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    }
  },

  // Formatar telefone
  formatPhone: (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return numbers.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    } else if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  },

  // Formatar CEP
  formatCEP: (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  },

  // Obter nome da categoria
  getCategoryName: (categoryKey) => {
    const categories = {
      'gas_supply': 'Fornecimento de gás',
      'gate_maintenance': 'Manutenção de portões',
      'intercom_maintenance': 'Manutenção de interfones',
      'cleaning': 'Zeladoria e limpeza',
      'reception': 'Portaria',
      'access_control': 'Controle de acesso',
      'gardening': 'Jardinagem',
      'elevator_maintenance': 'Manutenção de elevadores',
      'gym_maintenance': 'Manutenção da academia',
      'guarantee_company': 'Empresa garantidora (taxas de administração)',
      'condominium_admin': 'Administradora de condomínio',
      'third_party_manager': 'Síndico terceirizado',
      'pest_control': 'Dedetização / desinsetização / desratização',
      'water_tank_cleaning': 'Limpeza de reservatórios de água',
      'other': 'Outros'
    };
    return categories[categoryKey] || 'Outros';
  },

  // Obter nome do tipo de fornecedor
  getSupplierTypeName: (typeKey) => {
    const types = {
      'company': 'Empresa',
      'mei': 'MEI',
      'individual': 'Pessoa Física'
    };
    return types[typeKey] || 'Desconhecido';
  },

  // Obter nome do status
  getStatusName: (statusKey) => {
    const statuses = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'pending': 'Pendente',
      'blocked': 'Bloqueado'
    };
    return statuses[statusKey] || 'Desconhecido';
  },

  // Obter cor do status
  getStatusColor: (status) => {
    const colors = {
      'active': 'bg-green-500/20 text-green-400 border-green-500/30',
      'inactive': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'blocked': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  },

  // Verificar se contrato está próximo ao vencimento
  isContractExpiring: (contractEnd, days = 30) => {
    if (!contractEnd) return false;
    
    const endDate = new Date(contractEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= days && diffDays >= 0;
  },

  // Calcular dias restantes do contrato
  getContractDaysRemaining: (contractEnd) => {
    if (!contractEnd) return null;
    
    const endDate = new Date(contractEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }
};

export default supplierService;
