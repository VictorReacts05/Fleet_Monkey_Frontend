import axios from 'axios';

// Update the API endpoint to match your backend structure
const API_BASE_URL = "http://localhost:7000/api/currencies"; // Changed from "currency" to "currencies"

// Helper function to get auth token
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      console.warn('User authentication data not found, proceeding without auth token');
      return {};
    }
    return {
      Authorization: `Bearer ${user.token}`
    };
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return {};
  }
};

export const fetchCurrencies = async (page = 1, limit = 10, fromDate = null, toDate = null) => {
  try {
    let url = `${API_BASE_URL}/all?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    
    // console.log('Fetching currencies from:', url); 
    
    const response = await axios.get(url, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error.response?.data || error.message;
  }
};

export const createCurrency = async (currencyData) => {
  // Add immediate console log outside try/catch
  // console.log('CREATE CURRENCY FUNCTION CALLED', new Date().toISOString());
  
  try {
    // Try a simpler endpoint without the /create suffix
    const url = `${API_BASE_URL}`;
    // console.log('Creating currency with data:', JSON.stringify(currencyData));
    // console.log('POST request to:', url);
    
    // Force console to display immediately
    // console.log('%c Attempting to create currency', 'background: #222; color: #bada55');
    
    const headers = {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    };
    // console.log('Request headers:', JSON.stringify(headers));
    
    // Use a timeout to ensure we see logs even if axios hangs
    /* setTimeout(() => {
      console.log('Still waiting for axios response after 2 seconds...');
    }, 2000); */
    
    const response = await axios.post(url, currencyData, {
      headers: headers
    });
    
    // console.log('Create currency response:', response.data);
    return response.data;
  } catch (error) {
    // Force error to display prominently
    // console.log('%c Currency creation failed', 'background: red; color: white; font-size: 16px');
    console.error('Error creating currency:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received, request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Re-throw with more details
    throw error.response?.data || error.message || 'Unknown error creating currency';
  }
};

export const updateCurrency = async (id, currencyData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, currencyData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteCurrency = async (id, userId) => {
  try {
    // Use a default value if userId is not provided
    const deletedById = userId || 1; // Temporarily use 1 as fallback
    
    // Send the deletedById in the request body
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
      data: { deletedById: deletedById }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCurrencyById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
