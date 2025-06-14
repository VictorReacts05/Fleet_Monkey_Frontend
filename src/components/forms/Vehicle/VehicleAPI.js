import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Helper function to get auth token and personId from localStorage
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token"); // Also check for separate token storage
    
    // Debug the user object
    console.log("User from localStorage:", user);
    console.log("Token from localStorage:", token);

    // Get token from user object or separate storage
    const authToken = user.token || token;
    
    // Try different possible keys for personId
    const personId = user.personId || user.id || user.userId || user.PersonId || user.ID || user.UserId;
    
    console.log("Extracted personId:", personId);
    console.log("Auth token available:", !!authToken);

    if (!personId) {
      console.warn(
        "No personId found in user object. Available keys:",
        Object.keys(user)
      );
    }

    return {
      headers: authToken ? {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json"
      } : { "Content-Type": "application/json" },
      personId,
    };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return { 
      headers: { "Content-Type": "application/json" }, 
      personId: null 
    };
  }
};

// Helper function to get personId with better error handling
const getPersonId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    // Try different possible keys for personId
    const personId = user.personId || user.id || user.userId || user.PersonId || user.ID || user.UserId;
    
    if (!personId) {
      console.error("PersonId not found. User object:", user);
      console.error("Available keys in user object:", Object.keys(user));
      
      // Show what's actually in localStorage for debugging
      console.error("Raw localStorage 'user':", localStorage.getItem("user"));
    }
    
    return personId;
  } catch (error) {
    console.error("Error getting personId:", error);
    return null;
  }
};

// Create a new vehicle
export const createVehicle = async (vehicleData) => {
  try {
    const { headers } = getAuthHeader();
    const personId = getPersonId();
    
    if (!personId) {
      throw new Error("User authentication required. PersonId not found in localStorage.");
    }

    // Format the payload according to the expected API format
    const payload = {
      // Use PascalCase for field names as expected by the backend
      TruckNumberPlate: vehicleData.truckNumberPlate,
      VIN: vehicleData.vin,
      companyId: Number(vehicleData.companyId),
      createdById: Number(personId),
      maxWeight: vehicleData.maxWeight,
      length: vehicleData.length,
      width: vehicleData.width,
      height: vehicleData.height,
      numberOfWheels: 10, // Default value
      numberOfAxels: 4,   // Default value
      
      // Also include camelCase versions for compatibility
      truckNumberPlate: vehicleData.truckNumberPlate,
      vin: vehicleData.vin,
      companyId: Number(vehicleData.companyId),
      vehicleTypeId: 2,
      createdById: Number(personId)
    };

    console.log("Creating vehicle with payload:", payload);
    const response = await axios.post(`${APIBASEURL}/vehicles`, payload, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating vehicle:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error.response?.data || error.message;
  }
};

export const updateVehicle = async (vehicleId, data) => {
  try {
    const { headers } = getAuthHeader();
    const personId = getPersonId();
    
    if (!personId) {
      throw new Error("User authentication required. PersonId not found in localStorage.");
    }

    // Format the payload according to the expected API format
    const payload = {
      // Use PascalCase for field names as expected by the backend
      TruckNumberPlate: data.truckNumberPlate,
      VIN: data.vin,
      CompanyID: Number(data.companyId),
      VehicleTypeID: 2, // Adding a default value since it's required
      CreatedByID: Number(personId),
      maxWeight: data.maxWeight,
      length: data.length,
      width: data.width,
      height: data.height,
      NumberOfWheels: 10, // Default value
      NumberOfAxels: 4,   // Default value
      
      // Also include camelCase versions for compatibility
      truckNumberPlate: data.truckNumberPlate,
      vin: data.vin,
      companyId: Number(data.companyId),
      vehicleTypeId: 2,
      createdById: Number(personId)
    };

    console.log("Updating vehicle with payload:", payload);
    const response = await axios.put(
      `${APIBASEURL}/vehicles/${vehicleId}`,
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error.response?.data || error.message;
  }
};

// Delete a vehicle
export const deleteVehicle = async (id, personId = null) => {
  try {
    const { headers } = getAuthHeader();
    
    // Use provided personId or get from localStorage
    const deletedByID = personId || getPersonId();

    if (!deletedByID) {
      // More specific error message with debugging info
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userKeys = Object.keys(user);
      
      throw new Error(
        `PersonId is required for deletion. ` +
        `Available user keys: [${userKeys.join(', ')}]. ` +
        `Please ensure you're logged in and user data is properly stored in localStorage.`
      );
    }

    const requestBody = {
      deletedById: Number(deletedByID), 
    };

    console.log("Sending DELETE request to:", `${APIBASEURL}/vehicles/${id}`);
    console.log("Request body:", requestBody);
    console.log("Using personId:", deletedByID);

    const response = await axios.delete(`${APIBASEURL}/vehicles/${id}`, {
      headers,
      data: requestBody,
    });

    console.log("Delete response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Request URL:", error.config.url);
      console.error("Request body sent:", error.config.data);
    } else if (error.request) {
      console.error("No response received, request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error.response?.data || error.message;
  }
};

// Get a vehicle by ID
export const getVehicleById = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/vehicles/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch companies for dropdown
export const fetchCompanies = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(
      `${APIBASEURL}/companies`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return { data: [] };
  }
};

// Fetch vehicle types for dropdown
export const fetchVehicleTypes = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/vehicletype`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    try {
      const { headers } = getAuthHeader();
      const response = await axios.get(
       `${APIBASEURL}/vehicletype`,
        { headers }
      );
      return response.data;
    } catch (altError) {
      console.error("Error fetching from alternative endpoint:", altError);
      return { data: [] };
    }
  }
};

// Fetch all vehicles
export const fetchVehicles = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    let url = `${APIBASEURL}/vehicles?page=${page}&limit=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const { headers } = getAuthHeader();
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Debug function to check localStorage contents
export const debugLocalStorage = () => {
  console.log("=== LocalStorage Debug ===");
  console.log("user:", localStorage.getItem("user"));
  console.log("token:", localStorage.getItem("token"));
  
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("Parsed user object:", user);
    console.log("User object keys:", Object.keys(user));
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
  }
  console.log("========================");
};