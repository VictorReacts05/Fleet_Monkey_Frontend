import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000/api/warehouses';

export const fetchWarehouses = async (page = 1, limit = 10, fromDate = null, toDate = null) => {
  try {
    let url = `${API_BASE_URL}?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    
    // console.log('API Request URL:', url); 
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createWarehouse = async (warehouseData) => {
  try {
    const response = await axios.post(API_BASE_URL, warehouseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// For the updateWarehouse function in WarehouseAPI.js
export const updateWarehouse = async (warehouseId, data) => {
  try {
    console.log(`Updating warehouse ${warehouseId} with data:`, data);
    
    // Fix the API endpoint to use the correct base URL
    const response = await axios.put(`${API_BASE_URL}/${warehouseId}`, data);
    
    console.log('Update response:', response);
    return response;
  } catch (error) {
    console.error('Error updating warehouse:', error);
    throw error;
  }
};

export const deleteWarehouse = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getWarehouseById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};