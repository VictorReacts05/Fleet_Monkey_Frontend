import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

const API_URL = `${APIBASEURL}/uoms`;

// Helper function to get user data safely
const getUserData = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.warn("No user data in localStorage, using default personId: 1");
      return { personId: 1 };
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return { personId: 1 };
  }
};

export const fetchUOMs = async (
  pageNumber = 1,
  pageSize = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    console.log(
      `Fetching UOMs with pageNumber: ${pageNumber}, pageSize: ${pageSize}, fromDate: ${fromDate}, toDate: ${toDate}`
    );
    const params = {
      pageNumber,
      pageSize,
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    };
    const response = await axios.get(API_URL, { params });
    console.log("Fetch UOMs raw response:", response.data);
    console.log("Fetch UOMs processed response:", {
      data: response.data.data,
      totalRecords: response.data.totalRecords,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const getUOMById = async (id) => {
  try {
    console.log(`Fetching UOM with ID: ${id}`);
    const response = await axios.get(`${API_URL}/${id}`);
    console.log("Get UOM response:", response.data);

    // Simplify response handling
    const data =
      response.data.data && response.data.data.length > 0
        ? response.data.data[0]
        : response.data;
    return data;
  } catch (error) {
    console.error(`Error fetching UOM with ID ${id}:`, error);
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const createUOM = async (uomData) => {
  try {
    console.log("Creating UOM with data:", uomData);
    console.log("UOM value:", uomData.UOM);
    console.log("UOM value type:", typeof uomData.UOM);

    const user = getUserData();
    const personId = user.personId || 1;

    const payload = {
      uom: uomData.UOM.trim(),
      createdById: personId,
    };

    console.log("Sending payload:", payload);

    const response = await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Create response received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating UOM:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const updateUOM = async (id, uomData) => {
  try {
    console.log(`Updating UOM ${id} with data:`, uomData);
    console.log("UOM value for update:", uomData.UOM);
    console.log("UOM value type:", typeof uomData.UOM);

    const user = getUserData();
    const personId = user.personId || 1;

    const payload = {
      uom: uomData.UOM.trim(),
      createdById: personId,
    };

    console.log("Sending payload for update:", payload);
    console.log("Update URL:", `${API_URL}/${id}`);

    const response = await axios.put(`${API_URL}/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Update response received:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating UOM with ID ${id}:`, error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const deleteUOM = async (id) => {
  try {
    console.log(`Attempting to delete UOM with ID: ${id}`);
    console.log("ID type:", typeof id);

    const user = getUserData();
    const personId = user.personId || 1;

    const payload = {
      uomID: parseInt(id),
      createdById: personId,
    };

    console.log("Sending delete payload:", payload);

    const response = await axios.delete(`${API_URL}/${id}`, {
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Delete response received:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting UOM with ID ${id}:`, error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    throw error.response?.data || { message: error.message, success: false };
  }
};
