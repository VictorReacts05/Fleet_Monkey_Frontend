import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Helper function to get auth token and personId from localStorage
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.token) {
      console.warn(
        "User authentication data not found, proceeding without auth token"
      );
      return { headers: {}, personId: null };
    }

    // Try different possible keys for personId
    const personId = user.personId || user.id || user.userId || null;

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

// Create a new vehicle
export const createVehicle = async (vehicleData) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      throw new Error("personId is required for createdByID");
    }

    const apiData = {
      TruckNumberPlate: vehicleData.truckNumberPlate,
      VIN: vehicleData.vin,
      CompanyID: Number(vehicleData.companyID),
      MaxWeight: Number(vehicleData.maxWeight) || null,
      Length: Number(vehicleData.length) || null,
      Width: Number(vehicleData.width) || null,
      Height: Number(vehicleData.height) || null,
      CreatedByID: Number(personId)
    };

    const response = await axios.post(`${APIBASEURL}/vehicles`, apiData, { headers });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error.response?.data || error.message;
  }
};

// Update an existing vehicle
export const updateVehicle = async (id, vehicleData) => {
  try {
    const { headers, personId } = getAuthHeader();
    
    if (!personId) {
      throw new Error("personId is required for CreatedByID");
    }

    const apiData = {
      VehicleID: Number(id),
      TruckNumberPlate: vehicleData.truckNumberPlate,
      VIN: vehicleData.vin,
      CompanyID: Number(vehicleData.companyID),
      MaxWeight: Number(vehicleData.maxWeight) || null,
      Length: Number(vehicleData.length) || null,
      Width: Number(vehicleData.width) || null,
      Height: Number(vehicleData.height) || null,
      CreatedByID: Number(personId)
    };
    
    if (vehicleData.RowVersionColumn) {
      apiData.RowVersionColumn = vehicleData.RowVersionColumn;
    }

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
};

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
