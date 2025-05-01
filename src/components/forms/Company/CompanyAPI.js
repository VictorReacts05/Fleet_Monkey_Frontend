import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/companies";

// Helper function to get auth token and personId from localStorage
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    /* console.log(
      "Raw user data from localStorage:",
      localStorage.getItem("user")
    );
    console.log("Parsed user object:", user); */

    if (!user || !user.token) {
      console.warn(
        "User authentication data not found, proceeding without auth token"
      );
      return { headers: {}, personId: null };
    }

    // Try different possible keys for personId
    const personId = user.personId || user.id || user.userId || null;
    // console.log("Extracted personId:", personId);

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

// Create a new company
export const createCompany = async (companyData) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      throw new Error("personId is required for createdByID");
    }

    // Prepare data for API
    const apiData = {
      companyName: companyData.CompanyName,
      billingCurrencyID: companyData.BillingCurrencyID,
      vatAccount: companyData.VAT_Account,
      website: companyData.Website,
      companyNotes: companyData.CompanyNotes,
      createdByID: personId,
    };

    const response = await axios.post(API_BASE_URL, apiData, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update an existing company
export const updateCompany = async (id, companyData) => {
  try {
    const { headers } = getAuthHeader();

    // Prepare data for API
    const apiData = {
      companyName: companyData.CompanyName,
      billingCurrencyID: companyData.BillingCurrencyID,
      vatAccount: companyData.VAT_Account,
      website: companyData.Website,
      companyNotes: companyData.CompanyNotes,
      rowVersionColumn: companyData.RowVersionColumn,
    };

    const response = await axios.put(`${API_BASE_URL}/${id}`, apiData, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a company
export const deleteCompany = async (id, personId = null) => {
  try {
    const { headers, personId: storedPersonId } = getAuthHeader();

    // Use provided personId or fallback to storedPersonId
    const deletedByID = personId || storedPersonId;
    // console.log("deleteCompany - Using deletedByID:", deletedByID);

    if (!deletedByID) {
      throw new Error(
        "personId is required for deletedByID. Check localStorage or pass personId explicitly."
      );
    }

    /* console.log("Sending DELETE request to:", `${API_BASE_URL}/${id}`);
    console.log("Request body:", { deletedByID });
    console.log("Full request config:", {
      url: `${API_BASE_URL}/${id}`,
      method: "DELETE",
      headers,
      data: { deletedByID },
    }); */

    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers,
      data: { deletedByID },
    });

    // console.log("Delete response:", response.data);
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
    const response = await axios.get(`${API_BASE_URL}/${id}`, { headers });

    // Check if the response has data
    if (response.data && response.data.data) {
      // Handle both array and object responses
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
    console.error("Get company error:", error);
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
    const response = await axios.get(
      "http://localhost:7000/api/currencies/all",
      { headers }
    );

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
