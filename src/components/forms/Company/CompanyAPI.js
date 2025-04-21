import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000/api/companies';

export const fetchCompanies = async (page = 1, limit = 10, fromDate = null, toDate = null) => {
  try {
    let url = `${API_BASE_URL}/all?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createCompany = async (companyData) => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    
    // Prepare data for API
    const apiData = {
      companyName: companyData.CompanyName,
      billingCurrencyID: companyData.BillingCurrencyID,
      vatAccount: companyData.VAT_Account,
      website: companyData.Website,
      companyNotes: companyData.CompanyNotes,
      createdByID: user.personId
    };
    
    const response = await axios.post(API_BASE_URL, apiData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateCompany = async (id, companyData) => {
  try {
    // Prepare data for API
    const apiData = {
      companyName: companyData.CompanyName,
      billingCurrencyID: companyData.BillingCurrencyID,
      vatAccount: companyData.VAT_Account,
      website: companyData.Website,
      companyNotes: companyData.CompanyNotes,
      rowVersionColumn: companyData.RowVersionColumn
    };
    
    const response = await axios.put(`${API_BASE_URL}/${id}`, apiData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteCompany = async (id) => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      data: { deletedByID: user.personId }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCompanyById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    
    // Check if the response has data
    if (response.data && response.data.data) {
      // Handle both array and object responses
      if (Array.isArray(response.data.data)) {
        if (response.data.data.length > 0) {
          return response.data.data[0];
        } else {
          throw new Error('Company not found');
        }
      } else {
        return response.data.data;
      }
    } else if (response.data && response.data.result !== undefined) {
      // Some APIs return result code instead
      if (response.data.result === 0) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to retrieve company');
      }
    } else {
      // Direct response
      return response.data;
    }
  } catch (error) {
    console.error("Get company error:", error);
    // Log more details about the error
    if (error.response) {
      console.error("API response error details:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });
    }
    throw error;
  }
};

// Fetch all currencies for dropdown
export const fetchAllCurrencies = async () => {
  try {
    const response = await axios.get('http://localhost:7000/api/currencies/all');
    
    // Check the structure of the response and extract the currency data
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      // Try to find currencies in a different format
      const possibleData = response.data.currencies || response.data.result?.data || [];
      return possibleData;
    }
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error.response?.data || error.message;
  }
};