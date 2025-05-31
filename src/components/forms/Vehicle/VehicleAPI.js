import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Helper function to get auth token and personId from localStorage
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    // Debug the user object
    console.log("User from localStorage:", user);

    if (!user || !user.token) {
      console.warn("User authentication data not found, proceeding without auth token");
      return { headers: {}, personId: null };
    }

    // Try different possible keys for personId
    const personId = user.personId || user.id || user.userId || null;
    
    console.log("Extracted personId:", personId);

    if (!personId) {
      console.warn(
        "No personId found in user object. Available keys:",
        Object.keys(user)
      );
    }

    return {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      personId,
    };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return { headers: {}, personId: null };
  }
};

// Create a new vehicle
export const createVehicle = async (vehicleData) => {
  try {
    // Get user info directly from localStorage as a fallback
    const { headers, personId } = getAuthHeader();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = personId || user?.personId || user?.id || user?.userId || vehicleData.createdById;
    
    if (!userId) {
      throw new Error("personId is required for createdByID");
    }

    // Format the payload according to the expected API format
    const payload = {
      // Use PascalCase for field names as expected by the backend
      TruckNumberPlate: vehicleData.truckNumberPlate,
      VIN: vehicleData.vin,
      CompanyID: Number(vehicleData.companyId),
      VehicleTypeID: 2, // Adding a default value since it's required
      CreatedByID: Number(userId),
      MaxWeight: vehicleData.maxWeight,
      Length: vehicleData.length,
      Width: vehicleData.width,
      Height: vehicleData.height,
      NumberOfWheels: 10, // Default value
      NumberOfAxels: 4,   // Default value
      
      // Also include camelCase versions for compatibility
      truckNumberPlate: vehicleData.truckNumberPlate,
      vin: vehicleData.vin,
      companyId: Number(vehicleData.companyId),
      vehicleTypeId: 2,
      createdById: Number(userId)
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
    // Get user info directly from localStorage as a fallback
    const { headers, personId } = getAuthHeader();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = personId || user?.personId || user?.id || user?.userId || data.createdById;
    
    if (!userId) {
      throw new Error("personId is required for createdByID");
    }

    // Format the payload according to the expected API format
    const payload = {
      // Use PascalCase for field names as expected by the backend
      TruckNumberPlate: data.truckNumberPlate,
      VIN: data.vin,
      CompanyID: Number(data.companyId),
      VehicleTypeID: 2, // Adding a default value since it's required
      CreatedByID: Number(userId),
      MaxWeight: data.maxWeight,
      Length: data.length,
      Width: data.width,
      Height: data.height,
      NumberOfWheels: 10, // Default value
      NumberOfAxels: 4,   // Default value
      
      // Also include camelCase versions for compatibility
      truckNumberPlate: data.truckNumberPlate,
      vin: data.vin,
      companyId: Number(data.companyId),
      vehicleTypeId: 2,
      createdById: Number(userId)
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

// Update an existing vehicle
/* export const updateVehicle = async (id, vehicleData) => {
  try {
    const { headers, personId } = getAuthHeader();
    
    if (!personId) {
      throw new Error("personId is required for createdByID");
    }

    const apiData = {
      ...vehicleData,
      createdById: Number(personId)  // Ensure createdById is included
    };

    const response = await axios.put(`${APIBASEURL}/vehicles/${id}`, apiData, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error.response?.data || error.message;
  }
}; */

// Delete a vehicle
export const deleteVehicle = async (id, personId = null) => {
  try {
    const { headers, personId: storedPersonId } = getAuthHeader();

    const deletedByID = personId || storedPersonId;

    if (!deletedByID) {
      throw new Error(
        "personId is required for deletedByID. Check localStorage or pass personId explicitly."
      );
    }

    const requestBody = {
      deletedByID,
      deletedById: deletedByID, 
    };

    console.log("Sending DELETE request to:", `${APIBASEURL}/vehicles/${id}`);
    console.log("Request body:", requestBody);

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
