import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/sales-rfq";

// Helper function to get auth header and personId from localStorage
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      console.warn(
        "User authentication data not found, proceeding without auth token"
      );
      return { headers: {}, personId: null };
    }

    const personId = user.personId || user.id || user.userId || null;
    
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

// Fetch all SalesRFQs
export const fetchSalesRFQs = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    // Updated endpoint to match backend API structure
    let url = `${API_BASE_URL}?page=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const { headers } = getAuthHeader();
    // console.log("Fetching SalesRFQs from URL:", url);
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error("API Error details:", error.response?.data);
    throw error.response?.data || error.message;
  }
};

// Create a new SalesRFQ
export const createSalesRFQ = async (salesRFQData) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      throw new Error("personId is required for createdByID");
    }

    // Prepare data for API
    const apiData = {
      ...salesRFQData,
      createdByID: personId,
    };

    const response = await axios.post(API_BASE_URL, apiData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating SalesRFQ:", error);
    throw error.response?.data || error.message;
  }
};

// Update an existing SalesRFQ
export const updateSalesRFQ = async (id, salesRFQData) => {
  try {
    const { headers } = getAuthHeader();

    const response = await axios.put(`${API_BASE_URL}/${id}`, salesRFQData, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a SalesRFQ (soft delete)
/* export const deleteSalesRFQ = async (id) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      throw new Error("personId is required for deletedByID");
    }

    const deleteData = {
      deletedByID: personId,
      isDeleted: true
    };

    const response = await axios.delete(`${API_BASE_URL}/${id}/delete`, deleteData, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; */

export const deleteSalesRFQ = async (id) => {
  try {
    const { headers } = getAuthHeader();
    // Fix the URL - don't duplicate "sales-rfq" in the path
    const response = await axios.delete(`${API_BASE_URL}/${id}`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error deleting SalesRFQ:", error);
    throw error;
  }
};

// Get SalesRFQ by ID
export const getSalesRFQById = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${API_BASE_URL}/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch all companies for dropdown
export const fetchCompanies = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/companies/all", { headers });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch all customers for dropdown
export const fetchCustomers = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/customers/all", { headers });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch all suppliers for dropdown
export const fetchSuppliers = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/suppliers", { headers });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch all service types for dropdown
export const fetchServiceTypes = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/service-types", { headers });
    // console.log("Service types response:", response.data);
    
    // Log the actual structure of the first item to help debug
    if (response.data.data && response.data.data.length > 0) {
      // console.log("First service type item structure:", response.data.data[0]);
    }
    
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching service types:", error);
    return [];
  }
};

// Fetch all addresses for dropdown
export const fetchAddresses = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/addresses", { headers });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch all mailing priorities for dropdown
export const fetchMailingPriorities = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/mailing-priorities", { headers });
    // console.log("Mailing priorities response:", response.data);
    
    // Log the actual structure of the first item to help debug
    if (response.data.data && response.data.data.length > 0) {
      // console.log("First mailing priority item structure:", response.data.data[0]);
    }
    
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching mailing priorities:", error);
  }
};

// Fetch all currencies for dropdown
export const fetchCurrencies = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/currencies/all", { headers });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};