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

export const fetchSalesRFQParcels = async (salesRFQId) => {
  try {
    const { headers } = getAuthHeader();
    let response;

    // Use the confirmed endpoint
    response = await axios.get(
      `http://localhost:7000/api/sales-rfq-parcels?salesRFQID=${salesRFQId}`,
      { headers }
    );
    console.log("Fetched parcels using query endpoint:", response.data);

    let parcels = [];
    if (response && response.data) {
      if (response.data.data && Array.isArray(response.data.data)) {
        parcels = response.data.data;
      } else if (Array.isArray(response.data)) {
        parcels = response.data;
      } else if (
        response.data.parcels &&
        Array.isArray(response.data.parcels)
      ) {
        parcels = response.data.parcels;
      } else {
        console.warn("Unexpected response format:", response.data);
      }
    }

    // Filter parcels for the specific SalesRFQId
    parcels = parcels.filter((parcel) => {
      const parcelSalesRFQId =
        parcel.SalesRFQID ||
        parcel.salesRFQID ||
        parcel.salesRfqId ||
        parcel.salesrfqid ||
        parcel.SalesRfqId;
      return String(parcelSalesRFQId) === String(salesRFQId);
    });

    console.log("Fetched parcels for SalesRFQID:", salesRFQId, parcels);
    return parcels;
  } catch (error) {
    console.error(
      "Error fetching SalesRFQ parcels for SalesRFQID:",
      salesRFQId,
      error
    );
    if (error.response) {
      console.error("Server response:", error.response.data);
    }
    return [];
  }
};

