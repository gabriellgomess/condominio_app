import api from './api';

// Subaccounts
export const listSubaccounts = (params = {}) => api.get('/finance/subaccounts', { params });
export const createSubaccount = (data) => api.post('/finance/subaccounts', data);
export const updateSubaccount = (id, data) => api.put(`/finance/subaccounts/${id}`, data);
export const deleteSubaccount = (id) => api.delete(`/finance/subaccounts/${id}`);

// Revenues
export const listRevenues = (params = {}) => api.get('/finance/revenues', { params });
export const createRevenue = (data) => api.post('/finance/revenues', data);
export const updateRevenue = (id, data) => api.put(`/finance/revenues/${id}`, data);
export const deleteRevenue = (id) => api.delete(`/finance/revenues/${id}`);

// Expenses
export const listExpenses = (params = {}) => api.get('/finance/expenses', { params });
export const createExpense = (data) => api.post('/finance/expenses', data);
export const updateExpense = (id, data) => api.put(`/finance/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/finance/expenses/${id}`);

// Categories
export const listCategories = (params = {}) => api.get('/finance/categories', { params });
export const createCategory = (data) => api.post('/finance/categories', data);
export const updateCategory = (id, data) => api.put(`/finance/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/finance/categories/${id}`);
export const getCategoriesBySubaccount = (subaccountId) => api.get(`/finance/subaccounts/${subaccountId}/categories`);

export default {
  listSubaccounts,
  createSubaccount,
  updateSubaccount,
  deleteSubaccount,
  listRevenues,
  createRevenue,
  updateRevenue,
  deleteRevenue,
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesBySubaccount,
};











