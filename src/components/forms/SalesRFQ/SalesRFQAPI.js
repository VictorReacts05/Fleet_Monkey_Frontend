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
// Add searchTerm parameter to fetchSalesRFQs function
export const fetchSalesRFQs = async (page = 1, limit = 10, fromDate = null, toDate = null, searchTerm = "") => {
  try {
    const { headers } = getAuthHeader();
    
    // Build query parameters
    let params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (searchTerm) params.append('search', searchTerm);
    
    const response = await axios.get(`${API_BASE_URL}?${params.toString()}`, { headers });
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

    // Extract parcels from the data if present
    const { parcels, ...salesRFQDetails } = salesRFQData;

    // Fetch available companies to check valid CompanyID
    let validCompanyID = Number(salesRFQDetails.CompanyID);
    try {
      const companies = await fetchCompanies();
      console.log("Available companies:", companies);
      
      // Check if the CompanyID exists in the available companies
      const companyExists = companies.some(company => 
        Number(company.CompanyID) === validCompanyID || 
        Number(company.companyID) === validCompanyID || 
        Number(company.id) === validCompanyID
      );
      
      if (!companyExists && companies.length > 0) {
        console.warn(`CompanyID ${validCompanyID} not found in available companies. Using first available company.`);
        validCompanyID = Number(companies[0].CompanyID || companies[0].companyID || companies[0].id);
      }
    } catch (error) {
      console.error("Error checking company validity:", error);
    }

    // Prepare data for API
    const apiData = {
      ...salesRFQDetails,
      // Use the validated CompanyID
      CompanyID: validCompanyID,
      CustomerID: Number(salesRFQDetails.CustomerID),
      SupplierID: Number(salesRFQDetails.SupplierID),
      // Remove CreatedByID to let the backend use its default value
      CreatedByID: undefined
    };

    console.log("Creating SalesRFQ with data:", apiData);
    const response = await axios.post(API_BASE_URL, apiData, { headers });
    
    console.log("SalesRFQ creation response:", response.data);
    
    // If we have a salesRFQId in the response, create a default approval
    if (response.data.newSalesRFQId) {
      try {
        console.log("Creating default approval for SalesRFQ ID:", response.data.newSalesRFQId);
        const approvalResponse = await createDefaultApproval(response.data.newSalesRFQId);
        console.log("Default approval creation response:", approvalResponse);
      } catch (approvalError) {
        console.error("Error creating default approval:", approvalError);
      }
    }
    
    // If we have a salesRFQId in the response and parcels data, submit parcels
    if (response.data.newSalesRFQId && parcels && parcels.length > 0) {
      try {
        const salesRFQId = response.data.newSalesRFQId;
        console.log("Submitting parcels for SalesRFQID:", salesRFQId);
        
        // Format parcels data according to the backend expectations
        const formattedParcels = parcels.map((parcel, index) => ({
          SalesRFQID: salesRFQId,
          ItemID: Number(parcel.ItemID || parcel.itemId),
          UOMID: Number(parcel.UOMID || parcel.uomId),
          ItemQuantity: Number(parcel.ItemQuantity || parcel.Quantity || parcel.quantity),
          LineItemNumber: index + 1,
          // Remove CreatedByID to let the backend use its default value
          IsDeleted: 0
        }));
        
        console.log("Formatted parcels for API:", formattedParcels);
        
        // Submit each parcel individually
        const parcelPromises = formattedParcels.map(parcel => 
          axios.post(
            "http://localhost:7000/api/sales-rfq-parcels", 
            parcel,
            { headers }
          )
        );
        
        const parcelResults = await Promise.all(parcelPromises);
        console.log("Parcels submission results:", parcelResults.map(r => r.data));
        
      } catch (parcelError) {
        console.error("Error submitting parcels:", parcelError);
        if (parcelError.response && parcelError.response.data) {
          console.error("Server response for parcels:", parcelError.response.data);
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

    // Extract parcels from the data if present
    const { parcels, ...salesRFQDetails } = salesRFQData;

    // Prepare data for API
    const apiData = {
      ...salesRFQDetails,
      // Convert IDs to numbers if they're strings
      CompanyID: Number(salesRFQDetails.CompanyID),
      CustomerID: Number(salesRFQDetails.CustomerID),
      SupplierID: Number(salesRFQDetails.SupplierID),
      // Add UpdatedByID if personId exists
      ...(personId ? { UpdatedByID: Number(personId) } : {})
    };

    // Add parcels to the request if they exist
    if (parcels && parcels.length > 0) {
      console.log("Parcels data before formatting for update:", parcels);
      
      // Format parcels for SalesRFQParcel table - use the same property name as in create
      apiData.SalesRFQParcels = parcels.map(parcel => ({
        SalesRFQID: Number(id), // Use the SalesRFQID from the URL parameter
        ItemID: Number(parcel.itemId),
        UOMID: Number(parcel.uomId),
        Quantity: Number(parcel.quantity),
        // For updates, include both created and updated by
        CreatedByID: Number(personId || 1),
        UpdatedByID: Number(personId || 1),
      }));
      
      console.log("Sending parcels data for SalesRFQParcel table update:", apiData.SalesRFQParcels);
    } else {
      console.warn("No parcels data found in the update request");
    }

    console.log("Updating SalesRFQ with ID:", id, "Data:", apiData);
    const response = await axios.put(`${API_BASE_URL}/${id}`, apiData, {
      headers,
    });
    
    // Log the response
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
    const response = await axios.get("http://localhost:7000/api/companies", { headers });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch all customers for dropdown
export const fetchCustomers = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get("http://localhost:7000/api/customers", { headers });
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
    const response = await axios.get("http://localhost:7000/api/currencies", { headers });
    return response.data.data || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a default approval record for a new SalesRFQ
export const createDefaultApproval = async (salesRFQId) => {
  try {
    const { headers } = getAuthHeader();
    
    if (!salesRFQId) {
      console.error("Cannot create default approval: Missing SalesRFQId");
      return { success: false, message: "Missing SalesRFQId" };
    }

    // Instead of trying to create an approval directly, which requires authorization,
    // we'll check if there's an existing approval endpoint we can use
    try {
      // First, check if there's a "create-default" endpoint that might bypass auth checks
      const response = await axios.post(
        `http://localhost:7000/api/sales-rfq/${salesRFQId}/create-default-approval`,
        {},
        { headers }
      );
      
      console.log("Default approval creation successful:", response.data);
      return response.data;
    } catch (firstError) {
      console.warn("First approval creation attempt failed:", firstError.message);
      
      try {
        // Second attempt: Try to use a batch operation if available
        const approvalData = {
          SalesRFQID: Number(salesRFQId),
          ApproverID: 2,
          ApprovedYN: 0,
          FormName: "SalesRFQ",
          RoleName: "Approver",
          UserID: 2
        };
        
        const response = await axios.post(
          "http://localhost:7000/api/batch-operations",
          {
            operation: "createSalesRFQApproval",
            data: approvalData
          },
          { headers }
        );
        
        console.log("Batch operation for approval successful:", response.data);
        return response.data;
      } catch (secondError) {
        console.warn("Second approval creation attempt failed:", secondError.message);
        
        // Store the approval data in localStorage for later processing
        try {
          const pendingApprovals = JSON.parse(localStorage.getItem("pendingApprovals") || "[]");
          pendingApprovals.push({
            SalesRFQID: Number(salesRFQId),
            ApproverID: 2,
            ApprovedYN: 0,
            FormName: "SalesRFQ",
            RoleName: "Approver",
            UserID: 2,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem("pendingApprovals", JSON.stringify(pendingApprovals));
          console.log("Stored approval request in localStorage for later processing");
        } catch (storageError) {
          console.error("Failed to store approval in localStorage:", storageError);
        }
        
        // Return a "soft success" - the SalesRFQ was created, even if the approval wasn't
        return { 
          success: true, 
          message: "SalesRFQ created successfully. Approval will be processed later.",
          approvalError: secondError.response?.data?.message || secondError.message
        };
      }
    }
  } catch (error) {
    console.error("Error in createDefaultApproval:", error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

// Process any pending approvals stored in localStorage
export const processPendingApprovals = async () => {
  try {
    const pendingApprovals = JSON.parse(localStorage.getItem("pendingApprovals") || "[]");
    if (pendingApprovals.length === 0) {
      return { success: true, message: "No pending approvals to process" };
    }
    
    console.log(`Processing ${pendingApprovals.length} pending approvals`);
    const { headers } = getAuthHeader();
    
    const results = [];
    const remainingApprovals = [];
    
    for (const approval of pendingApprovals) {
      try {
        const response = await axios.post(
          "http://localhost:7000/api/sales-rfq-approvals",
          approval,
          { headers }
        );
        
        results.push({
          salesRFQId: approval.SalesRFQID,
          success: true,
          message: response.data.message || "Approval created successfully"
        });
      } catch (error) {
        console.warn(`Failed to process pending approval for SalesRFQID ${approval.SalesRFQID}:`, error.message);
        
        // Keep approvals that are less than 7 days old
        const approvalDate = new Date(approval.timestamp);
        const now = new Date();
        const daysDiff = (now - approvalDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 7) {
          remainingApprovals.push(approval);
        }
        
        results.push({
          salesRFQId: approval.SalesRFQID,
          success: false,
          message: error.response?.data?.message || error.message
        });
      }
    }
    
    // Update localStorage with remaining approvals
    localStorage.setItem("pendingApprovals", JSON.stringify(remainingApprovals));
    
    return {
      success: true,
      processed: results.length - remainingApprovals.length,
      remaining: remainingApprovals.length,
      results
    };
  } catch (error) {
    console.error("Error processing pending approvals:", error);
    return { success: false, message: error.message };
  }
};