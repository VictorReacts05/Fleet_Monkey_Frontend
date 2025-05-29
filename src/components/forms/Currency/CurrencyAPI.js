import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Helper function to get auth token and personId from localStorage
const getAuthHeader = () => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      console.warn("User authentication data not found");
      return { headers: {}, personId: null };
    }

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

// Fetch all currencies
export const fetchCurrencies = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    // Change from /all to just the base endpoint with query parameters
    let url = `${APIBASEURL}/currencies?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const { headers } = getAuthHeader();
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching currencies:", error);
    throw error.response?.data || error.message;
  }
};

// Create a new currency
// Update the createCurrency function to use proper field casing
export const createCurrency = async (currencyData, personId = null) => {
  try {
    const url = `${APIBASEURL}/currencies`;
    const { headers, personId: storedPersonId } = getAuthHeader();

    // Use provided personId or fallback to storedPersonId from localStorage
    const createdById = personId || storedPersonId;
    if (!createdById) {
      console.warn("No personId provided for CreatedByID");
    }

    // Ensure we're using the correct field names with proper capitalization
    // to match what the backend expects
    const requestBody = {
      currencyName: currencyData.CurrencyName || currencyData.currencyName,
      createdById: currencyData.CreatedByID || createdById || 1,
    };

    console.log("[DEBUG] Currency create request data:", requestBody);

    const response = await axios.post(url, requestBody, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating currency:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      console.error("No response received, request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw (
      error.response?.data || error.message || "Unknown error creating currency"
    );
  }
};

// Update the updateCurrency function to use proper field casing
export const updateCurrency = async (id, currencyData) => {
  try {
    const { headers } = getAuthHeader();
    
    // Ensure we're using the correct field names with proper capitalization
    const requestBody = {
      currencyId: Number(id),
      currencyName: currencyData.CurrencyName || currencyData.currencyName,
      createdById: currencyData.CreatedByID || currencyData.createdById || 1,
    };
    
    if (currencyData.RowVersionColumn || currencyData.rowVersionColumn) {
      requestBody.RowVersionColumn = currencyData.RowVersionColumn || currencyData.rowVersionColumn;
    }
    
    console.log("[DEBUG] Currency update request data:", requestBody);
    
    const response = await axios.put(`${APIBASEURL}/currencies/${id}`, requestBody, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating currency:", error);
    throw error.response?.data || error.message;
  }
};

// Delete a currency
export const deleteCurrency = async (id, personId = null) => {
  try {
    const { headers, personId: storedPersonId } = getAuthHeader();

    // Use provided personId or fallback to storedPersonId from localStorage
    const deletedById = personId || storedPersonId;
    if (!deletedById) {
      throw new Error("personId is required for DeletedByID");
    }

    const response = await axios.delete(`${APIBASEURL}/currencies/${id}`, {
      headers,
      data: { DeletedByID: Number(deletedById) } // Fixed casing and ensure it's a number
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting currency:", error);
    throw error.response?.data || error.message;
  }
};

// Get a currency by ID
export const getCurrencyById = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/currencies/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
