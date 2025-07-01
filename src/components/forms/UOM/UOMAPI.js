import axios from "axios";
import APIBASEURL from "./../../../utils/apiBaseUrl"; // Helper function to get auth token and personId from localStorage
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const personId = user?.personId || user?.id || user?.userId || null;
    const token = user?.token || localStorage.getItem("token");
    if (!personId) {
      console.warn("No personId found in user object");
    }
    return {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          }
        : { "Content-Type": "application/json", Accept: "application/json" },
      personId,
    };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      personId: null,
    };
  }
};
export const fetchUOMs = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/uoms`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      throw new Error(error.response.data?.message || "Failed to fetch UOMs");
    }
    throw error;
  }
};
export const getUOMById = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/uoms/${id}`, { headers });
    if (
      response.data &&
      response.data.success &&
      response.data.data &&
      response.data.data.length > 0
    ) {
      return { data: response.data.data[0] };
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching UOM with ID ${id}:`, error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      throw new Error(error.response.data?.message || "Failed to fetch UOM");
    }
    throw error;
  }
};
export const createUOM = async (uomData) => {
  try {
    const { headers, personId } = getAuthHeader();
    if (!personId) {
      throw new Error("personId is required for CreatedByID");
    }
    const payload = {
      uom: String(uomData.UOM || uomData.uom || "").trim(),
      createdById: Number(personId),
    };
    if (!payload.uom) {
      throw new Error("UOM is required in the payload");
    }
    const response = await axios.post(`${APIBASEURL}/uoms`, payload, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating UOM:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      throw new Error(error.response.data?.message || "Failed to create UOM");
    }
    throw error;
  }
};
export const updateUOM = async (id, uomData) => {
  try {
    const { headers, personId } = getAuthHeader();
    if (!personId) {
      throw new Error("personId is required for CreatedByID");
    }
    const payload = {
      uom: String(uomData.UOM || uomData.uom || "").trim(),
      createdById: Number(personId),
    };
    if (!payload.uom) {
      throw new Error("UOM is required in the payload");
    }
    const response = await axios.put(`${APIBASEURL}/uoms/${id}`, payload, {
      headers,
    });
    console.log("Update response received:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating UOM with ID ${id}:`, error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      throw new Error(error.response.data?.message || "Failed to update UOM");
    }
    throw error;
  }
};
export const deleteUOM = async (id) => {
  try {
    const { headers, personId } = getAuthHeader();
    if (!personId) {
      throw new Error("personId is required for DeletedByID");
    }
    const payload = {
      uomID: Number(id),
      createdById: Number(personId),
    };
    const response = await axios.delete(`${APIBASEURL}/uoms/${id}`, {
      headers,
      data: payload,
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting UOM with ID ${id}:`, error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      throw new Error(error.response.data?.message || "Failed to delete UOM");
    }
    throw error;
  }
};
