import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/vehicles";

// Helper function to get auth token and personId from localStorage
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log(
      "Raw user data from localStorage:",
      localStorage.getItem("user")
    );
    console.log("Parsed user object:", user);

    if (!user || !user.token) {
      console.warn(
        "User authentication data not found, proceeding without auth token"
      );
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

// Fetch all vehicles
export const fetchVehicles = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    let url = `${API_BASE_URL}?page=${page}&limit=${limit}`;
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

    // Prepare data with createdByID
    const apiData = {
      ...vehicleData,
      createdByID: personId,
      createdById: personId, // Include both to handle backend naming
    };

    console.log("Creating vehicle with data:", apiData);

    const response = await axios.post(API_BASE_URL, apiData, { headers });
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

// Update an existing vehicle
export const updateVehicle = async (id, vehicleData) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.put(`${API_BASE_URL}/${id}`, vehicleData, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a vehicle
export const deleteVehicle = async (id, personId = null) => {
  try {
    const { headers, personId: storedPersonId } = getAuthHeader();

    // Use provided personId or fallback to storedPersonId
    const deletedByID = personId || storedPersonId;
    console.log("deleteVehicle - Using deletedByID:", deletedByID);

    if (!deletedByID) {
      throw new Error(
        "personId is required for deletedByID. Check localStorage or pass personId explicitly."
      );
    }

    const requestBody = {
      deletedByID,
      deletedById: deletedByID, // Include both to handle backend naming
    };

    console.log("Sending DELETE request to:", `${API_BASE_URL}/${id}`);
    console.log("Request body:", requestBody);

    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
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
    const response = await axios.get(`${API_BASE_URL}/${id}`, { headers });
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
      "http://localhost:7000/api/companies/all",
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
    const response = await axios.get("http://localhost:7000/api/vehicletype", {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    try {
      const { headers } = getAuthHeader();
      const response = await axios.get(
        "http://localhost:7000/api/vehicletype/all",
        { headers }
      );
      return response.data;
    } catch (altError) {
      console.error("Error fetching from alternative endpoint:", altError);
      return { data: [] };
    }
  }
};
