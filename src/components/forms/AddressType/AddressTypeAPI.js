import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/address-types";

// Helper function to get auth token and personId from localStorage
const getAuthHeader = () => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      console.warn("User authentication data not found");
      return { headers: {}, personId: null };
    }

    // Get personId directly from user object since it's not nested
    const personId = user.personId || null;

    if (!personId) {
      console.warn("No personId found in user object");
      return { headers: {}, personId: null };
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      personId,
    };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return { headers: {}, personId: null };
  }
};

// Fetch all address types
export const fetchAddressTypes = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    let url = `${API_BASE_URL}?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const { headers } = getAuthHeader();
    const response = await axios.get(url, { headers });
    // console.log(response.headers)
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a new address type
export const createAddressType = async (addressTypeData) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      throw new Error("personId is required for createdByID");
    }

    // Prepare data with proper field names to match backend expectations
    const apiData = {
      AddressType: addressTypeData.addressType || addressTypeData.AddressType,
      CreatedByID: Number(personId)
    };

    console.log("Creating address type with formatted data:", apiData);

    const response = await axios.post(API_BASE_URL, apiData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating address type:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error.response?.data || error.message;
  }
};

// Update an existing address type
export const updateAddressType = async (id, addressTypeData) => {
  try {
    const { headers, personId } = getAuthHeader();
    
    if (!personId) {
      throw new Error("personId is required for ModifiedByID");
    }
    
    // Prepare data with proper field names to match backend expectations
    const apiData = {
      AddressTypeID: Number(id),
      AddressType: addressTypeData.addressType || addressTypeData.AddressType,
      CreatedByID: Number(personId) // Changed from CreatedByID to ModifiedByID for updates
    };
    
    // Include RowVersionColumn if available
    if (addressTypeData.RowVersionColumn) {
      apiData.RowVersionColumn = addressTypeData.RowVersionColumn;
    }
    
    console.log("Updating address type with formatted data:", apiData);
    
    const response = await axios.put(`${API_BASE_URL}/${id}`, apiData, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating address type:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Request URL:", error.config.url);
    } else if (error.request) {
      console.error("No response received, request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error.response?.data || error.message;
  }
};

// Delete an address type
export const deleteAddressType = async (id) => {
  try {
    const { headers, personId } = getAuthHeader();
    
    if (!personId) {
      throw new Error('personId is required for deletedByID');
    }
    
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers,
      data: { DeletedByID: Number(personId) }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting address type:', error);
    throw error.response?.data || error.message;
  }
};

// Get an address type by ID
export const getAddressTypeById = async (id) => {
  try {
    const { headers } = getAuthHeader();
    // console.log(Fetching address type with ID: ${id});
    
    const response = await axios.get(`${API_BASE_URL}/${id}`, { headers });
    console.log("Address type data response:", response.data);
    
    // Handle different response structures
    let addressTypeData = null;
    
    if (response.data.data) {
      // If data is in response.data.data
      addressTypeData = Array.isArray(response.data.data) 
        ? response.data.data[0] 
        : response.data.data;
    } else if (response.data.AddressTypeID) {
      // If direct object
      addressTypeData = response.data;
    }
    
    if (!addressTypeData) {
      console.warn('Address type data not found in response:', response.data);
      // Return the raw response data as fallback
      return response.data;
    }
    
    console.log('Processed address type data:', addressTypeData);
    return addressTypeData;
  } catch (error) {
    console.error("Error fetching address type:", error);
    throw error.response?.data || error.message;
  }
};