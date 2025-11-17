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
    localStorage.setItem('currency', response.data.currency); 
    localStorage.setItem('name', response.data.name); 
    console.log(response.data.token);
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

export const fetchCategories = async (type = null) => {
  try {
    const params = {};
    if (type) {
      params.type = type;
    }
    const response = await axiosInstance.get('/categories/', { params });
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

export const fetchBudgetSummary = async (year = null, month = null) => {
  try {
    const params = {};
    if (year && month) {
      params.year = year;
      params.month = month;
    }
    const response = await axiosInstance.get('/budget/monthly/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/categories/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/categories/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBudget = async (data) => {
  try {
    const params = {};
    if (data.year && data.month) {
      params.year = data.year;
      params.month = data.month;
    }
    const response = await axiosInstance.put('/budget/', data, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};