// Update an existing SalesRFQ with parcels
export const updateSalesRFQ = async (id, salesRFQData) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      console.warn(
        "No personId found for deletion; proceeding without DeletedByID"
      );
    }
    console.log("PersonID for DeletedByID:", personId);

    const { parcels, ...salesRFQDetails } = salesRFQData;

    const apiData = {
      ...salesRFQDetails,
      CompanyID: Number(salesRFQDetails.CompanyID),
      CustomerID: Number(salesRFQDetails.CustomerID),
      SupplierID: Number(salesRFQDetails.SupplierID),
      ...(personId ? { UpdatedByID: Number(personId) } : {}),
    };

    console.log("Updating SalesRFQ with ID:", id, "Data:", apiData);
    const response = await axios.put(`${API_BASE_URL}/${id}`, apiData, {
      headers,
    });

    console.log("SalesRFQ update response:", response.data);

    // Handle parcels: Delete removed parcels and create/update others
    try {
      // Fetch existing parcels
      const existingParcels = await fetchSalesRFQParcels(id);
      console.log("Raw existing parcels for SalesRFQID:", id, existingParcels);

      // Determine parcels to delete (not present in updated parcels or all if parcels is empty)
      const updatedParcelIds = parcels
        .filter(
          (parcel) =>
            parcel.SalesRFQParcelID ||
            parcel.SalesRFQParcelId ||
            parcel.ParcelID ||
            parcel.ID
        )
        .map((parcel) =>
          Number(
            parcel.SalesRFQParcelID ||
              parcel.SalesRFQParcelId ||
              parcel.ParcelID ||
              parcel.ID
          )
        );

      // Include all existing parcels if parcels is empty, otherwise only those not in updated parcels
      const parcelsToDelete =
        parcels.length === 0
          ? existingParcels
          : existingParcels.filter(
              (parcel) =>
                !updatedParcelIds.includes(
                  Number(
                    parcel.SalesRFQParcelID ||
                      parcel.SalesRFQParcelId ||
                      parcel.ParcelID ||
                      parcel.ID
                  )
                )
            );

      // Delete parcels
      if (parcelsToDelete.length > 0) {
        const deletedParcelIds = new Set(); // Track deleted IDs to prevent duplicates
        const deletePromises = parcelsToDelete
          .filter((parcel) => {
            const parcelId =
              parcel.SalesRFQParcelID ||
              parcel.SalesRFQParcelId ||
              parcel.ParcelID ||
              parcel.ID;
            if (!parcelId) {
              console.warn(
                "Skipping parcel with missing SalesRFQParcelID:",
                parcel
              );
              return false;
            }
            if (deletedParcelIds.has(parcelId)) {
              console.log(
                "Skipping duplicate parcel deletion for SalesRFQParcelID:",
                parcelId
              );
              return false;
            }
            deletedParcelIds.add(parcelId);
            return true;
          })
          .map((parcel) => {
            const parcelId =
              parcel.SalesRFQParcelID ||
              parcel.SalesRFQParcelId ||
              parcel.ParcelID ||
              parcel.ID;
            console.log(
              "Attempting to delete parcel with SalesRFQParcelID:",
              parcelId
            );
            return axios
              .delete(
                `http://localhost:7000/api/sales-rfq-parcels/${parcelId}`,
                {
                  headers,
                  data: personId ? { DeletedByID: Number(personId) } : {},
                }
              )
              .catch((error) => {
                if (
                  error.response &&
                  error.response.status === 400 &&
                  error.response.data.message.includes(
                    "SalesRFQParcelID does not exist"
                  )
                ) {
                  console.log(
                    `Parcel with SalesRFQParcelID ${parcelId} already deleted or does not exist, proceeding.`
                  );
                  return { success: true, parcelId }; // Treat as success
                }
                throw error;
              });
          });

        try {
          const results = await Promise.all(deletePromises);
          console.log(
            "Deleted parcels for SalesRFQID:",
            id,
            results
              .filter((result) => result !== undefined)
              .map(
                (result) =>
                  result.parcelId ||
                  (result.data && result.data.salesRFQParcelId)
              )
              .filter(Boolean)
          );
        } catch (deleteError) {
          console.error("Error deleting parcels:", deleteError);
          if (deleteError.response) {
            console.error("Server response:", deleteError.response.data);
          }
        }
      } else {
        console.log("No parcels to delete for SalesRFQID:", id);
      }

      // Create new parcels (those without SalesRFQParcelID)
      if (parcels && parcels.length > 0) {
        console.log("Processing parcels for SalesRFQID:", id);
        const formattedParcels = parcels
          .filter(
            (parcel) =>
              !parcel.SalesRFQParcelID &&
              !parcel.SalesRFQParcelId &&
              !parcel.ParcelID &&
              !parcel.ID
          )
          .map((parcel, index) => ({
            SalesRFQID: Number(id),
            ItemID: Number(parcel.ItemID || parcel.itemId),
            UOMID: Number(parcel.UOMID || parcel.uomId),
            ItemQuantity: Number(
              parcel.ItemQuantity || parcel.Quantity || parcel.quantity
            ),
            LineItemNumber: index + 1,
            IsDeleted: 0,
          }));

        if (formattedParcels.length > 0) {
          console.log("Creating new parcels:", formattedParcels);
          const parcelPromises = formattedParcels.map((parcel) =>
            axios.post("http://localhost:7000/api/sales-rfq-parcels", parcel, {
              headers,
            })
          );
          const parcelResults = await Promise.all(parcelPromises);
          console.log(
            "Parcels creation results:",
            parcelResults.map((r) => r.data)
          );
        } else {
          console.log("No new parcels to create for SalesRFQID:", id);
        }
      } else {
        console.log("No parcels provided for SalesRFQID:", id);
      }
    } catch (parcelError) {
      console.error("Error handling parcels:", parcelError);
      if (parcelError.response && parcelError.response.data) {
        console.error(
          "Server response for parcels:",
          parcelError.response.data
        );
      }
    }

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
// export const approveSalesRFQ = async (salesRFQId, isApproved) => {
//   try {
//     const { headers } = getAuthHeader();

//     let existingApproval = null;
//     try {
//       existingApproval = await fetchSalesRFQApprovalStatus(salesRFQId);
//       console.log("Existing approval:", existingApproval);
//     } catch (error) {
//       console.warn(
//         "No existing approval found or error fetching status:",
//         error
//       );
//     }

