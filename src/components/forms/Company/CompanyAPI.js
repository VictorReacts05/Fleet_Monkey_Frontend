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
    return {
      headers: { Authorization: `Bearer ${user.token}` },
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
  toDate = null,
  searchTerm = ""
) => {
  try {
    let url = `${APIBASEURL}/companies?pageNumber=${page}&pageSize=${limit}&ts=${Date.now()}`;
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    const { headers } = getAuthHeader();
    const response = await axios.get(url, { headers });
    const data =
      response.data.data || response.data.companies || response.data || [];
    const totalRecords = response.data.totalRecords || data.length;
    return { data, totalRecords };
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error.response?.data || error.message;
  }
};

// Create a new company
export const createCompany = async (companyData) => {
  try {
    const { headers, personId } = getAuthHeader();
    const apiData = {
      companyName: companyData.companyName,
      billingCurrencyId: companyData.billingCurrencyId,
      vatAccount: companyData.vatAccount,
      website: companyData.website,
      companyNotes: companyData.companyNotes,
      createdById: personId || companyData.createdById || 1,
    };
    const response = await axios.post(`${APIBASEURL}/companies`, apiData, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error.response?.data || error.message;
  }
};

// Update an existing company
export const updateCompany = async (companyId, companyData) => {
  try {
    const { headers, personId } = getAuthHeader();
    const requestBody = {
      CompanyID: Number(companyId),
      companyName: companyData.companyName,
      billingCurrencyId: Number(companyData.billingCurrencyId),
      vatAccount: companyData.vatAccount,
      website: companyData.website,
      companyNotes: companyData.companyNotes,
      createdById: personId || companyData.createdById || 1,
    };
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
    throw error.response?.data || error.message;
  }
};

// Delete a company
export const deleteCompany = async (id, personId = null) => {
  try {
    const { headers, personId: storedPersonId } = getAuthHeader();
    const deletedByID = personId || storedPersonId;
    if (!deletedByID) {
      throw new Error("personId is required for deletedByID.");
    }
    const response = await axios.delete(`${APIBASEURL}/companies/${id}`, {
      headers,
      data: { deletedByID },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting company:", error);
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
      return Array.isArray(response.data.data) && response.data.data.length > 0
        ? response.data.data[0]
        : response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching company by ID:", error);
    throw error.response?.data || error.message;
  }
};

// Fetch all currencies for dropdown
export const fetchAllCurrencies = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/currencies`, { headers });
    return (
      response.data.data || response.data.currencies || response.data || []
    );
  } catch (error) {
    console.error("Error fetching currencies:", error);
    throw error.response?.data || error.message;
  }
};
