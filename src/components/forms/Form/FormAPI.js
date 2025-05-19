import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/forms";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Configure axios with auth headers
const getAxiosConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

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

export const fetchForms = async (
  page = 1,
  limit = 10,
  searchTerm = ""
) => {
  try {
    let url = `${API_BASE_URL}?pageNumber=${page}&pageSize=${limit}`;
    if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;

    const response = await axios.get(url, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch forms:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const createForm = async (formData) => {
  try {
    const user = getUserData();
    
    const requestData = {
      FormName: formData.FormName,
      CreatedByID: user.personId || 1,
      IsDeleted: false
    };

    console.log("[DEBUG] Creating form:", requestData);
    
    const response = await axios.post(API_BASE_URL, requestData, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to create form:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const updateForm = async (id, formData) => {
  try {
    const user = getUserData();
    
    const requestData = {
      FormID: Number(id),
      FormName: formData.FormName,
      ModifiedByID: user.personId || 1
    };

    // Include RowVersionColumn if available
    if (formData.RowVersionColumn) {
      requestData.RowVersionColumn = formData.RowVersionColumn;
    }

    console.log("[DEBUG] Updating form:", requestData);
    
    const response = await axios.put(`${API_BASE_URL}/${id}`, requestData, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to update form:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const deleteForm = async (id) => {
  try {
    const user = getUserData();
    
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      ...getAxiosConfig(),
      data: {
        deletedById: user.personId || 1
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to delete form:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const getFormById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, getAxiosConfig());
    
    if (response.data && response.data.data) {
      return Array.isArray(response.data.data) 
        ? response.data.data[0] 
        : response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to get form:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};