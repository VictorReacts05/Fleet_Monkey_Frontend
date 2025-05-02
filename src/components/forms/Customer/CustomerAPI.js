import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000/api/customers';
const API_BASE_URL_GET = 'http://localhost:7000/api/customers';

// Add axios interceptor to include auth token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to get user data safely
const getUserData = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      return { personId: 1 }; // Default user ID for development
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return { personId: 1 }; // Default user ID for development
  }
};

export const fetchCustomers = async (page = 1, limit = 10, fromDate = null, toDate = null) => {
  try {
    let url = `${API_BASE_URL_GET}?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    
    const response = await axios.get(url);
    
    // If the response includes data, ensure it has the correct field mappings
    if (response.data && response.data.data) {
      // Map each customer to ensure consistent field names
      response.data.data = response.data.data.map(customer => {
        return {
          id: customer.CustomerID || customer.customerId,
          CustomerID: customer.CustomerID || customer.customerId,
          CustomerName: customer.CustomerName || customer.customerName || '',
          CompanyID: customer.CompanyID || customer.companyId,
          CompanyName: customer.CompanyName || customer.companyName || '',
          ImportCode: customer.ImportCode || customer.importCode || '',
          BillingCurrencyID: customer.BillingCurrencyID || customer.billingCurrencyId,
          CurrencyName: customer.BillingCurrencyName || customer.billingCurrencyName || '',
          Website: customer.Website || customer.website || '',
          createdDateTime: customer.CreatedDateTime || customer.createdDateTime || ''
        };
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in fetchCustomers:', error);
    throw error.response?.data || error.message;
  }
};

// Add or update these functions in CustomerAPI.js

export const fetchCurrencies = async () => {
  try {
    const response = await axios.get('http://localhost:7000/api/currencies');
    
    // Log the response for debugging
    console.log('Currencies API response:', response.data);
    
    // Check different possible response structures
    let currenciesData = [];
    
    if (response.data && response.data.data) {
      // If data is in response.data.data
      currenciesData = response.data.data;
    } else if (Array.isArray(response.data)) {
      // If response.data is directly an array
      currenciesData = response.data;
    } else if (response.data.results) {
      // If data is in response.data.results
      currenciesData = response.data.results;
    }
    
    // Map the currencies to ensure consistent field names
    const formattedCurrencies = currenciesData.map(currency => ({
      CurrencyID: currency.CurrencyID || currency.currencyID || currency.id,
      CurrencyName: currency.CurrencyName || currency.currencyName || currency.name
    }));
    
    return {
      success: true,
      data: formattedCurrencies
    };
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
};

export const fetchCompanies = async () => {
  try {
    const response = await axios.get('http://localhost:7000/api/companies');
    
    // Log the response for debugging
    console.log('Companies API response:', response.data);
    
    // Check different possible response structures
    let companiesData = [];
    
    if (response.data && response.data.data) {
      // If data is in response.data.data
      companiesData = response.data.data;
    } else if (Array.isArray(response.data)) {
      // If response.data is directly an array
      companiesData = response.data;
    } else if (response.data.results) {
      // If data is in response.data.results
      companiesData = response.data.results;
    }
    
    // Map the companies to ensure consistent field names
    const formattedCompanies = companiesData.map(company => ({
      CompanyID: company.CompanyID || company.companyID || company.id,
      CompanyName: company.CompanyName || company.companyName || company.name
    }));
    
    return {
      success: true,
      data: formattedCompanies
    };
  } catch (error) {
    console.error('Error fetching companies:', error);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
};

export const createCustomer = async (customerData) => {
  try {
    console.log('Creating customer with data:', customerData);
    
    // Get user from localStorage for CreatedByID
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    // Ensure all required fields are present and properly formatted
    const requestData = {
      CustomerName: customerData.CustomerName,
      CompanyID: customerData.CompanyID ? Number(customerData.CompanyID) : null,
      ImportCode: customerData.ImportCode,
      BillingCurrencyID: customerData.BillingCurrencyID ? Number(customerData.BillingCurrencyID) : null,
      Website: customerData.Website,
      CustomerNotes: customerData.CustomerNotes,
      CreatedByID: user.personId || 1 // Default to 1 if not available
    };
    
    console.log('Formatted request data:', requestData);
    
    const response = await axios.post(API_BASE_URL, requestData);
    return response.data;
  } catch (error) {
    console.error('Error in createCustomer:', error);
    throw error.response?.data || error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    console.log('Updating customer with ID:', id, 'Data:', customerData);
    
    // Get user from localStorage for ModifiedByID
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    // Ensure all required fields are present and properly formatted
    const requestData = {
      CustomerID: Number(id),
      CustomerName: customerData.CustomerName,
      CompanyID: customerData.CompanyID ? Number(customerData.CompanyID) : null,
      ImportCode: customerData.ImportCode,
      BillingCurrencyID: customerData.BillingCurrencyID ? Number(customerData.BillingCurrencyID) : null,
      Website: customerData.Website,
      CustomerNotes: customerData.CustomerNotes,
      ModifiedByID: user.personId || 1 // Default to 1 if not available
    };
    
    // Include RowVersionColumn if available
    if (customerData.RowVersionColumn) {
      requestData.RowVersionColumn = customerData.RowVersionColumn;
    }
    
    console.log('Formatted update request data:', requestData);
    
    const response = await axios.put(`${API_BASE_URL}/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    throw error.response?.data || error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const user = getUserData();
    
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      data: {
        deletedById: user.personId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    throw error.response?.data || error.message;
  }
};

export const getCustomerById = async (id) => {
  try {
    console.log(`Fetching customer with ID: ${id}`);
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    
    console.log('Customer data response:', response.data);
    
    // Handle different response structures
    let customerData = null;
    
    if (response.data.data) {
      // If data is in response.data.data
      customerData = Array.isArray(response.data.data) 
        ? response.data.data[0] 
        : response.data.data;
    } else if (response.data.result === 0) {
      // If using result code format
      customerData = response.data.data;
    } else if (response.data.CustomerID) {
      // If direct object
      customerData = response.data;
    }
    
    if (!customerData) {
      throw new Error('Customer data not found in response');
    }
    
    console.log('Processed customer data:', customerData);
    return customerData;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};