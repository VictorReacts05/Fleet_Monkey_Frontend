import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000/api/address-types';

export const fetchAddressTypes = async (page = 1, limit = 10, fromDate = null, toDate = null) => {
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

export const createAddressType = async (addressTypeData) => {
  try {
    const response = await axios.post(API_BASE_URL, addressTypeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateAddressType = async (id, addressTypeData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, addressTypeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteAddressType = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAddressTypeById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};