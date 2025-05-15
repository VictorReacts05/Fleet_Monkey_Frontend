import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/roles";

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

export const fetchRoles = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    let url = `${API_BASE_URL}?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const response = await axios.get(url, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch roles:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const createRole = async (roleData) => {
  try {
    // Get user from localStorage for createdById
    const user = JSON.parse(localStorage.getItem("user")) || {};
    
    // Prepare data with correct field names (capital letters to match backend)
    const requestData = {
      RoleName: roleData.RoleName,
      ReadAccess: roleData.ReadAccess || false,
      WriteAccess: roleData.WriteAccess || false,
      CreatedByID: user.personId || 1,
    };
    
    console.log("[DEBUG] Role create request data:", requestData);
    
    const response = await axios.post(
      API_BASE_URL,
      requestData,
      getAxiosConfig()
    );
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to create role:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const updateRole = async (roleId, roleData) => {
  try {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user")) || {};
    
    // Prepare data with correct field names (capital letters to match backend)
    const requestData = {
      RoleID: Number(roleId),
      RoleName: roleData.RoleName,
      ReadAccess: roleData.ReadAccess || false,
      WriteAccess: roleData.WriteAccess || false,
      CreatedByID: user.personId || 1,
    };
    
    if (roleData.RowVersionColumn) {
      requestData.RowVersionColumn = roleData.RowVersionColumn;
    }
    
    console.log("[DEBUG] Role update request data:", requestData);
    
    const response = await axios.put(
      `${API_BASE_URL}/${roleId}`,
      requestData,
      getAxiosConfig()
    );
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to update role:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const deleteRole = async (id) => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    await axios.delete(`${API_BASE_URL}/${id}`, {
      ...getAxiosConfig(),
      data: {
        deletedById: user.personId || 1,
      },
    });
  } catch (error) {
    console.error("[ERROR] Failed to delete role:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

// Add this function after the existing functions

export const getRoleById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, getAxiosConfig());
    
    if (response.data && response.data.data) {
      return Array.isArray(response.data.data) 
        ? response.data.data[0] 
        : response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to get role:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};