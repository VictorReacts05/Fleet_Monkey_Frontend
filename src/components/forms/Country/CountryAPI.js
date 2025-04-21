import axios from 'axios';

// Update the API endpoint to match your backend structure
// The endpoint should match what's registered in your backend
const API_BASE_URL = "http://localhost:7000/api/country-Of-Origin";

export const fetchCountries = async (page = 1, limit = 10, fromDate = null, toDate = null) => {
  try {
    let url = `${API_BASE_URL}?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createCountry = async (countryData) => {
  try {
    const response = await axios.post(API_BASE_URL, countryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateCountry = async (countryId, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${countryId}`, data);
    return response;
  } catch (error) {
    console.error('Error updating country:', error);
    throw error;
  }
};

export const deleteCountry = async (id, deletedById) => {
  try {
    
    // If no deletedById is provided, try to get it from auth context or localStorage
    if (!deletedById) {
      // Try to get the current user ID from localStorage or a user context
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
      deletedById = currentUser.userId || 1; // Fallback to 1 if no user ID found
    }
    
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      data: {
        deletedById: deletedById
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in deleteCountry:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error.response?.data || error;
  }
};