import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/supplier-Quotation";

// Helper function to get auth header from localStorage
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

// Fetch all Supplier Quotations
export const fetchSupplierQuotations = async (page = 1, pageSize = 10, fromDate = null, toDate = null) => {
  try {
    const { headers } = getAuthHeader();

    let url = `${API_BASE_URL}?page=${page}&pageSize=${pageSize}`;
    
    if (fromDate) {
      url += `&fromDate=${fromDate}`;
    }
    
    if (toDate) {
      url += `&toDate=${toDate}`;
    }

    const response = await axios.get(url, { headers });
    console.log("Raw API response for Supplier Quotations:", response.data);
    
    if (response.data && response.data.data) {
      // Make sure each item has a Status field
      const processedData = response.data.data.map(item => ({
        ...item,
        // Ensure Status is capitalized correctly if it exists in the API response
        Status: item.Status || item.status || "Pending"
      }));
      
      return {
        data: processedData,
        totalRecords: response.data.totalRecords || processedData.length
      };
    }
    
    return { data: [], totalRecords: 0 };
  } catch (error) {
    console.error("Error fetching Supplier Quotations:", error);
    throw error;
  }
};

// Get Supplier Quotation by ID
export const getSupplierQuotationById = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${API_BASE_URL}/${id}`, { headers });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching Supplier Quotation with ID ${id}:`, error);
    throw error;
  }
};

// Create a new Supplier Quotation
export const createSupplierQuotation = async (data) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.post(API_BASE_URL, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating Supplier Quotation:", error);
    throw error;
  }
};

// Update an existing Supplier Quotation
export const updateSupplierQuotation = async (id, data) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.put(`${API_BASE_URL}/${id}`, data, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error updating Supplier Quotation with ID ${id}:`, error);
    throw error;
  }
};

// Delete a Supplier Quotation
export const deleteSupplierQuotation = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.delete(`${API_BASE_URL}/${id}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error deleting Supplier Quotation with ID ${id}:`, error);
    throw error;
  }
};

// Fetch suppliers for dropdown
export const fetchSuppliers = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/suppliers", { headers });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
};

// Fetch purchase RFQs for dropdown
export const fetchPurchaseRFQs = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/purchase-rfq", { headers });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching purchase RFQs:", error);
    throw error;
  }
};

// Approve a Supplier Quotation
export const approveSupplierQuotation = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.post(`${API_BASE_URL}/approve`, { supplierQuotationID: id }, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error approving Supplier Quotation with ID ${id}:`, error);
    throw error;
  }
};

// Fetch Supplier Quotation approval status
export const fetchSupplierQuotationApprovalStatus = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${API_BASE_URL}/approval-status/${id}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching approval status for Supplier Quotation with ID ${id}:`, error);
    throw error;
  }
};