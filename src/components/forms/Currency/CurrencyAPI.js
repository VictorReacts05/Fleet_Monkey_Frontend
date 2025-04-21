import axios from 'axios';

// Base URLs
const API_BASE_URL_GET = 'http://localhost:7000/api/currencies/all';
const API_BASE_URL = 'http://localhost:7000/api/currencies';

// Add axios interceptor to include auth token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Remove localStorage-based interceptor
// Add API endpoint for user context
const USER_API_URL = 'http://localhost:7000/api/users/current';

const getCurrentUser = async () => {
  try {
    const response = await axios.get(USER_API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch user context');
  }
};

export const createCurrency = async (currencyData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    if (!user.personId) {
      throw new Error('User authentication data not found');
    }

    const response = await axios.post(API_BASE_URL, {
      currencyName: currencyData.CurrencyName,
      createdById: user.personId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update similar in updateCurrency and deleteCurrency:

export const updateCurrency = async (currencyId, data) => {
  try {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    if (!user.personId) {
      throw new Error('User authentication data not found');
    }

    const payload = {
      currencyName: data.CurrencyName,
      createdById: user.personId,
      rowVersionColumn: data.RowVersionColumn
    };
    
    const response = await axios.put(`${API_BASE_URL}/${currencyId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating currency:', error);
    throw error;
  }
};

export const deleteCurrency = async (id) => {
  try {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    if (!user.personId) {
      throw new Error('User authentication data not found');
    }

    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      data: {
        deletedById: user.personId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in deleteCurrency:', error);
    throw error.response?.data || error;
  }
};

export const getCurrencyById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    
    // Match the backend field names
    return {
      CurrencyName: response.data.CurrencyName || response.data.currencyName,
      RowVersionColumn: response.data.RowVersionColumn || response.data.rowVersionColumn,
      CurrencyID: response.data.CurrencyID || response.data.currencyId
    };
  } catch (error) {
    console.error('Error in getCurrencyById:', error);
    throw error.response?.data || error.message;
  }
};

// Make sure this export exists
export const fetchCurrencies = async (page = 1, limit = 10, fromDate = null, toDate = null) => {
  try {
    let url = `${API_BASE_URL_GET}?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
