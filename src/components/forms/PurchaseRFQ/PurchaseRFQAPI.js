import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/purchase-rfq";

// Helper function to get personId from localStorage
const getPersonId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.personId) {
      console.log("Found personId in localStorage:", user.personId);
      return user.personId;
    }
    console.warn("No personId found in localStorage, using default");
    return 2037; // Fallback value
  } catch (error) {
    console.error("Error getting personId from localStorage:", error);
    return 2037; // Fallback value
  }
};

// Fetch all PurchaseRFQs
export const fetchPurchaseRFQs = async (page = 1, limit = 10, fromDate = null, toDate = null, searchTerm = "") => {
  try {
    // Build query parameters
    let params = new URLSearchParams();
    params.append('pageNumber', page);
    params.append('pageSize', limit);
    
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (searchTerm) params.append('search', searchTerm);
    
    const response = await axios.get(`${API_BASE_URL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching PurchaseRFQs:", error);
    throw error;
  }
};

// Get a specific PurchaseRFQ by ID
export const getPurchaseRFQById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching PurchaseRFQ with ID ${id}:`, error);
    throw error;
  }
};

// Create a new PurchaseRFQ
export const createPurchaseRFQ = async (purchaseRFQData) => {
  try {
    // Get personId from localStorage
    const personId = getPersonId();
    
    // Prepare data for API
    const payload = {
      SalesRFQID: parseInt(purchaseRFQData.SalesRFQID),
      CreatedByID: personId
    };

    console.log("Creating PurchaseRFQ with data:", payload);
    const response = await axios.post(API_BASE_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("PurchaseRFQ creation response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating PurchaseRFQ:", error);
    if (error.response && error.response.data) {
      console.error("Server response:", error.response.data);
    }
    throw error;
  }
};

// Update an existing PurchaseRFQ
export const updatePurchaseRFQ = async (id, purchaseRFQData) => {
  try {
    // Get personId from localStorage
    const personId = getPersonId();
    
    // Prepare data for API
    const payload = {
      SalesRFQID: parseInt(purchaseRFQData.SalesRFQID),
      CreatedByID: personId
    };

    console.log(`Updating PurchaseRFQ ${id} with data:`, payload);
    const response = await axios.put(`${API_BASE_URL}/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("PurchaseRFQ update response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating PurchaseRFQ with ID ${id}:`, error);
    if (error.response && error.response.data) {
      console.error("Server response:", error.response.data);
    }
    throw error;
  }
};

// Delete a PurchaseRFQ
export const deletePurchaseRFQ = async (id) => {
  try {
    // Get personId from localStorage
    const personId = getPersonId();
    
    console.log(`Deleting PurchaseRFQ with ID: ${id}`);
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      data: { PurchaseRFQID: parseInt(id), DeletedByID: personId },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("PurchaseRFQ deletion response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting PurchaseRFQ with ID ${id}:`, error);
    if (error.response && error.response.data) {
      console.error("Server response:", error.response.data);
    }
    throw error;
  }
};

// Fetch SalesRFQs for dropdown
export const fetchSalesRFQs = async () => {
  try {
    const response = await axios.get("http://localhost:7000/api/sales-rfq");
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching SalesRFQs for dropdown:", error);
    throw error;
  }
};