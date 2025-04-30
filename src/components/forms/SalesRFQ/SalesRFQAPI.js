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
      // Only add createdByID if personId exists
      ...(personId ? { CreatedByID: Number(personId) } : {})
    };

    console.log("Creating SalesRFQ with data:", apiData);
    const response = await axios.post(API_BASE_URL, apiData, { headers });
    
    // Log the response to see if parcels were processed
    console.log("SalesRFQ creation response:", response.data);
    
    // If we have a salesRFQId in the response and parcels data, submit parcels to the correct endpoint
    if (response.data.salesRFQId && parcels && parcels.length > 0) {
      try {
        console.log("Submitting parcels to the correct endpoint for SalesRFQID:", response.data.salesRFQId);
        
        // Format parcels data according to the SalesRFQParcelModel parameters
        const formattedParcels = parcels.map((parcel, index) => ({
          SalesRFQID: response.data.salesRFQId,
          ItemID: Number(parcel.itemId),
          UOMID: Number(parcel.uomId),
          // Use ItemQuantity instead of Quantity as per the model
          ItemQuantity: Number(parcel.quantity),
          // Add LineItemNumber for each parcel
          LineItemNumber: index + 1,
          CreatedByID: Number(personId || 1),
          IsDeleted: 0
        }));
        
        console.log("Formatted parcels for API:", formattedParcels);
        
        // Submit each parcel individually to the correct endpoint
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
        console.error("Error submitting parcels to dedicated endpoint:", parcelError);
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