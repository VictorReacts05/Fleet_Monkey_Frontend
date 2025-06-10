import axios from 'axios';
import APIBASEURL from '../../../utils/apiBaseUrl';

const API_URL = `${APIBASEURL}/uoms`;

export const fetchUOMs = async () => {
  try {
    const response = await axios.get(API_URL);
    // Make sure we're returning the data array
    return response.data;
  } catch (error) {
    console.error('Error fetching UOMs:', error);
    throw error;
  }
};

export const getUOMById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    
    // Extract the UOM data from the response
    // The API returns {success: true, message: '...', data: Array(1)}
    // We need to return the first item in the data array
    if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
      return { data: response.data.data[0] };
    }
    
    return response;
  } catch (error) {
    console.error(`Error fetching UOM with ID ${id}:`, error);
    throw error;
  }
};

export const createUOM = async (uomData) => {
  try {
    // Log the data being sent to help diagnose issues
    console.log("Creating UOM with data:", uomData);
    console.log("UOM value:", uomData.UOM);
    console.log("UOM value type:", typeof uomData.UOM);

    // Fix: Use UOM (uppercase) instead of uom (lowercase)
    const payload = JSON.stringify({
      uom: uomData.UOM.trim(),
      createdByID: 1015
    });

    console.log("Sending stringified JSON:", payload);
    console.log("Content-Type:", "application/json");

    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Create response received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating UOM:", error);
    // Log more detailed error information if available
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    throw error;
  }
};

export const updateUOM = async (id, uomData) => {
  try {
    // Log the data being sent to help diagnose issues
    console.log(`Updating UOM ${id} with data:`, uomData);
    console.log("UOM value for update:", uomData.UOM);
    console.log("UOM value type:", typeof uomData.UOM);

    // Use the correct case for UOM property (uppercase)
    const payload = JSON.stringify({
      uom: uomData.UOM.trim(),
      createdByID: 1015
    });

    console.log("Sending JSON payload for update:", payload);
    console.log("Update URL:", `${API_URL}/${id}`);
    console.log("Content-Type:", "application/json");

    const response = await axios.put(`${API_URL}/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Update response received:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating UOM with ID ${id}:`, error);
    // Log more detailed error information if available
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    throw error;
  }
};

export const deleteUOM = async (id) => {
  try {
    // Add more detailed logging
    console.log(`Attempting to delete UOM with ID: ${id}`);
    console.log("ID type:", typeof id);
    
    // Format the payload exactly as the API expects
    const payload = JSON.stringify({
      uomID: parseInt(id), // Ensure it's an integer
      deletedByID: 1015
    });
    
    
    // Send the stringified JSON payload
    const response = await axios.delete(`${API_URL}/${id}`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error deleting UOM with ID ${id}:`, error);
    // Add more detailed error logging
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    throw error;
  }
};