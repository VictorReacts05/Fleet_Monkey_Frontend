import axios from 'axios';

const API_URL = 'http://localhost:7000/api/uoms';

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
    
    return response.data;
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
      createdById: 1015
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
      createdById: 1015
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

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    // Format the payload exactly as the API expects
    const payload = JSON.stringify({
      uomId: parseInt(id), // Ensure it's an integer
      deletedById: 1015,
      createdById: user.personId || user.id || 1
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