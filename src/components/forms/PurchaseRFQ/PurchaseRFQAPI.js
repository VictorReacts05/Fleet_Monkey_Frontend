import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/purchase-rfq";

// Simple headers function instead of importing getAuthHeader
const getHeaders = () => {
  // Return basic headers without auth
  return {
    headers: {
      'Content-Type': 'application/json'
    }
  };
};

// Get PurchaseRFQ by ID with its parcels
// Add this new function to fetch parcels from a SalesRFQ
// Improve the fetchSalesRFQParcels function to get more detailed parcel information
// Update the fetchSalesRFQParcels function to correctly fetch parcels by SalesRFQID
export const fetchSalesRFQParcels = async (salesRFQId) => {
  try {
    if (!salesRFQId) {
      return [];
    }
    
    console.log("Fetching parcels for SalesRFQ ID:", salesRFQId);
    // Make sure we're using the correct endpoint with the right parameter
    const response = await axios.get(
      `http://localhost:7000/api/sales-rfq-parcels?salesRFQID=${salesRFQId}`
    );
    console.log("Parcels response:", response.data);
    
    if (response.data && response.data.data) {
      // For each parcel, fetch the item and UOM details if needed
      const parcels = response.data.data;
      
      // Fetch all UOMs once to avoid multiple API calls
      let uomMap = {};
      try {
        const uomResponse = await axios.get(`http://localhost:7000/api/uoms`);
        console.log("UOM response:", uomResponse.data);
        
        if (uomResponse.data && uomResponse.data.data) {
          // Make sure we're correctly mapping UOM IDs to names
          uomMap = uomResponse.data.data.reduce((acc, uom) => {
            // Check the structure of each UOM object to find the name property
            console.log("UOM object structure:", JSON.stringify(uom));
            
            // Use the UOM property which contains the name based on the logged structure
            const uomName = uom.UOM || uom.UOMName || uom.Name || uom.Description;
            
            // Log each UOM to debug
            console.log(`Mapping UOM: ID=${uom.UOMID}, Name=${uomName}`);
            
            // Store with both string and number keys to handle different formats
            if (uom.UOMID && uomName) {
              acc[uom.UOMID] = uomName;
              acc[String(uom.UOMID)] = uomName;
            }
            return acc;
          }, {});
          console.log("UOM Map:", uomMap);
        }
      } catch (err) {
        console.log("Could not fetch UOMs:", err);
      }
      
      // Fetch all items once to avoid multiple API calls
      let itemMap = {};
      try {
        const itemResponse = await axios.get(`http://localhost:7000/api/items`);
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
        console.log("Processing parcel:", parcel);
        
        // Add item name from our map
        if (parcel.ItemID && itemMap[parcel.ItemID]) {
          parcel.ItemName = itemMap[parcel.ItemID];
        }
        
        // Add UOM name from our map - REMOVED hardcoded values
        if (parcel.UOMID) {
          console.log(`Looking for UOM ID: ${parcel.UOMID}, Type: ${typeof parcel.UOMID}`);
          console.log(`UOM name from map: ${uomMap[parcel.UOMID]}`);
          
          if (uomMap[parcel.UOMID]) {
            parcel.UOMName = uomMap[parcel.UOMID];
          } else {
            // Try to fetch individual UOM as fallback
            try {
              const singleUomResponse = axios.get(`http://localhost:7000/api/uoms/${parcel.UOMID}`);
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
    console.error("Error fetching Sales RFQ parcels:", error);
    // If the specific endpoint fails, try the fallback with filtering
    try {
      console.log("Trying fallback method to fetch parcels");
      const response = await axios.get(`http://localhost:7000/api/sales-rfq-parcels`);
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
            const uomResponse = await axios.get(`http://localhost:7000/api/uoms`);
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
    const response = await axios.get(`${API_BASE_URL}/${id}`, { headers });
    console.log("API Response:", response.data);

    // If the Purchase RFQ has a SalesRFQID, fetch the associated parcels
    if (response.data && response.data.data && response.data.data.SalesRFQID) {
      const salesRFQId = response.data.data.SalesRFQID;
      console.log("Found associated SalesRFQ ID:", salesRFQId);

      // First, fetch the original SalesRFQ to get its details
      try {
        const salesRFQResponse = await axios.get(
          `http://localhost:7000/api/sales-rfq/${salesRFQId}`
        );
        console.log("Original SalesRFQ data:", salesRFQResponse.data);

        // Fetch parcels directly from the sales-rfq-parcels endpoint with proper filtering
        const parcelsResponse = await axios.get(
          `http://localhost:7000/api/sales-rfq-parcels?salesRFQID=${salesRFQId}`
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
            axios.get(`http://localhost:7000/api/items`),
            axios.get(`http://localhost:7000/api/uoms`),
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
    const response = await axios.post(API_BASE_URL, purchaseRFQData, { headers });
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
    const response = await axios.put(`${API_BASE_URL}/${id}`, purchaseRFQData, { headers });
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
    const response = await axios.get("http://localhost:7000/api/sales-rfq", { headers });
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
      "http://localhost:7000/api/purchase-rfq-approvals",
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

// Fetch approval status for a Purchase RFQ
export const fetchPurchaseRFQApprovalStatus = async (purchaseRFQId) => {
  try {
    // Updated endpoint with correct query parameters
    const response = await axios.get(
      `http://localhost:7000/api/purchase-rfq-approval?PurchaseRFQID=${purchaseRFQId}&ApproverID=2`
    );
    
    console.log("Approval status response:", response.data);
    
    // If we have data and it has records
    if (response.data && response.data.data && response.data.data.length > 0) {
      const approvalRecord = response.data.data[0];
      return {
        exists: true,
        ApprovedYN: approvalRecord.ApprovedYN,
        ApproverID: approvalRecord.ApproverID,
        // Include any other fields you need
      };
    } else {
      // No approval record exists yet
      return {
        exists: false,
        ApprovedYN: null
      };
    }
  } catch (error) {
    console.error("Error fetching Purchase RFQ approval status:", error);
    // Return a structured response even on error
    return {
      exists: false,
      ApprovedYN: null,
      error: error.message
    };
  }
};

// Update approval status for a Purchase RFQ
export const updatePurchaseRFQApproval = async (purchaseRFQId, approved) => {
  try {
    const approvalData = {
      PurchaseRFQID: purchaseRFQId,
      ApproverID: 2,
      ApprovedYN: approved ? 1 : 0,
      FormName: "Purchase RFQ",
      RoleName: "Purchase RFQ Approver",
      UserID: 2,
    };
    
    console.log("Sending approval data:", approvalData);
    
    const response = await axios.post(
      "http://localhost:7000/api/purchase-rfq-approval",
      approvalData
    );
    
    return response.data;
  } catch (error) {
    console.error("Error updating Purchase RFQ approval:", error);
    throw error;
  }
};

// Approve a Purchase RFQ (alternative implementation if needed)
export const approvePurchaseRFQ = async (purchaseRFQId) => {
  return updatePurchaseRFQApproval(purchaseRFQId, true);
};

// Create a Purchase RFQ from a Sales RFQ
export const createPurchaseRFQFromSalesRFQ = async (salesRFQId) => {
  try {
    console.log(`Creating Purchase RFQ from Sales RFQ ID: ${salesRFQId}`);
    
    // Use the correct endpoint with the proper payload structure
    const response = await axios.post(
      `http://localhost:7000/api/purchase-rfq`,
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
    const response = await axios.get("http://localhost:7000/api/service-types");
    return response.data;
  } catch (error) {
    console.error("Error fetching service types:", error);
    throw error;
  }
};

export const fetchShippingPriorities = async () => {
  try {
    const response = await axios.get(
      "http://localhost:7000/api/mailing-priorities"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching shipping priorities:", error);
    throw error;
  }
};

export const fetchCurrencies = async () => {
  try {
    const response = await axios.get("http://localhost:7000/api/currencies");
    return response.data;
  } catch (error) {
    console.error("Error fetching currencies:", error);
    throw error;
  }
};