import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.token) {
      return { headers: {}, personId: null };
    }

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

export const fetchWarehouses = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    let url = `${APIBASEURL}/warehouses?pageNumber=${page}&pageSize=${limit}`;
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
      throw new Error(
        "User authentication required: personId is missing for createdByID"
      );
    }

    const apiData = {
      ...warehouseData,
      createdByID: personId,
      createdById: personId,
    };

    const response = await axios.post(`${APIBASEURL}/warehouses`, apiData, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating warehouse:", error);
    if (error.response) {
      const errorMessage =
        error.response.data.message ||
        error.response.data.error ||
        "Failed to create warehouse";
      throw new Error(errorMessage);
    }
    throw new Error(error.message || "An unexpected error occurred");
  }
};

export const updateWarehouse = async (warehouseId, data) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.put(
      `${APIBASEURL}/warehouses/${warehouseId}`,
      data,
      {
        headers,
      }
    );
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
    if (!deletedByID) {
      throw new Error(
        "personId is required for deletedByID. Check localStorage or pass personId explicitly."
      );
    }

    const requestBody = {
      deletedByID,
      deletedById: deletedByID,
    };

    const response = await axios.delete(`${APIBASEURL}/warehouses/${id}`, {
      headers,
      data: requestBody,
    });

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
    const response = await axios.get(`${APIBASEURL}/warehouses/${id}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
