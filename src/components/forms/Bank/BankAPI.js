import axios from 'axios';

// Try another endpoint format based on other working endpoints in the app
const API_BASE_URL = "http://localhost:7000/api/bank-accounts"; // Changed to match likely backend naming

export const fetchBanks = async (pageNumber = 1, pageSize = 10) => {
  try {
    // console.log(`Fetching banks: page=${pageNumber}, size=${pageSize}`);
    const response = await axios.get(API_BASE_URL, {
      params: {
        pageNumber,
        pageSize
      }
    });
    // console.log('Fetch response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fetch error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    throw error.response?.data || error.message;
  }
};

export const createBank = async (bankData) => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    
    // Transform data to match backend expectations - use capital letters for field names
    const requestData = {
      AccountName: bankData.AccountName,
      AccountType: bankData.AccountType,
      BankName: bankData.BankName,
      BranchCode: bankData.BranchCode || null,
      IBAN: bankData.IBAN || null,
      IFSC: bankData.IFSC || null,
      MICRA: bankData.MICRA || null,
      CreatedByID: user.personId || 1, // Use user's personId or default to 1
    };
    
    console.log("[DEBUG] Bank create request data:", requestData);
    
    const response = await axios.post(API_BASE_URL, requestData);
    return response.data;
  } catch (error) {
    console.error("Create bank error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const updateBank = async (id, bankData) => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    
    // Transform data to match backend expectations - use capital letters for field names
    const requestData = {
      BankAccountID: Number(id),
      AccountName: bankData.AccountName,
      AccountType: bankData.AccountType,
      BankName: bankData.BankName,
      BranchCode: bankData.BranchCode || null,
      IBAN: bankData.IBAN || null,
      IFSC: bankData.IFSC || null,
      MICRA: bankData.MICRA || null,
      CreatedByID: user.personId || 1, // Use user's personId or default to 1
    };
    
    if (bankData.RowVersionColumn) {
      requestData.RowVersionColumn = bankData.RowVersionColumn;
    }
    
    console.log("[DEBUG] Bank update request data:", requestData);
    
    const response = await axios.put(`${API_BASE_URL}/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error("Update bank error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const deleteBank = async (id) => {
  try {
    // console.log(`Deleting bank ID ${id}`);
    const user = JSON.parse(localStorage.getItem('user')) || {};
    await axios.delete(`${API_BASE_URL}/${id}`, {
      data: { 
        deletedById: user.personId || 1
      }
    });
    // console.log(`Bank ${id} deleted successfully`);
  } catch (error) {
    console.error('Delete bank error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    throw error.response?.data || error.message;
  }
};

export const getBankById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    
    // Check if the response contains a success message
    if (response.data.message && response.data.message.includes("successfully")) {
      // If the response has data property, return it
      if (response.data.data) {
        // The API returns an array, so we need to get the first item
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          return response.data.data[0]; // Return the first item in the array
        } else {
          return response.data.data; // If it's not an array, return as is
        }
      }
      // If no data property but we have a success message, return an empty object
      return {};
    }
    
    // If we don't have a success message, check for result code
    if (response.data.result === 0 && response.data.data) {
      // The API returns an array, so we need to get the first item
      if (Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data[0]; // Return the first item in the array
      } else {
        return response.data.data; // If it's not an array, return as is
      }
    }
    
    // If we reach here, something unexpected happened
    throw new Error(response.data.message || "Failed to retrieve bank account");
  } catch (error) {
    // Only log and throw if it's a real error, not a success message
    if (!error.message.includes("successfully")) {
      console.error("Get bank error:", error);
      throw error;
    }
    // If it's a success message but we couldn't extract data, return empty object
    return {};
  }
};
