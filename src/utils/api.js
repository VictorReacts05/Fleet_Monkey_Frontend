import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:7000/api',
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
export const fetchPurchaseRFQs = () => api.get('/purchase-rfq');
export const fetchSalesOrders = () => api.get('/sales-order');
export const fetchPurchaseOrders = () => api.get('/purchase-order');
export const fetchInventory = () => api.get('/items');
export const fetchShipments = () => api.get('/shipments');

export default api;