import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000/api/cities';
const CITIES_ALL_URL = 'http://localhost:7000/api/cities/all';
const COUNTRY_API_URL = 'http://localhost:7000/api/country-Of-Origin';

export const fetchCities = async (page = 1, limit = 10, fromDate = null, toDate = null) => {
  try {
    let url = `${CITIES_ALL_URL}?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    
    console.log('API Request URL:', url);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createCity = async (cityData) => {
  try {
    const response = await axios.post(API_BASE_URL, cityData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateCity = async (cityId, data) => {
  try {
    console.log(`Updating city ${cityId} with data:`, data);
    const response = await axios.put(`${API_BASE_URL}/${cityId}`, data);
    console.log('Update response:', response);
    return response;
  } catch (error) {
    console.error('Error updating city:', error);
    throw error;
  }
};

export const deleteCity = async (id) => {
  try {
    console.log(`Deleting city with ID: ${id}`);
    // We need to pass deletedById as a parameter to actually delete the record
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      data: {
        deletedById: 1  // This is required for the actual deletion
      }
    });
    console.log('Delete response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in deleteCity:', error);
    // Log more details about the error response
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error.response?.data || error;
  }
};

export const getCityById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchCountries = async () => {
  try {
    // Increase the page size to fetch all countries
    const response = await axios.get(`${COUNTRY_API_URL}?pageSize=100`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};