import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/warehouses";

const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Raw user data from localStorage:", localStorage.getItem("user"));
    console.log("Parsed user object:", user);

    if (!user || !user.token) {
      console.warn("User authentication data not found, proceeding without auth token");
      return { headers: {}, personId: null };
    }

    const personId = user.personId || user.id || user.userId || null;
    console.log("Extracted personId:", personId);

    if (!personId) {
      console.warn("No personId found in user object. Available keys:", Object.keys(user));
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

export const fetchWarehouses = async (
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
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createWarehouse = async (warehouseData) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      throw new Error("User authentication required: personId is missing for createdByID");
    }

    const apiData = {
      ...warehouseData,
      createdByID: personId,
      createdById: personId,
    };

    console.log("Creating warehouse with data:", apiData);

    const response = await axios.post(API_BASE_URL, apiData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating warehouse:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      const errorMessage = error.response.data.message || error.response.data.error || 'Failed to create warehouse';
      throw new Error(errorMessage);
    }
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

export const updateWarehouse = async (warehouseId, data) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.put(`${API_BASE_URL}/${warehouseId}`, data, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating warehouse:", error);
    throw error.response?.data || error.message;
  }
};

export const deleteWarehouse = async (id, personId = null) => {
  try {
    const { headers, personId: storedPersonId } = getAuthHeader();

    const deletedByID = personId || storedPersonId;
    console.log("deleteWarehouse - Using deletedByID:", deletedByID);

    if (!deletedByID) {
      throw new Error(
        "personId is required for deletedByID. Check localStorage or pass personId explicitly."
      );
    }

    const requestBody = {
      deletedByID,
      deletedById: deletedByID,
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
    console.error("Error deleting warehouse:", error);
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

export const getWarehouseById = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${API_BASE_URL}/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};