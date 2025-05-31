import axios from 'axios';
import APIBASEURL from './apiBaseUrl';

const api = axios.create({
  baseURL: APIBASEURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to standardize response format
api.interceptors.response.use(
  (response) => ({
    success: true,
    data: response.data,
    error: null
  }),
  (error) => ({
    success: false,
    data: null,
    error: error.response?.data?.message || error.message || 'Failed to fetch data'
  })
);

// Sales RFQ API endpoints
export const fetchSalesRFQs = async () => {
  try {
    const response = await api.get('/sales-rfq');
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: null, error: error.message || 'Failed to fetch data' };
  }
};

export const fetchSalesRFQById = async (id) => {
  try {
    const response = await api.get(`/sales-rfq/${id}`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: null, error: error.message || 'Failed to fetch data' };
  }
};

export const createSalesRFQ = async (data) => {
  try {
    const response = await api.post('/sales-rfq', data);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: null, error: error.message || 'Failed to create Sales RFQ' };
  }
};

export const updateSalesRFQ = async (id, data) => {
  try {
    const response = await api.put(`/sales-rfq/${id}`, data);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: null, error: error.message || 'Failed to update Sales RFQ' };
  }
};

export const deleteSalesRFQ = async (id) => {
  try {
    const response = await api.delete(`/sales-rfq/${id}`);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: null, error: error.message || 'Failed to delete Sales RFQ' };
  }
};

// Keep other existing API endpoints
// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Update other API endpoints to match SalesRFQ pattern
export const fetchPurchaseRFQs = async () => {
  try {
    const response = await api.get('/purchase-rfqs');
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: null, error: error.message || 'Failed to fetch Purchase RFQs' };
  }
};

export const fetchSalesOrders = async () => {
  try {
    const response = await api.get('/sales-orders');
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: null, error: error.message || 'Failed to fetch Sales Orders' };
  }
};

export const fetchPurchaseOrders = async () => {
  try {
    const response = await api.get('/purchase-orders');
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: null, error: error.message || 'Failed to fetch Purchase Orders' };
  }
};

export const fetchInventory = async () => {
  try {
    const response = await api.get('/inventory');
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: null, error: error.message || 'Failed to fetch Inventory' };
  }
};

export const fetchShipments = async () => {
  try {
    const response = await api.get('/shipments');
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, data: null, error: error.message || 'Failed to fetch Shipments' };
  }
};

export default api;