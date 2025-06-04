import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";
import { useSelector } from "react-redux"; // Import for Redux access

// Note: Since getAuthHeader is used in a non-component, we'll create a function to get token
const getTokenFromRedux = () => {
  // This assumes Redux store is accessible globally or via context
  // If called in a component, useSelector can be used directly
  try {
    const state = window.__REDUX_STATE__ || {}; // Fallback for server-side or non-component context
    return state.loginReducer?.token || null;
  } catch {
    return null;
  }
};

export const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Raw user data from localStorage:", localStorage.getItem("user"));
    console.log("Parsed user data:", user);
    const personId = user?.personId || user?.id || user?.userId || null;
    console.log("Extracted personId:", personId);

    if (!user || !personId) {
      console.warn("User data or personId not found, proceeding without auth token");
      return { headers: {}, personId: null };
    }

    const headers = {
      "Content-Type": "application/json",
    };
    const token = user.token || getTokenFromRedux();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("Using token for Authorization:", token.slice(0, 20) + "...");
    } else {
      console.warn("No token found in user data or Redux, proceeding without Authorization header");
    }

    return { headers, personId };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return { headers: {}, personId: null };
  }
};

// Get Sales Quotation parcels by ID
export const fetchSalesQuotationParcels = async (salesQuotationId) => {
  try {
    const { headers } = getAuthHeader();
    if (!salesQuotationId) {
      return [];
    }

    const response = await axios.get(
      `${APIBASEURL}/sales-quotation-parcels?salesQuotationId=${salesQuotationId}`,
      { headers }
    );
    if (response.data && response.data.data) {
      const parcels = response.data.data;

      let uomMap = {};
      try {
        const uomResponse = await axios.get(`${APIBASEURL}/uoms`, { headers });
        if (uomResponse.data && uomResponse.data.data) {
          uomMap = uomResponse.data.data.reduce((acc, uom) => {
            console.log("UOM object structure:", JSON.stringify(uom));
            const uomName =
              uom.UOM || uom.UOMName || uom.Name || uom.Description;
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

      let itemMap = {};
      try {
        const itemResponse = await axios.get(`${APIBASEURL}/items`, { headers });
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

      const enhancedParcels = parcels.map((parcel) => {
        console.log("Processing parcel:", parcel);
        if (parcel.ItemID && itemMap[parcel.ItemID]) {
          parcel.ItemName = itemMap[parcel.ItemID];
        }
        if (parcel.UOMID && uomMap[parcel.UOMID]) {
          parcel.UOMName = uomMap[parcel.UOMID];
        }
        return parcel;
      });

      return enhancedParcels;
    }
    return [];
  } catch (error) {
    console.error("Error fetching Sales Quotation parcels:", error);
    try {
      const { headers } = getAuthHeader();
      const response = await axios.get(
        `${APIBASEURL}/sales-quotation-parcels`,
        { headers }
      );
      if (response.data && response.data.data) {
        const filteredParcels = response.data.data.filter(
          (parcel) =>
            String(parcel.SalesQuotationId) === String(salesQuotationId)
        );

        const uomIds = filteredParcels.map((p) => p.UOMID).filter((id) => id);
        if (uomIds.length > 0) {
          try {
            const uomResponse = await axios.get(`${APIBASEURL}/uoms`, { headers });
            if (uomResponse.data && uomResponse.data.data) {
              const uomMap = uomResponse.data.data.reduce((acc, uom) => {
                acc[uom.UOMID] = uom.UOMName;
                acc[String(uom.UOMID)] = uom.UOMName;
                return acc;
              }, {});
              filteredParcels.forEach((parcel) => {
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

// Fetch Purchase RFQs for dropdown, filtered by those with Supplier Quotations
export const fetchPurchaseRFQs = async () => {
  try {
    const { headers } = getAuthHeader();
    console.log("Fetching Purchase RFQs from:", `${APIBASEURL}/purchase-rfq`);
    const purchaseRFQResponse = await axios.get(`${APIBASEURL}/purchase-rfq`, { headers });
    console.log("Purchase RFQs API Response:", purchaseRFQResponse.data);

    if (purchaseRFQResponse.data && purchaseRFQResponse.data.data) {
      const purchaseRFQs = purchaseRFQResponse.data.data;

      console.log("Fetching Supplier Quotations from:", `${APIBASEURL}/supplier-Quotation`);
      const supplierQuotationResponse = await axios.get(
        `${APIBASEURL}/supplier-Quotation`,
        { headers }
      );
      console.log("Supplier Quotations API Response:", supplierQuotationResponse.data);

      const purchaseRFQIDsWithQuotations = new Set();
      if (supplierQuotationResponse.data && supplierQuotationResponse.data.data) {
        supplierQuotationResponse.data.data.forEach((quotation) => {
          if (quotation.PurchaseRFQID) {
            purchaseRFQIDsWithQuotations.add(String(quotation.PurchaseRFQID));
          }
        });
      }
      console.log("Purchase RFQ IDs with Supplier Quotations:", [...purchaseRFQIDsWithQuotations]);

      const filteredRFQs = purchaseRFQs.filter((rfq) =>
        purchaseRFQIDsWithQuotations.has(String(rfq.PurchaseRFQID || rfq.id))
      );

      const formattedRFQs = filteredRFQs.map((rfq) => {
        const formatted = {
          value: String(rfq.PurchaseRFQID || rfq.id),
          label: rfq.Series || `RFQ #${rfq.PurchaseRFQID || rfq.id}`,
        };
        console.log("Formatted RFQ:", formatted);
        return formatted;
      });
      console.log("Formatted Purchase RFQs:", formattedRFQs);

      return formattedRFQs;
    } else {
      console.warn("No data found in Purchase RFQs response:", purchaseRFQResponse.data);
      return [];
    }
  } catch (error) {
    console.error(
      "Error fetching Purchase RFQs or Supplier Quotations:",
      error.response?.data || error.message
    );
    return [];
  }
};

// Create a new Sales Quotation
export const createSalesQuotation = async (data) => {
  try {
    const { headers, personId } = getAuthHeader();
    console.log("Creating Sales Quotation with personId:", personId);
    console.log("Headers for create request:", headers);

    if (!personId) {
      throw new Error("User not logged in. Please log in again.");
    }

    const payload = {
      ...data,
      CreatedByID: Number(personId),
    };

    console.log("Creating Sales Quotation with data:", payload);
    const response = await axios.post(
      `${APIBASEURL}/sales-Quotation`,
      payload,
      { headers }
    );
    console.log("Create Sales Quotation Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Sales Quotation:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};