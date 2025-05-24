import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Helper function to get auth token and personId from localStorage
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

// Fetch all companies
export const fetchCompanies = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    // Change from /all to just the base endpoint with query parameters
    let url = `${APIBASEURL}/companies?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const { headers } = getAuthHeader();
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a new company
export const createCompany = async (companyData) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      console.warn("No personId found in localStorage, using default value 1");
    }

    const apiData = {
      CompanyName: companyData.CompanyName,
      BillingCurrencyID: companyData.BillingCurrencyID,
      VAT_Account: companyData.VAT_Account,
      Website: companyData.Website,
      CompanyNotes: companyData.CompanyNotes,
      CreatedByID: personId || companyData.CreatedByID || 1,
    };

    const response = await axios.post(`${APIBASEURL}/companies`, apiData, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating company:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error.response?.data || error.message;
  }
};

// Update an existing company
export const updateCompany = async (companyId, companyData) => {
  try {
    const { headers, personId } = getAuthHeader();

    const requestBody = {
      CompanyID: Number(companyId),
      CompanyName: companyData.CompanyName,
      BillingCurrencyID: Number(companyData.BillingCurrencyID),
      VAT_Account: companyData.VAT_Account,
      Website: companyData.Website,
      CompanyNotes: companyData.CompanyNotes,
      CreatedByID: personId || companyData.CreatedByID || 1,
    };

    // Add RowVersionColumn if it exists
    if (companyData.RowVersionColumn) {
      requestBody.RowVersionColumn = companyData.RowVersionColumn;
    }

    const response = await axios.put(
      `${APIBASEURL}/companies/${companyId}`,
      requestBody,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating company:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error.response?.data || error.message;
  }
};

// Delete a company
export const deleteCompany = async (id, personId = null) => {
  try {
    const { headers, personId: storedPersonId } = getAuthHeader();

    const deletedByID = personId || storedPersonId;

    if (!deletedByID) {
      throw new Error(
        "personId is required for deletedByID. Check localStorage or pass personId explicitly."
      );
    }

    const response = await axios.delete(`${APIBASEURL}/companies/${id}`, {
      headers,
      data: { deletedByID },
    });

    return response.data;
  } catch (error) {
    console.error("Error deleting company:", error);
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

// Get a company by ID
export const getCompanyById = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/companies/${id}`, {
      headers,
    });

    if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        if (response.data.data.length > 0) {
          return response.data.data[0];
        } else {
          throw new Error("Company not found");
        }
      } else {
        return response.data.data;
      }
    } else if (response.data && response.data.result !== undefined) {
      // Some APIs return result code instead
      if (response.data.result === 0) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to retrieve company");
      }
    } else {
      // Direct response
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      console.error("API response error details:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
      });
    }
    throw error;
  }
};

// Fetch all currencies for dropdown
export const fetchAllCurrencies = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/currencies`, { headers });

    // Check the structure of the response and extract the currency data
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      // Try to find currencies in a different format
      const possibleData =
        response.data.currencies || response.data.result?.data || [];
      return possibleData;
    }
  } catch (error) {
    console.error("Error fetching currencies:", error);
    throw error.response?.data || error.message;
  }
};
