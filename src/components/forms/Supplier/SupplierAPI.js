import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000/api/suppliers';

export const fetchSuppliers = async (page = 1, limit = 10, fromDate = null, toDate = null) => {
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

export const createSupplier = async (supplierData) => {
  try {
    const response = await axios.post(API_BASE_URL, supplierData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, supplierData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteSupplier = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSupplierById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};