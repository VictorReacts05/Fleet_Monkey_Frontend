import axios from "axios";
import { store } from "../../../redux/store";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Memoized auth header to avoid redundant localStorage parsing
const getAuthHeader = (() => {
  let cachedHeaders = null;
  let cachedPersonId = null;

  return () => {
    if (cachedHeaders && cachedPersonId) {
      return { headers: cachedHeaders, personId: cachedPersonId };
    }

    try {
      const userString = localStorage.getItem("user");
      const user = JSON.parse(userString);
      const state = store.getState();
      const token = state.loginReducer?.loginDetails?.token;

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const personId = user?.personId || user?.id || user?.userId || null;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      cachedHeaders = headers;
      cachedPersonId = personId;

      return { headers, personId };
    } catch (error) {
      throw error;
    }
  };
})();

// Fetch all Supplier Quotations
export const fetchSupplierQuotations = async (
  page = 1,
  pageSize = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    const { headers } = getAuthHeader();

    let url = `${APIBASEURL}/supplier-Quotation?page=${page}&pageSize=${pageSize}`;

    if (fromDate) {
      url += `&fromDate=${fromDate}`;
    }

    if (toDate) {
      url += `&toDate=${toDate}`;
    }

    const response = await axios.get(url, { headers });

    if (response.data && response.data.data) {
      const processedData = response.data.data.map((item) => ({
        ...item,
        Status: item.Status || item.status || "Pending",
      }));

      return {
        data: processedData,
        totalRecords: response.data.totalRecords || processedData.length,
      };
    }

    return { data: [], totalRecords: 0 };
  } catch (error) {
    throw error;
  }
};

// Get Supplier Quotation by ID
export const getSupplierQuotationById = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/supplier-Quotation/${id}`, {
      headers,
    });
    return response;
  } catch (error) {
    if (error.message === "Authentication token not found") {
      throw new Error("Please log in to view supplier quotations");
    }

    if (error.response?.status === 404 && error.response?.data?.data) {
      return {
        data: error.response.data,
        status: 200,
      };
    }

    if (error.response?.status === 404) {
      throw new Error(`Supplier Quotation with ID ${id} not found`);
    }

    throw error;
  }
};

// Create a new Supplier Quotation
export const createSupplierQuotation = async (data) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.post(
      `${APIBASEURL}/supplier-Quotation`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an existing Supplier Quotation
export const updateSupplierQuotation = async (id, data) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.put(
      `${APIBASEURL}/supplier-Quotation/${id}`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a Supplier Quotation
export const deleteSupplierQuotation = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.delete(
      `${APIBASEURL}/supplier-Quotation/${id}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch suppliers for dropdown
export const fetchSuppliers = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/suppliers`, { headers });

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    throw error;
  }
};

// Fetch purchase RFQs for dropdown
export const fetchPurchaseRFQs = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/purchase-rfq`, { headers });

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    throw error;
  }
};

// Approve a Supplier Quotation
export const approveSupplierQuotation = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.post(
      `${APIBASEURL}/supplier-Quotation/approve`,
      { supplierQuotationID: id },
      { headers }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch Supplier Quotation approval status
export const fetchSupplierQuotationApprovalStatus = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(
      `${APIBASEURL}/supplier-Quotation/approval-status/${id}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { status: "Pending", message: "No approval record found" };
    }
    throw error;
  }
};

export const fetchCurrencies = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/currencies`);
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

export const fetchServiceTypes = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/service-types`);
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

export const fetchAddresses = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/addresses`);
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

// Export getAuthHeader
export { getAuthHeader };