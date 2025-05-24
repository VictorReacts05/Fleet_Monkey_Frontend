import axios from 'axios';
import APIBASEURL from '../../../utils/apiBaseUrl';

export const fetchSuppliers = async (page = 1, limit = 10) => {
  try {
    let url = `${APIBASEURL}/suppliers?pageNumber=${page}&pageSize=${limit}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createSupplier = async (supplierData) => {
  try {
    const response = await axios.post(`${APIBASEURL}/suppliers`, supplierData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await axios.put(`${APIBASEURL}/suppliers/${id}`, supplierData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteSupplier = async (id) => {
  try {
    const response = await axios.delete(`${APIBASEURL}/suppliers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSupplierById = async (id) => {
  try {
    const response = await axios.get(`${APIBASEURL}/suppliers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};