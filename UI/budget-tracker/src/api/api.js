import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Token ${token}`;
  return config;
}, error => Promise.reject(error));

export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post('/login/', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchTransactions = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/transactions/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTransaction = async (data) => {
  try {
    const response = await axiosInstance.post('/transactions/', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTransaction = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/transactions/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    const response = await axiosInstance.delete(`/transactions/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await axiosInstance.get('/categories/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (data) => {
  try {
    const response = await axiosInstance.post('/categories/', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchBudgetSummary = async () => {
  try {
    const response = await axiosInstance.get('/budget/monthly/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBudget = async (data) => {
  try {
    const response = await axiosInstance.put('/budget/', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