//     const approvalData = {
//       SalesRFQID: Number(salesRFQId), // Convert to number
//       ApproverID: 2,
//       ApprovedYN: isApproved ? 1 : 0,
//       FormName: "Sales RFQ",
//       RoleName: "Sales RFQ Approver",
//       UserID: 2,
//     };

//     console.log("Approval data to be sent:", approvalData);

//     let response;
//     if (existingApproval) {
//       response = await axios.put(
//         `http://localhost:7000/api/sales-rfq-approvals/${salesRFQId}/2`,
//         approvalData,
//         { headers }
//       );
//       console.log("Updated existing approval:", response.data);
//     } else {
//       try {
//         // Attempt to create new approval
//         response = await axios.post(
//           `http://localhost:7000/api/sales-rfq-approvals`,
//           approvalData,
//           { headers }
//         );
//         console.log("Created new approval:", response.data);
//       } catch (postError) {
//         if (
//           postError.response?.status === 400 &&
//           postError.response?.data?.message ===
//             "Approval record already exists."
//         ) {
//           console.log(
//             "Approval record already exists, attempting to update instead."
//           );
//           // Fallback to updating the existing approval
//           response = await axios.put(
//             `http://localhost:7000/api/sales-rfq-approvals/${salesRFQId}/2`,
//             approvalData,
//             { headers }
//           );
//           console.log("Updated existing approval:", response.data);
//         } else {
//           throw postError; // Rethrow other errors
//         }
//       }
//     }

//     return response.data;
//   } catch (error) {
//     console.error("Error approving SalesRFQ:", error);
//     if (error.response) {
//       console.error("Server response:", error.response.data);
//     }
//     throw error;
//   }
// };

// Fetch approval status for a SalesRFQ
// export const fetchSalesRFQApprovalStatus = async (salesRFQId) => {
//   try {
//     const { headers } = getAuthHeader();
//     const response = await axios.get(
//       `http://localhost:7000/api/sales-rfq-approvals/${salesRFQId}/2`,
//       { headers }
//     );
//     console.log("GET approval response:", response.data);

//     if (response.data && response.data.data && response.data.data.length > 0) {
//       return response.data.data[0];
//     } else {
//       console.log("No approval data found in response:", response.data);
//       return null;
//     }
//   } catch (error) {
//     console.error("Error fetching SalesRFQ approval status:", error);
//     if (error.response) {
//       console.error("Server response:", error.response.data);
//     }
//     if (error.response?.status === 404) {
//       return null;
//     }
//     throw error.response?.data || error;
//   }
// };

export const fetchSalesRFQApprovalStatus = async (salesRFQId) => {
  try {
    const { headers } = getAuthHeader();

    // Instead of fetching from approvals endpoint, get the SalesRFQ status directly
    const response = await axios.get(`${API_BASE_URL}/${salesRFQId}`, {
      headers,
    });

    console.log("GET SalesRFQ status response:", response.data);

    // Convert the Status field to an approval record format for backward compatibility
    if (response.data && response.data.data) {
      const status = response.data.data.Status;
      return {
        SalesRFQID: salesRFQId,
        ApprovedYN: status === "Approved" ? true : false,
        ApproverDateTime: new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching SalesRFQ status:", error);
    throw error;
  }
};

// Replace the existing approveSalesRFQ function with this one
export const approveSalesRFQ = async (salesRFQId, approve = true) => {
  try {
    const { headers } = getAuthHeader();
    
    // Instead of creating an approval record, update the Status field directly
    console.log(`Updating SalesRFQ status to ${approve ? 'Approved' : 'Pending'} for ID: ${salesRFQId}`);
    
    const response = await axios.put(
      `${API_BASE_URL}/${salesRFQId}`,
      { Status: approve ? 'Approved' : 'Pending' },
      { headers }
    );
    
    console.log('Status update response:', response.data);
    
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
      salesRFQId
    };
  } catch (error) {
    console.error("Error updating SalesRFQ status:", error);
    throw error;
  }
};
