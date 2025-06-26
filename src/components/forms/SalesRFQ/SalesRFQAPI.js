import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Helper function to get auth header and personId from localStorage
export const getAuthHeader = () => {
  try {
    console.log("Raw localStorage user:", localStorage.getItem("user"));
    let user = JSON.parse(localStorage.getItem("user"));
    console.log("Parsed user object in getAuthHeader:", user);

    if (!user) {
      console.warn("User not found in localStorage");
      return { headers: {}, personId: null };
    }

    const personId = user.personId || user.id || user.userId || null;
    console.log("Extracted personId:", personId);

    if (!personId) {
      console.warn("personId is null or undefined for user:", user);
    }

    const headers = user.token ? { Authorization: `Bearer ${user.token}` } : {};
    console.log("Headers:", headers);

    return {
      headers,
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
  pageSize = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = user?.token
      ? { Authorization: `Bearer ${user.token}` } 
      : {};

    let url = `${APIBASEURL}/sales-rfq?pageNumber=${page}&pageSize=${pageSize}`;

    if (fromDate) {
      url += `&fromDate=${fromDate}`;
    }

    if (toDate) {
      url += `&toDate=${toDate}`;
    }

    const response = await axios.get(url, { headers });
    console.log("Raw API response for SalesRFQs:", response.data);

    if (response.data && response.data.data) {
      // Make sure each item has a Status field
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
    console.error("Error fetching SalesRFQs:", error);
    throw error;
  }
};

// Create a new SalesRFQ with parcels
export const createSalesRFQ = async (salesRFQData) => {
  try {
    const { headers, personId: initialPersonId } = getAuthHeader();
    if (!initialPersonId) {
      throw new Error("User authentication data missing. Please log in again.");
    }

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
      CreatedByID: initialPersonId, // Use cached personId
    };

    console.log("Creating SalesRFQ with data:", apiData);
    const response = await axios.post(`${APIBASEURL}/sales-rfq`, apiData, {
      headers,
    });

    console.log("SalesRFQ creation response:", response.data);

    if (response.data.newSalesRFQId && parcels && parcels.length > 0) {
      try {
        const salesRFQId = response.data.newSalesRFQId;
        console.log("Submitting parcels for SalesRFQID:", salesRFQId);
        const { headers, personId } = getAuthHeader();
        console.log("Using personId for parcels:", initialPersonId);

        if (!personId || isNaN(Number(personId)) || Number(personId) <= 0) {
          console.error("Invalid personId:", personId);
          throw new Error(
            "Unable to submit parcels: Invalid or missing personId in user data"
          );
        }

        const formattedParcels = parcels.map((parcel, index) => {
          const parcelData = {
            SalesRFQID: salesRFQId,
            ItemID: Number(parcel.ItemID || parcel.itemId),
            UOMID: Number(parcel.UOMID || parcel.uomId),
            ItemQuantity: Number(
              parcel.ItemQuantity || parcel.Quantity || parcel.quantity
            ),
            LineItemNumber: index + 1,
            IsDeleted: 0,
            CreatedByID: Number(personId),
          };
          console.log(`Formatted parcel ${index + 1}:`, parcelData);
          return parcelData;
        });

        console.log("Formatted parcels for API:", formattedParcels);

        const parcelPromises = formattedParcels.map((parcel) =>
          axios.post(`${APIBASEURL}/sales-rfq-parcels`, parcel, { headers })
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
        throw parcelError;
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

    response = await axios.get(
      `${APIBASEURL}/sales-rfq-parcels?salesRFQID=${salesRFQId}`,
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
    const response = await axios.put(`${APIBASEURL}/sales-rfq/${id}`, apiData, {
      headers,
    });

    console.log("SalesRFQ update response:", response.data);

    try {
      const existingParcels = await fetchSalesRFQParcels(id);
      console.log("Raw existing parcels for SalesRFQID:", id, existingParcels);

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

      if (parcelsToDelete.length > 0) {
        const deletedParcelIds = new Set();
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
              .delete(`${APIBASEURL}/sales-rfq-parcels/${parcelId}`, {
                headers,
                data: personId ? { DeletedByID: Number(personId) } : {},
              })
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
                  return { success: true, parcelId };
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

      if (parcels && parcels.length > 0) {
        console.log("Processing parcels for SalesRFQID:", id);
        const { headers, personId } = getAuthHeader();
        console.log("personId for parcel update:", personId);

        if (!personId || isNaN(Number(personId)) || Number(personId) <= 0) {
          console.error("Invalid personId for update:", personId);
          throw new Error(
            "Unable to create parcels: Invalid or missing personId in user data"
          );
        }

        const formattedParcels = parcels
          .filter(
            (parcel) =>
              !parcel.SalesRFQParcelID &&
              !parcel.SalesRFQParcelId &&
              !parcel.ParcelID &&
              !parcel.ID
          )
          .map((parcel, index) => {
            const parcelData = {
              SalesRFQID: Number(id),
              ItemID: Number(parcel.ItemID || parcel.itemId),
              UOMID: Number(parcel.UOMID || parcel.uomId),
              ItemQuantity: Number(
                parcel.ItemQuantity || parcel.Quantity || parcel.quantity
              ),
              LineItemNumber: index + 1,
              IsDeleted: 0,
              CreatedByID: Number(personId),
            };
            console.log(
              `Formatted parcel ${index + 1} for update:`,
              parcelData
            );
            return parcelData;
          });

        if (formattedParcels.length > 0) {
          const parcelPromises = formattedParcels.map((parcel) =>
            axios.post(`${APIBASEURL}/sales-rfq-parcels`, parcel, {
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
    const response = await axios.delete(`${APIBASEURL}/sales-rfq/${id}`, {
      headers,
    });
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
    const response = await axios.get(`${APIBASEURL}/sales-rfq/${id}`, {
      headers,
    });
    const data = response.data.data || response.data;
    console.log("Fetched SalesRFQ by ID:", id, data);
    return { data };
  } catch (error) {
    console.error("Error fetching SalesRFQ by ID:", id, error);
    throw error.response?.data || error.message;
  }
};

// Fetch all companies for dropdown
export const fetchCompanies = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/sales-rfq`, { headers });
    const data = response.data.data || response.data || [];
    console.log("Fetched sales-rfq:", data);
    return data.map((company) => ({
      CompanyID: company.CompanyID || company.id,
      CompanyName: company.CompanyName || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
};

// Fetch all customers for dropdown
export const fetchCustomers = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/customers`, { headers });
    const data = response.data.data || response.data || [];
    console.log("Fetched customers:", data);
    return data.map((customer) => ({
      CustomerID: customer.CustomerID || customer.id,
      CustomerName: customer.CustomerName || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};

// Fetch all suppliers for dropdown
export const fetchSuppliers = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/suppliers`, { headers });
    const data = response.data.data || response.data || [];
    console.log("Fetched suppliers:", data);
    return data.map((supplier) => ({
      SupplierID: supplier.SupplierID || supplier.id,
      SupplierName: supplier.SupplierName || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
};

// Fetch all service types for dropdown
export const fetchServiceTypes = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/service-types`, {
      headers,
    });
    const data = response.data.data || response.data || [];
    console.log("Fetched service types:", data);
    return data.map((type) => ({
      ServiceTypeID: type.ServiceTypeID || type.id,
      ServiceType: type.ServiceType || type.ServiceTypeName || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching service types:", error);
    return [];
  }
};

// Fetch all addresses for dropdown
export const fetchAddresses = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/addresses`, { headers });
    const data = response.data.data || response.data || [];
    console.log("Fetched addresses:", data);
    return data.map((address) => ({
      AddressID: address.AddressID || address.id,
      AddressLine1: address.AddressLine1 || "",
      City: address.City || "",
      PostCode: address.PostCode || "",
      AddressTitle: address.AddressTitle || address.Title || "",
    }));
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
};

// Fetch all mailing priorities for dropdown
export const fetchMailingPriorities = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/mailing-priorities`, {
      headers,
    });
    const data = response.data.data || response.data || [];
    console.log("Fetched mailing priorities:", data);
    return data.map((priority) => ({
      MailingPriorityID: priority.MailingPriorityID || priority.id,
      PriorityName:
        priority.PriorityName || priority.MailingPriorityName || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching mailing priorities:", error);
    return [];
  }
};

// Fetch all currencies for dropdown
export const fetchCurrencies = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/currencies`, { headers });
    const data = response.data.data || response.data || [];
    console.log("Fetched currencies:", data);
    return data.map((currency) => ({
      CurrencyID: currency.CurrencyID || currency.id,
      CurrencyName: currency.CurrencyName || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return [];
  }
};

// Approve or disapprove SalesRFQ
export const approveSalesRFQ = async (salesRFQId) => {
  try {
    const { headers, personId } = getAuthHeader();
    console.log(
      `Approving SalesRFQ with ID: ${salesRFQId}, ApproverID: ${personId}`
    );

    if (!personId) {
      throw new Error("No personId found for approval");
    }

    const response = await axios.post(
      `${APIBASEURL}/sales-rfq/approve`,
      {
        salesRFQID: Number(salesRFQId),
        approverID: Number(personId), // Send approverID
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
      salesRFQId,
    };
  } catch (error) {
    console.error("Error approving SalesRFQ:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error.response?.data || error;
  }
};

// Fetch approval status for a SalesRFQ
export const fetchSalesRFQApprovalStatus = async (salesRFQId) => {
  try {
    const { headers } = getAuthHeader();

    const response = await axios.get(`${APIBASEURL}/sales-rfq/${salesRFQId}`, {
      headers,
    });

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

export const fetchSalesRFQStatus = async (salesRFQId) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/sales-rfq/${salesRFQId}`, {
      headers,
    });

    console.log("Fetched SalesRFQ status for ID:", salesRFQId, response.data);

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
    return "Pending"; // Default to Pending
  } catch (error) {
    console.error("Error fetching SalesRFQ status:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return "Pending"; // Fallback to Pending
  }
};

export const fetchUserApprovalStatus = async (salesRFQId, approverId) => {
  try {
    const { headers } = getAuthHeader();
    console.log("Fetching approval status with params:", {
      salesRFQId,
      approverId,
    });
    const response = await axios.get(
      `${APIBASEURL}/sales-rfq-approvals/${salesRFQId}/${approverId}`,
      { headers }
    );

    console.log(
      "Full API response for SalesRFQID:",
      salesRFQId,
      "ApproverID:",
      approverId,
      { status: response.status, data: response.data }
    );

    // Handle response
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
    return "Pending"; // Fallback to Pending
  }
};
