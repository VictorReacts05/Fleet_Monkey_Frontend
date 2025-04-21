import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000/api/customers';
const API_BASE_URL_GET = 'http://localhost:7000/api/customers/all';

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
    
    // console.log('Fetching customers with URL:', url);
    const response = await axios.get(url);
    // console.log('Raw customer data from API:', response.data);
    
    // If the response includes data, ensure it has the correct field mappings
    if (response.data && response.data.data) {
      // Map each customer to ensure consistent field names
      response.data.data = response.data.data.map(customer => {
        // console.log('Processing customer:', customer);
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
      // console.log('Mapped customer data:', response.data.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in fetchCustomers:', error);
    throw error.response?.data || error.message;
  }
};

export const fetchCurrencies = async () => {
  try {
    // console.log('Fetching currencies');
    const response = await axios.get('http://localhost:7000/api/currencies/all');
    // console.log('Currencies data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error.response?.data || error.message;
  }
};

export const fetchCompanies = async () => {
  try {
    // console.log('Fetching companies');
    const response = await axios.get('http://localhost:7000/api/companies/all');
    // console.log('Companies data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error.response?.data || error.message;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const user = getUserData();
    // console.log('Creating customer with form data:', customerData);
    
    // Ensure field names match what the API expects
    const payload = {
      customerName: customerData.CustomerName,
      companyId: customerData.CompanyID,
      importCode: customerData.ImportCode,
      billingCurrencyId: customerData.BillingCurrencyID,
      website: customerData.Website,
      customerNotes: customerData.CustomerNotes,
      createdById: user.personId
    };
    
    // console.log('Prepared API payload:', payload);
    
    // Validate required fields before sending
    if (!payload.customerName || !payload.companyId) {
      throw new Error('CustomerName and CompanyID are required fields');
    }
    
    const response = await axios.post(API_BASE_URL, payload);
    // console.log('Create customer response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createCustomer:', error);
    throw error.response?.data || error.message;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const user = getUserData();
    // console.log(`Updating customer ${id} with data:`, customerData);
    
    // Ensure field names match what the API expects
    const payload = {
      customerName: customerData.CustomerName,
      companyId: customerData.CompanyID,
      importCode: customerData.ImportCode,
      billingCurrencyId: customerData.BillingCurrencyID,
      website: customerData.Website,
      customerNotes: customerData.CustomerNotes,
      updatedById: user.personId
    };
    
    // console.log('Prepared update payload:', payload);
    
    // Validate required fields before sending
    if (!payload.customerName || !payload.companyId) {
      throw new Error('CustomerName and CompanyID are required fields');
    }
    
    const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
    // console.log('Update customer response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    throw error.response?.data || error.message;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const user = getUserData();
    // console.log(`Deleting customer with ID: ${id}`);
    
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      data: {
        deletedById: user.personId
      }
    });
    // console.log('Delete customer response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    throw error.response?.data || error.message;
  }
};

export const getCustomerById = async (id) => {
  try {
    // console.log(`Fetching customer with ID: ${id}`);
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    // console.log('Raw customer data from API:', response.data);
    
    // Check if the data is in an array format
    const customerData = response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0 
      ? response.data.data[0]  // Get the first item from the array
      : response.data.data || response.data;
    
    // console.log('Extracted customer data:', customerData);
    
    // Map the API response fields to match the form field names
    const mappedData = {
      CustomerName: customerData.CustomerName || customerData.customerName || '',
      CompanyID: customerData.CompanyID || customerData.companyId || '',
      ImportCode: customerData.ImportCode || customerData.importCode || '',
      BillingCurrencyID: customerData.BillingCurrencyID || customerData.billingCurrencyId || '',
      Website: customerData.Website || customerData.website || '',
      CustomerNotes: customerData.CustomerNotes || customerData.customerNotes || '',
      // Include these for reference in the table
      CompanyName: customerData.CompanyName || customerData.companyName || '',
      CurrencyName: customerData.BillingCurrencyName || customerData.billingCurrencyName || ''
    };
    
    // console.log('Mapped customer data for form:', mappedData);
    return mappedData;
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    throw error.response?.data || error.message;
  }
};