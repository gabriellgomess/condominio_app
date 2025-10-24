import api from './api';

const billingService = {
  // ===== MENSALIDADES (MONTHLY FEES) =====

  /**
   * Lista todas as mensalidades
   */
  getMonthlyFees: async (params = {}) => {
    const response = await api.get('/billing/monthly-fees', { params });
    return response.data;
  },

  /**
   * Obtém uma mensalidade específica
   */
  getMonthlyFee: async (id) => {
    const response = await api.get(`/billing/monthly-fees/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova mensalidade
   */
  createMonthlyFee: async (data) => {
    const response = await api.post('/billing/monthly-fees', data);
    return response.data;
  },

  /**
   * Atualiza uma mensalidade
   */
  updateMonthlyFee: async (id, data) => {
    const response = await api.put(`/billing/monthly-fees/${id}`, data);
    return response.data;
  },

  /**
   * Remove uma mensalidade
   */
  deleteMonthlyFee: async (id) => {
    const response = await api.delete(`/billing/monthly-fees/${id}`);
    return response.data;
  },

  /**
   * Obtém estatísticas de uma mensalidade
   */
  getMonthlyFeeStatistics: async (id) => {
    const response = await api.get(`/billing/monthly-fees/${id}/statistics`);
    return response.data;
  },

  // ===== COBRANÇAS POR UNIDADE (UNIT BILLINGS) =====

  /**
   * Lista todas as cobranças
   */
  getUnitBillings: async (params = {}) => {
    const response = await api.get('/billing/unit-billings', { params });
    return response.data;
  },

  /**
   * Obtém uma cobrança específica
   */
  getUnitBilling: async (id) => {
    const response = await api.get(`/billing/unit-billings/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova cobrança
   */
  createUnitBilling: async (data) => {
    const response = await api.post('/billing/unit-billings', data);
    return response.data;
  },

  /**
   * Atualiza uma cobrança
   */
  updateUnitBilling: async (id, data) => {
    const response = await api.put(`/billing/unit-billings/${id}`, data);
    return response.data;
  },

  /**
   * Remove uma cobrança
   */
  deleteUnitBilling: async (id) => {
    const response = await api.delete(`/billing/unit-billings/${id}`);
    return response.data;
  },

  /**
   * Gera cobranças para todas as unidades de uma mensalidade
   */
  generateBillings: async (data) => {
    const response = await api.post('/billing/unit-billings/generate', data);
    return response.data;
  },

  /**
   * Atualiza o status de uma cobrança
   */
  updateBillingStatus: async (id) => {
    const response = await api.put(`/billing/unit-billings/${id}/update-status`);
    return response.data;
  },

  // ===== PAGAMENTOS (PAYMENTS) =====

  /**
   * Lista todos os pagamentos
   */
  getPayments: async (params = {}) => {
    const response = await api.get('/billing/payments', { params });
    return response.data;
  },

  /**
   * Obtém um pagamento específico
   */
  getPayment: async (id) => {
    const response = await api.get(`/billing/payments/${id}`);
    return response.data;
  },

  /**
   * Cria um novo pagamento
   */
  createPayment: async (data) => {
    const response = await api.post('/billing/payments', data);
    return response.data;
  },

  /**
   * Atualiza um pagamento
   */
  updatePayment: async (id, data) => {
    const response = await api.put(`/billing/payments/${id}`, data);
    return response.data;
  },

  /**
   * Remove um pagamento
   */
  deletePayment: async (id) => {
    const response = await api.delete(`/billing/payments/${id}`);
    return response.data;
  },

  /**
   * Obtém estatísticas de pagamentos
   */
  getPaymentStatistics: async (params) => {
    const response = await api.get('/billing/payments/statistics', { params });
    return response.data;
  },

  // ===== HELPER FUNCTIONS =====

  /**
   * Formata valores para exibição
   */
  formatCurrency: (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  },

  /**
   * Formata data para exibição
   */
  formatDate: (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  },

  /**
   * Retorna cor do status da cobrança
   */
  getBillingStatusColor: (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      overdue: 'danger',
      partially_paid: 'info',
      cancelled: 'secondary'
    };
    return colors[status] || 'secondary';
  },

  /**
   * Retorna label do status da cobrança
   */
  getBillingStatusLabel: (status) => {
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      partially_paid: 'Pago Parcialmente',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  },

  /**
   * Retorna cor do status da mensalidade
   */
  getMonthlyFeeStatusColor: (status) => {
    const colors = {
      draft: 'secondary',
      issued: 'info',
      closed: 'success',
      cancelled: 'danger'
    };
    return colors[status] || 'secondary';
  },

  /**
   * Retorna label do status da mensalidade
   */
  getMonthlyFeeStatusLabel: (status) => {
    const labels = {
      draft: 'Rascunho',
      issued: 'Emitido',
      closed: 'Fechado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  },

  /**
   * Retorna label do método de pagamento
   */
  getPaymentMethodLabel: (method) => {
    const labels = {
      bank_slip: 'Boleto',
      transfer: 'Transferência',
      pix: 'PIX',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      cash: 'Dinheiro',
      other: 'Outro'
    };
    return labels[method] || method;
  },

  /**
   * Retorna ícone do método de pagamento
   */
  getPaymentMethodIcon: (method) => {
    const icons = {
      bank_slip: '📄',
      transfer: '🏦',
      pix: '💳',
      credit_card: '💳',
      debit_card: '💳',
      cash: '💵',
      other: '📝'
    };
    return icons[method] || '📝';
  }
};

export default billingService;
