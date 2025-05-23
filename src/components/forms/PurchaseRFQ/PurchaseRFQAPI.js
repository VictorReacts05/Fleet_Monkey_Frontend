import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Simple headers function instead of importing getAuthHeader
const getHeaders = () => {
  return {
    headers: {
      'Content-Type': 'application/json'
    }
  };
};

export const fetchSalesRFQParcels = async (salesRFQId) => {
  try {
    if (!salesRFQId) {
      return [];
    }
    
    console.log("Fetching parcels for SalesRFQ ID:", salesRFQId);
    // Make sure we're using the correct endpoint with the right parameter
    const response = await axios.get(
      `${APIBASEURL}/sales-rfq-parcels?salesRFQID=${salesRFQId}`
    );
    
    if (response.data && response.data.data) {
      const parcels = response.data.data;
      
      let uomMap = {};
      try {
        const uomResponse = await axios.get(`${APIBASEURL}/uoms`);
        
        if (uomResponse.data && uomResponse.data.data) {
          uomMap = uomResponse.data.data.reduce((acc, uom) => {
            const uomName = uom.UOM || uom.UOMName || uom.Name || uom.Description;
            
            if (uom.UOMID && uomName) {
              acc[uom.UOMID] = uomName;
              acc[String(uom.UOMID)] = uomName;
            }
            return acc;
          }, {});
        }
      } catch (err) {
        console.log("Could not fetch UOMs:", err);
      }
      
      // Fetch all items once to avoid multiple API calls
      let itemMap = {};
      try {
        const itemResponse = await axios.get(`${APIBASEURL}/items`);
        if (itemResponse.data && itemResponse.data.data) {
          itemMap = itemResponse.data.data.reduce((acc, item) => {
            acc[item.ItemID] = item.ItemName || item.Description;
            acc[String(item.ItemID)] = item.ItemName || item.Description;
            return acc;
          }, {});
        }
      } catch (err) {
        console.log("Could not fetch items:", err);
      }
      
      // Enhance parcels with item and UOM names from our maps
      const enhancedParcels = parcels.map(parcel => {
        if (parcel.ItemID && itemMap[parcel.ItemID]) {
          parcel.ItemName = itemMap[parcel.ItemID];
        }
        
        // Add UOM name from our map - REMOVED hardcoded values
        if (parcel.UOMID) {
          if (uomMap[parcel.UOMID]) {
            parcel.UOMName = uomMap[parcel.UOMID];
          } else {
            // Try to fetch individual UOM as fallback
            try {
              const singleUomResponse = axios.get(`${APIBASEURL}/uoms/${parcel.UOMID}`);
              singleUomResponse.then(response => {
                if (response.data && response.data.data) {
                  // Use the correct property name for UOM
                  parcel.UOMName = response.data.data.UOM || response.data.data.UOMName;
                }
              });
            } catch (err) {
              console.log(`Could not fetch UOM ${parcel.UOMID}:`, err);
            }
          }
        }
        
        return parcel;
      });
      
      return enhancedParcels;
    }
    return [];
  } catch (error) {
    try {
      const response = await axios.get(`${APIBASEURL}/sales-rfq-parcels`);
      if (response.data && response.data.data) {
        // Filter parcels by SalesRFQID
        const filteredParcels = response.data.data.filter(
          parcel => String(parcel.SalesRFQID) === String(salesRFQId)
        );
        console.log(`Filtered ${filteredParcels.length} parcels for SalesRFQ ID ${salesRFQId}`);
        
        // Now fetch UOMs for these filtered parcels
        const uomIds = filteredParcels.map(p => p.UOMID).filter(id => id);
        if (uomIds.length > 0) {
          try {
            const uomResponse = await axios.get(`${APIBASEURL}/uoms`);
            if (uomResponse.data && uomResponse.data.data) {
              const uomMap = uomResponse.data.data.reduce((acc, uom) => {
                acc[uom.UOMID] = uom.UOMName;
                acc[String(uom.UOMID)] = uom.UOMName;
                return acc;
              }, {});
              
              // Add UOM names to parcels
              filteredParcels.forEach(parcel => {
                if (parcel.UOMID && uomMap[parcel.UOMID]) {
                  parcel.UOMName = uomMap[parcel.UOMID];
                }
              });
            }
          } catch (err) {
            console.log("Could not fetch UOMs in fallback:", err);
          }
        }
        
        return filteredParcels;
      }
    } catch (fallbackError) {
      console.error("Fallback method also failed:", fallbackError);
    }
    return [];
  }
};

