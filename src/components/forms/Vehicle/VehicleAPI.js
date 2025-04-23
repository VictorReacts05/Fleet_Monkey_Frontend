import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000/api/vehicles';

export const fetchVehicles = async (page = 1, limit = 10, fromDate = null, toDate = null) => {
  try {
    let url = `${API_BASE_URL}?page=${page}&limit=${limit}`;
    
    // Only add date parameters if they are not null
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createVehicle = async (vehicleData) => {
  try {
    const response = await axios.post(API_BASE_URL, vehicleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateVehicle = async (id, vehicleData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, vehicleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteVehicle = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getVehicleById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch companies for dropdown
export const fetchCompanies = async () => {
  try {
    // console.log("Calling companies API...");
    const response = await axios.get('http://localhost:7000/api/companies/all');
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return { data: [] };
  }
};

// Fetch vehicle types for dropdown
export const fetchVehicleTypes = async () => {
  try {
    // console.log("Calling vehicle types API...");
    // Corrected endpoint path
    const response = await axios.get('http://localhost:7000/api/vehicletype');
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    try {
      // console.log("Trying alternative vehicle types endpoint...");
      // Alternative endpoint with /all
      const response = await axios.get('http://localhost:7000/api/vehicletype/all');
      return response.data;
    } catch (altError) {
      console.error("Error fetching from alternative endpoint:", altError);
      return { data: [] };
    }
  }
};