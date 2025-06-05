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

    let url = `${APIBASEURL}/supplier-quotation?page=${page}&pageSize=${pageSize}`;

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
    const response = await axios.get(`${APIBASEURL}/supplier-quotation/${id}`, {
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
      `${APIBASEURL}/supplier-quotation`,
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
      `${APIBASEURL}/supplier-quotation/${id}`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a Supplier Quotation Parcel
export const updateSupplierQuotationParcel = async (parcelId, data) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.put(
      `${APIBASEURL}/supplier-Quotation-Parcel/${parcelId}`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new Supplier Quotation Parcel
export const createSupplierQuotationParcel = async (data) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.post(
      `${APIBASEURL}/supplier-Quotation-Parcel`,
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
      `${APIBASEURL}/supplier-quotation/${id}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Approve a Supplier Quotation
export const approveSupplierQuotation = async (SupplierQuotationId) => {
  try {
    const { headers, personId } = getAuthHeader();
    console.log(
      `Approving Supplier Quotation with ID: ${SupplierQuotationId}, ApproverID: ${personId}`
    );

    if (!personId) {
      throw new Error("No personId found for approval");
    }

    const response = await axios.post(
      `${APIBASEURL}/supplier-Quotation/approve`,
      {
        SupplierQuotationID: Number(SupplierQuotationId),
        approverID: Number(personId),
      },
      { headers }
    );

    console.log("Approval response:", {
      status: response.status,
      data: response.data,
    });

    return {
      success: response.data.success || true,
      message: response.data.message || "Approval successful",
      data: response.data.data || {},
      SupplierQuotationId,
    };
  } catch (error) {
    console.error("Error approving Supplier Quotation:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error.response?.data || error;
  }
};

// Fetch Supplier Quotation approval status
export const fetchSupplierQuotationApprovalStatus = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(
      `${APIBASEURL}/supplier-quotation/approval-status/${id}`,
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

// Fetch user-specific approval status
export const fetchUserApprovalStatus = async (
  supplierQuotationId,
  approverId
) => {
  try {
    const { headers } = getAuthHeader();
    console.log("Fetching approval status with params:", {
      supplierQuotationId,
      approverId,
    });
    const response = await axios.get(
      `${APIBASEURL}/supplier-quotation-approvals/${supplierQuotationId}/${approverId}`,
      { headers }
    );

    console.log(
      "Full API response for SupplierQuotationID:",
      supplierQuotationId,
      "ApproverID:",
      approverId,
      { status: response.status, data: response.data }
    );

    let approval = null;
    if (response.data?.data) {
      approval = response.data.data;
    } else if (response.data && typeof response.data === "object") {
      approval = response.data;
    }

    console.log("Processed approval data:", approval);

    if (approval && approval.ApprovedYN === 1) {
      console.log("Approval found with ApprovedYN: 1, returning Approved");
      return "Approved";
    }
    console.log("No approval or ApprovedYN !== 1, returning Pending");
    return "Pending";
  } catch (error) {
    console.error("Error fetching user approval status:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return "Pending";
  }
};

// Fetch Supplier Quotation status
export const fetchSupplierQuotationStatus = async (supplierQuotationId) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(
      `${APIBASEURL}/supplier-quotation/${supplierQuotationId}`,
      { headers }
    );

    console.log(
      "Fetched Supplier Quotation status for ID:",
      supplierQuotationId,
      response.data
    );

    if (response.data && response.data.data) {
      const status = response.data.data.Status || response.data.data.status;
      if (status) {
        console.log("Parsed status:", status);
        return status;
      }
    } else if (
      response.data &&
      (response.data.Status || response.data.status)
    ) {
      const status = response.data.Status || response.data.status;
      console.log("Parsed status:", status);
      return status;
    }

    console.warn("Status field not found in response:", response.data);
    return "Pending";
  } catch (error) {
    console.error("Error fetching Supplier Quotation status:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return "Pending";
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

export const fetchCustomers = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/customers`);
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

// Export getAuthHeader
export { getAuthHeader };
