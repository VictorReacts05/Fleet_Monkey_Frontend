import axios from 'axios';

// Try another endpoint format based on other working endpoints in the app
const API_BASE_URL = "http://localhost:7000/api/bank-accounts"; // Changed to match likely backend naming

export const fetchBanks = async (pageNumber = 1, pageSize = 10) => {
  try {
    console.log(`Fetching banks: page=${pageNumber}, size=${pageSize}`);
    const response = await axios.get(API_BASE_URL, {
      params: {
        pageNumber,
        pageSize
      }
    });
    console.log('Fetch response:', response.data);
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
    console.log("Creating bank with data:", {
      ...bankData,
      createdById: user.personId,
    }); // Debug log
    const response = await axios.post(API_BASE_URL, {
      ...bankData,
      createdById: user.personId,
    });
    console.log("Create bank response:", response.data); // Debug log
    if (response.data.result !== 0) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (error) {
    console.error("Create bank error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    }); // Debug log
    throw error.response?.data || error.message;
  }
};

export const updateBank = async (id, bankData) => {
  try {
    console.log(`Updating bank ID ${id} with data:`, bankData); // Debug log
    const response = await axios.put(`${API_BASE_URL}/${id}`, {
      ...bankData,
      RowVersionColumn: bankData.RowVersionColumn,
    });
    console.log("Update bank response:", response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error("Update bank error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    }); // Debug log
    throw error.response?.data || error.message;
  }
};

export const deleteBank = async (id) => {
  try {
    console.log(`Deleting bank ID ${id}`);
    const user = JSON.parse(localStorage.getItem('user')) || {};
    await axios.delete(`${API_BASE_URL}/${id}`, {
      data: { 
        deletedById: user.personId || 1
      }
    });
    console.log(`Bank ${id} deleted successfully`);
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
    console.log(`Fetching bank ID ${id}`); // Debug log
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    console.log("Get bank response:", response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error("Get bank error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    }); // Debug log
    throw error.response?.data || error.message;
  }
};
