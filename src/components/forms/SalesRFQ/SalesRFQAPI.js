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
  toDate = null,
  searchTerm = ""
) => {
  try {
    const { headers } = getAuthHeader();

    let params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    if (searchTerm) params.append("search", searchTerm);

    const response = await axios.get(`${API_BASE_URL}?${params.toString()}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching SalesRFQs:", error);
    throw error;
  }
};

// Create a new SalesRFQ with parcels
export const createSalesRFQ = async (salesRFQData) => {
  try {
    const { headers, personId } = getAuthHeader();

    const { parcels, ...salesRFQDetails } = salesRFQData;

    let validCompanyID = Number(salesRFQDetails.CompanyID);
    try {
      const companies = await fetchCompanies();
      console.log("Available companies:", companies);

      const companyExists = companies.some(
        (company) =>
          Number(company.CompanyID) === validCompanyID ||
          Number(company.companyID) === validCompanyID ||
          Number(company.id) === validCompanyID
      );

      if (!companyExists && companies.length > 0) {
        console.warn(
          `CompanyID ${validCompanyID} not found in available companies. Using first available company.`
        );
        validCompanyID = Number(
          companies[0].CompanyID || companies[0].companyID || companies[0].id
        );
      }
    } catch (error) {
      console.error("Error checking company validity:", error);
    }

    const apiData = {
      ...salesRFQDetails,
      CompanyID: validCompanyID,
      CustomerID: Number(salesRFQDetails.CustomerID),
      SupplierID: Number(salesRFQDetails.SupplierID),
      CreatedByID: undefined,
    };

    console.log("Creating SalesRFQ with data:", apiData);
    const response = await axios.post(API_BASE_URL, apiData, { headers });

    console.log("SalesRFQ creation response:", response.data);

    if (response.data.newSalesRFQId && parcels && parcels.length > 0) {
      try {
        const salesRFQId = response.data.newSalesRFQId;
        console.log("Submitting parcels for SalesRFQID:", salesRFQId);

        const formattedParcels = parcels.map((parcel, index) => ({
          SalesRFQID: salesRFQId,
          ItemID: Number(parcel.ItemID || parcel.itemId),
          UOMID: Number(parcel.UOMID || parcel.uomId),
          ItemQuantity: Number(
            parcel.ItemQuantity || parcel.Quantity || parcel.quantity
          ),
          LineItemNumber: index + 1,
          IsDeleted: 0,
        }));

        console.log("Formatted parcels for API:", formattedParcels);

        const parcelPromises = formattedParcels.map((parcel) =>
          axios.post("http://localhost:7000/api/sales-rfq-parcels", parcel, {
            headers,
          })
        );

        const parcelResults = await Promise.all(parcelPromises);
        console.log(
          "Parcels submission results:",
          parcelResults.map((r) => r.data)
        );
      } catch (parcelError) {
        console.error("Error submitting parcels:", parcelError);
        if (parcelError.response && parcelError.response.data) {
          console.error(
            "Server response for parcels:",
            parcelError.response.data
          );
        }
      }
    }

    return response.data;
  } catch (error) {
    console.error("Error creating SalesRFQ:", error);
    if (error.response && error.response.data) {
      console.error("Server response:", error.response.data);
    }
    throw error.response?.data || error;
  }
};

// Update an existing SalesRFQ with parcels
export const updateSalesRFQ = async (id, salesRFQData) => {
  try {
    const { headers, personId } = getAuthHeader();

    const { parcels, ...salesRFQDetails } = salesRFQData;

    const apiData = {
      ...salesRFQDetails,
      CompanyID: Number(salesRFQDetails.CompanyID),
      CustomerID: Number(salesRFQDetails.CustomerID),
      SupplierID: Number(salesRFQDetails.SupplierID),
      ...(personId ? { UpdatedByID: Number(personId) } : {}),
    };

    if (parcels && parcels.length > 0) {
      console.log("Parcels data before formatting for update:", parcels);

      apiData.SalesRFQParcels = parcels.map((parcel) => ({
        SalesRFQID: Number(id),
        ItemID: Number(parcel.itemId),
        UOMID: Number(parcel.uomId),
        Quantity: Number(parcel.quantity),
        CreatedByID: Number(personId || 1),
        UpdatedByID: Number(personId || 1),
      }));

      console.log(
        "Sending parcels data for SalesRFQParcel table update:",
        apiData.SalesRFQParcels
      );
    } else {
      console.warn("No parcels data found in the update request");
    }

    console.log("Updating SalesRFQ with ID:", id, "Data:", apiData);
    const response = await axios.put(`${API_BASE_URL}/${id}`, apiData, {
      headers,
    });

    console.log("SalesRFQ update response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error updating SalesRFQ:", error);
    if (error.response && error.response.data) {
      console.error("Server response:", error.response.data);
    }
    throw error.response?.data || error;
  }
};

// Delete a SalesRFQ (soft delete)
export const deleteSalesRFQ = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.delete(`${API_BASE_URL}/${id}`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error deleting SalesRFQ:", error);
    throw error;
  }
};

// Get SalesRFQ by ID with its parcels
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
    const response = await axios.get("http://localhost:7000/api/companies", {
      headers,
    });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch all customers for dropdown
export const fetchCustomers = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/customers", {
      headers,
    });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch all suppliers for dropdown
export const fetchSuppliers = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/suppliers", {
      headers,
    });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch all service types for dropdown
export const fetchServiceTypes = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(
      "http://localhost:7000/api/service-types",
      { headers }
    );
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
    const response = await axios.get("http://localhost:7000/api/addresses", {
      headers,
    });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch all mailing priorities for dropdown
export const fetchMailingPriorities = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(
      "http://localhost:7000/api/mailing-priorities",
      { headers }
    );
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching mailing priorities:", error);
  }
};

// Fetch all currencies for dropdown
export const fetchCurrencies = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/currencies", {
      headers,
    });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Approve or disapprove SalesRFQ
export const approveSalesRFQ = async (salesRFQId, isApproved) => {
  try {
    const { headers } = getAuthHeader();

    const approvalData = {
      SalesRFQID: salesRFQId,
      ApproverID: 2,
      ApprovedYN: isApproved ? 1 : 0,
      FormName: "Sales RFQ",
      RoleName: "Sales RFQ Approver",
      UserID: 2,
    };

    console.log("Approval data to be sent:", approvalData);

    const response = await axios.post(
      "http://localhost:7000/api/sales-rfq-approvals",
      approvalData,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error("Error approving SalesRFQ:", error);
    throw error;
  }
};

// Fetch approval status for a SalesRFQ
export const fetchSalesRFQApprovalStatus = async (salesRFQId) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(
      `http://localhost:7000/api/sales-rfq-approvals/${salesRFQId}`,
      { headers }
    );

    // Check if we have data and it contains approval information
    if (response.data && response.data.data && response.data.data.length > 0) {
      // Return the first approval record
      return response.data.data[0];
    } else {
      // No approval record found
      return null;
    }
  } catch (error) {
    console.error("Error fetching SalesRFQ approval status:", error);
    // If no approval record exists, return null instead of throwing an error
    if (error.response?.status === 404) {
      return null;
    }
    throw error.response?.data || error;
  }
};
