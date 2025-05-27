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
    // Remove this:
    // const { headers, personId } = getAuthHeader();
    // if (!personId) {
    //   throw new Error(
    //     "User authentication required: personId is missing for createdByID"
    //   );
    // }

    // Instead, just get headers (if needed) and use warehouseData as is:
    const { headers } = getAuthHeader ? getAuthHeader() : { headers: {} };

    // Make sure warehouseData.createdById is present
    if (!warehouseData.createdById) {
      throw new Error("createdById is required in the payload");
    }

    const response = await axios.post(`${APIBASEURL}/warehouses`, warehouseData, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating warehouse:", error);
    throw error.response?.data || error.message;
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

    const createdById = personId || storedPersonId;
    if (!createdById) {
      throw new Error(
        "personId is required for createdById. Check localStorage or pass personId explicitly."
      );
    }

    const response = await axios.delete(`${APIBASEURL}/warehouses/${id}`, {
      headers,
      data: { createdById }  // Send in request body
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