// Update the getPurchaseRFQById function to better format the parcels
export const getPurchaseRFQById = async (id) => {
  try {
    // Add validation check
    if (!id || id === "undefined" || id === "create") {
      throw new Error("Invalid Purchase RFQ ID");
    }

    console.log("Fetching Purchase RFQ with ID:", id);
    const { headers } = getHeaders();
    const response = await axios.get(`${APIBASEURL}/purchase-rfq/${id}`, { headers });
    console.log("API Response:", response.data);

    // If the Purchase RFQ has a SalesRFQID, fetch the associated parcels
    if (response.data && response.data.data && response.data.data.SalesRFQID) {
      const salesRFQId = response.data.data.SalesRFQID;
      console.log("Found associated SalesRFQ ID:", salesRFQId);

      // First, fetch the original SalesRFQ to get its details
      try {
        const salesRFQResponse = await axios.get(
          `${APIBASEURL}/sales-rfq/${salesRFQId}`
        );
        console.log("Original SalesRFQ data:", salesRFQResponse.data);

        // Fetch parcels directly from the sales-rfq-parcels endpoint with proper filtering
        const parcelsResponse = await axios.get(
          `${APIBASEURL}/sales-rfq-parcels?salesRFQID=${salesRFQId}`
        );

        if (parcelsResponse.data && parcelsResponse.data.data) {
          const parcels = parcelsResponse.data.data;
          // Validate that parcels belong to the correct SalesRFQID
          const filteredParcels = parcels.filter(
            (parcel) => String(parcel.SalesRFQID) === String(salesRFQId)
          );
          console.log(
            `Found ${filteredParcels.length} valid parcels for SalesRFQ ID ${salesRFQId}:`,
            filteredParcels
          );

          // Fetch all items and UOMs in parallel for better performance
          const [itemsResponse, uomsResponse] = await Promise.all([
            axios.get(`${APIBASEURL}/items`),
            axios.get(`${APIBASEURL}/uoms`),
          ]);

          // Create maps for items and UOMs
          const itemMap = {};
          if (itemsResponse.data && itemsResponse.data.data) {
            itemsResponse.data.data.forEach((item) => {
              itemMap[item.ItemID] = item.ItemName || item.Description;
            });
          }
          console.log("Item map:", itemMap);

          const uomMap = {};
          if (uomsResponse.data && uomsResponse.data.data) {
            uomsResponse.data.data.forEach((uom) => {
              uomMap[uom.UOMID] = uom.UOM || uom.UOMName;
            });
          }
          console.log("UOM map:", uomMap);

          // Format parcels with correct item and UOM names
          const formattedParcels = filteredParcels.map((parcel, index) => {
            let itemName = "Unknown Item";
            if (parcel.ItemID && itemMap[parcel.ItemID]) {
              itemName = itemMap[parcel.ItemID];
            }

            let uomName = "Unknown Unit";
            if (parcel.UOMID && uomMap[parcel.UOMID]) {
              uomName = uomMap[parcel.UOMID];
            }

            return {
              id: parcel.SalesRFQParcelID || Date.now() + index,
              itemId: String(parcel.ItemID || ""),
              uomId: String(parcel.UOMID || ""),
              quantity: String(parcel.ItemQuantity || parcel.Quantity || "0"),
              itemName: itemName,
              uomName: uomName,
              srNo: index + 1,
            };
          });

          // Add the parcels to the response data
          response.data.data.parcels = formattedParcels;
        } else {
          console.log(
            "No parcels found in response for SalesRFQ ID:",
            salesRFQId
          );
          response.data.data.parcels = [];
        }
      } catch (err) {
        console.error("Error fetching SalesRFQ details or parcels:", err);
        response.data.data.parcels = [];
      }
    } else {
      console.log("No SalesRFQID found in Purchase RFQ");
      response.data.data.parcels = [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching Purchase RFQ:", error);
    throw error;
  }
};

// Create a new PurchaseRFQ
export const createPurchaseRFQ = async (purchaseRFQData) => {
  try {
    const { headers } = getHeaders();
    const response = await axios.post(`${APIBASEURL}/purchase-rfq`, purchaseRFQData, { headers });
    return { success: true, data: response.data, purchaseRFQId: response.data.PurchaseRFQID };
  } catch (error) {
    console.error("Error creating Purchase RFQ:", error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

// Update an existing PurchaseRFQ
export const updatePurchaseRFQ = async (id, purchaseRFQData) => {
  try {
    const { headers } = getHeaders();
    const response = await axios.put(`${APIBASEURL}/purchase-rfq/${id}`, purchaseRFQData, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating Purchase RFQ:", error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

// Fetch all SalesRFQs for dropdown
export const fetchSalesRFQs = async () => {
  try {
    const { headers } = getHeaders();
    const response = await axios.get("${APIBASEURL}/sales-rfq", { headers });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching Sales RFQs:", error);
    return [];
  }
};

// Approve or disapprove PurchaseRFQ
/* export const approvePurchaseRFQ = async (purchaseRFQId, isApproved) => {
  try {
    const { headers } = getHeaders();
    const approvalData = {
      PurchaseRFQID: purchaseRFQId,
      ApproverID: 2,
      ApprovedYN: isApproved ? 1 : 0,
      FormName: "Purchase RFQ",
      RoleName: "Purchase RFQ Approver",
      UserID: 2,
    };

    console.log("Approval data to be sent:", approvalData);
    const response = await axios.post(
      "${APIBASEURL}/purchase-rfq-approvals",
      approvalData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error approving Purchase RFQ:", error);
    throw error;
  }
}; */

// Add or update these functions in your purchaserfqapi.js file

// Update these functions in your API file

// Fetch approval status for a Purchase RFQ
export const fetchPurchaseRFQApprovalStatus = async (purchaseRFQId) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = user?.token
      ? { Authorization: `Bearer ${user.token}` }
      : {};
      
    // Use query parameters instead of path parameters
    const response = await axios.get(
      `${APIBASEURL}/purchase-rfq-approvals?PurchaseRFQID=${purchaseRFQId}&ApproverID=2`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Purchase RFQ approval status:", error);
    throw error;
  }
};

// Update Purchase RFQ approval
export const updatePurchaseRFQApproval = async (purchaseRFQId, isApproved = true) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = user?.token
      ? { Authorization: `Bearer ${user.token}` }
      : {};
    const userId = user?.personId || 2;
    
    // First update the Purchase RFQ status
    const statusResponse = await axios.put(
      `${APIBASEURL}/purchase-rfq/${purchaseRFQId}`,
      {
        PurchaseRFQID: purchaseRFQId,
        Status: isApproved ? "Approved" : "Pending"
      },
      { headers }
    );

    // Then create/update the approval record
    const approvalData = {
      PurchaseRFQID: parseInt(purchaseRFQId, 10),
      ApproverID: 2,
      ApprovedYN: isApproved ? 1 : 0,
      ApproverDateTime: new Date().toISOString(),
      CreatedByID: userId
    };

    // Try to create a new record first
    try {
      const approvalResponse = await axios.post(
        `${APIBASEURL}/purchase-rfq-approvals`,
        approvalData,
        { headers }
      );
      return approvalResponse.data;
    } catch (postError) {
      // If creation fails, try to update existing record
      // Use the base endpoint without ID parameters
      const approvalResponse = await axios.put(
        `${APIBASEURL}/purchase-rfq-approvals`,
        approvalData,
        { headers }
      );
      return approvalResponse.data;
    }
  } catch (error) {
    console.error("Error updating Purchase RFQ approval:", error);
    throw error;
  }
};

// Approve or disapprove a Purchase RFQ
// Update the approvePurchaseRFQ function to ensure Status is updated correctly
export const approvePurchaseRFQ = async (purchaseRFQId, isApproved = true) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = user?.token
      ? { Authorization: `Bearer ${user.token}` }
      : {};
    const userId = user?.personId || 2;
    
    console.log(`API: Approving PurchaseRFQ ID: ${purchaseRFQId}, Approved: ${isApproved}`);
    
    // First, fetch the current PurchaseRFQ to get its SalesRFQID
    try {
      console.log(`API: Fetching PurchaseRFQ details to get SalesRFQID`);
      const purchaseRFQResponse = await axios.get(
        `${APIBASEURL}/purchase-rfq/${purchaseRFQId}`,
        { headers }
      );
      
      console.log(`API: PurchaseRFQ details:`, purchaseRFQResponse.data);
      
      // Extract the SalesRFQID from the response
      let salesRFQId = null;
      if (purchaseRFQResponse.data && purchaseRFQResponse.data.data) {
        salesRFQId = purchaseRFQResponse.data.data.SalesRFQID;
        console.log(`API: Found SalesRFQID: ${salesRFQId}`);
      }
      
      // Set the status value based on isApproved
      const statusValue = isApproved ? "Approved" : "Pending";
      console.log(`API: Setting Status to: ${statusValue}`);
      
      // Prepare the update data with SalesRFQID included
      const updateData = {
        PurchaseRFQID: parseInt(purchaseRFQId, 10),
        Status: statusValue,
        SalesRFQID: salesRFQId // Include the SalesRFQID in the update
      };
      
      console.log(`API: Update payload with SalesRFQID:`, updateData);
      
      // Update the PurchaseRFQ status
      const statusResponse = await axios.put(
        `${APIBASEURL}/purchase-rfq/${purchaseRFQId}`,
        updateData,
        { headers }
      );
      console.log(`API: Status update response:`, statusResponse.data);
      
      // Verify the status was updated correctly
      if (statusResponse.data && statusResponse.data.data) {
        console.log(`API: Updated Status in PurchaseRFQ table: ${statusResponse.data.data.Status}`);
      }
      
      // Then create/update the approval record
      const approvalData = {
        PurchaseRFQID: parseInt(purchaseRFQId, 10),
        ApproverID: 2,
        ApprovedYN: isApproved ? 1 : 0,
        ApproverDateTime: new Date().toISOString(),
        CreatedByID: userId
      };
      
      console.log(`API: Approval data:`, approvalData);
      
      // Check if approval record exists
      console.log(`API: Checking for existing approval record`);
      const checkResponse = await fetchPurchaseRFQApprovalStatus(purchaseRFQId);
      console.log(`API: Check response:`, checkResponse);
      
      let approvalResponse;
      if (checkResponse.data && checkResponse.data.length > 0) {
        console.log(`API: Found existing approval record, updating`);
        // Update existing record
        approvalResponse = await axios.put(
          `${APIBASEURL}/purchase-rfq-approvals`,
          approvalData,
          { headers }
        );
        console.log(`API: Update approval response:`, approvalResponse.data);
      } else {
        console.log(`API: No existing approval record, creating new one`);
        // Create new record
        approvalResponse = await axios.post(
          `${APIBASEURL}/purchase-rfq-approvals`,
          approvalData,
          { headers }
        );
        console.log(`API: Create approval response:`, approvalResponse.data);
      }
      
      return approvalResponse.data;
      
    } catch (fetchError) {
      console.error(`API: Error fetching PurchaseRFQ details:`, fetchError);
      console.error(`API: Error response:`, fetchError.response?.data);
      throw fetchError;
    }
  } catch (error) {
    console.error("API: Error approving Purchase RFQ:", error);
    console.error("API: Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Update Purchase RFQ approval
/* export const updatePurchaseRFQApproval = async (purchaseRFQId, approvalData) => {
  try {
    const response = await axios.put(
      `${APIBASEURL}/purchase-rfq-approvals/${purchaseRFQId}/2`,
      approvalData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating Purchase RFQ approval:", error);
    throw error;
  }
}; */

// Create a Purchase RFQ from a Sales RFQ
export const createPurchaseRFQFromSalesRFQ = async (salesRFQId) => {
  try {
    
    // Use the correct endpoint with the proper payload structure
    const response = await axios.post(
      `${APIBASEURL}/purchase-rfq`,
      { 
        SalesRFQID: salesRFQId,
        // Add any other required fields for creating a Purchase RFQ
      },
      getHeaders()
    );
    
    console.log("Purchase RFQ creation response:", response.data);
    
    // Extract the Purchase RFQ ID from the response
    let purchaseRFQId = null;
    if (response.data && response.data.data) {
      purchaseRFQId = response.data.data.PurchaseRFQID || response.data.data.id;
      console.log("Extracted Purchase RFQ ID:", purchaseRFQId);
    }
    
    // Add the ID to the response object for easier access
    response.purchaseRFQId = purchaseRFQId;
    
    // Return the entire response for better debugging
    return response;
  } catch (error) {
    console.error("Error creating Purchase RFQ from Sales RFQ:", error);
    throw error;
  }
};

// Add these new functions to fetch reference data

export const fetchServiceTypes = async () => {
  try {
    const response = await axios.get("${APIBASEURL}/service-types");
    return response.data;
  } catch (error) {
    console.error("Error fetching service types:", error);
    throw error;
  }
};

export const fetchShippingPriorities = async () => {
  try {
    const response = await axios.get(
      "${APIBASEURL}/mailing-priorities"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching shipping priorities:", error);
    throw error;
  }
};

export const fetchCurrencies = async () => {
  try {
    const response = await axios.get("${APIBASEURL}/currencies");
    return response.data;
  } catch (error) {
    console.error("Error fetching currencies:", error);
    throw error;
  }
};