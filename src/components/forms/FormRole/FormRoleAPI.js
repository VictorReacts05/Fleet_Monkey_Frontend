import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

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

export const fetchFormRoles = async (
  page = 1,
  limit = 10,
  searchTerm = ""
) => {
  try {
    let url = `${APIBASEURL}/formRole?pageNumber=${page}&pageSize=${limit}`;
    if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;

    const response = await axios.get(url, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch form roles:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const createFormRole = async (formRoleData) => {
  try {
    const user = getUserData();
    
    const requestData = {
      FormID: formRoleData.FormID,
      RoleID: formRoleData.RoleID,
      ReadOnly: formRoleData.ReadOnly,
      Write: formRoleData.Write
    };

    console.log("[DEBUG] Creating form role:", requestData);
    
    const response = await axios.post(`${APIBASEURL}/formRole`, requestData, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to create form role:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const updateFormRole = async (id, formRoleData) => {
  try {
    const user = getUserData();
    
    const requestData = {
      FormRoleID: Number(id),
      FormID: formRoleData.FormID,
      RoleID: formRoleData.RoleID,
      ReadOnly: formRoleData.ReadOnly,
      Write: formRoleData.Write
    };

    console.log("[DEBUG] Updating form role:", requestData);
    
    const response = await axios.put(`${APIBASEURL}/formRole/${id}`, requestData, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to update form role:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const deleteFormRole = async (id) => {
  try {
    const user = getUserData();
    
    const response = await axios.delete(`${APIBASEURL}/formRole/${id}`, {
      ...getAxiosConfig(),
      data: {
        formRoleId: Number(id)
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to delete form role:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const getFormRoleById = async (id) => {
  try {
    const response = await axios.get(`${APIBASEURL}/formRole/${id}`, getAxiosConfig());
    
    if (response.data && response.data.data) {
      return Array.isArray(response.data.data) 
        ? response.data.data[0] 
        : response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to get form role:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

// Fetch all forms for dropdown
export const fetchForms = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/forms`, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch forms:", error);
    throw error;
  }
};

// Fetch all roles for dropdown
export const fetchRoles = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/roles`, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch roles:", error);
    throw error;
  }
};