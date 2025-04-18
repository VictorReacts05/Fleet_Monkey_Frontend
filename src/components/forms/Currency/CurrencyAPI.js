import axios from 'axios';

// Base URL for fetching all currencies
const API_BASE_URL_GET = 'http://localhost:7000/api/currencies/all';
// Base URL for other operations (create, update, delete)
const API_BASE_URL = 'http://localhost:7000/api/currencies';

export const fetchCurrencies = async (page = 1, limit = 10, fromDate = null, toDate = null) => {
  try {
    let url = `${API_BASE_URL_GET}?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    
    console.log('API Request URL:', url);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createCurrency = async (currencyData) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const createdById = currentUser.userId || 1;
    
    const response = await axios.post(API_BASE_URL, {
      currencyName: currencyData.CurrencyName, // Convert to lowercase
      createdById: createdById
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateCurrency = async (currencyId, data) => {
  try {
    console.log(`Updating currency ${currencyId} with data:`, data);
    
    // Get current user ID from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const createdById = currentUser.userId || 1;

    const payload = {
      currencyName: data.CurrencyName, // Convert to lowercase
      createdById: createdById,
      rowVersionColumn: data.RowVersionColumn // Include version column for concurrency
    };

    const response = await axios.put(`${API_BASE_URL}/${currencyId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating currency:', error);
    throw error;
  }
};

export const deleteCurrency = async (id, deletedById) => {
  try {
    console.log(`Deleting currency with ID: ${id}`);
    
    // If no deletedById is provided, try to get it from auth context or localStorage
    if (!deletedById) {
      // Try to get the current user ID from localStorage or a user context
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
      deletedById = currentUser.userId || 1; // Fallback to 1 if no user ID found
    }
    
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      data: {
        deletedById: deletedById
      }
    });
    console.log('Delete response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in deleteCurrency:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error.response?.data || error;
  }
};

export const getCurrencyById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
