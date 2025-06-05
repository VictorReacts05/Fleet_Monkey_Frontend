import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

const getTokenFromRedux = () => {
  try {
    const state = window.__REDUX_STATE__ || {};
    return state.loginReducer?.token || null;
  } catch {
    return null;
  }
};

export const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log(
      "Raw user data from localStorage:",
      localStorage.getItem("user")
    );
    console.log("Parsed user data:", user);
    const personId = user?.personId || user?.id || user?.userId || null;
    console.log("Extracted personId:", personId);

    if (!user || !personId) {
      console.warn(
        "User data or personId not found, proceeding without auth token"
      );
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
      console.warn(
        "No token found in user data or Redux, proceeding without Authorization header"
      );
    }

    return { headers, personId };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return { headers: {}, personId: null };
  }
};

// Fetch a single Sales Quotation by ID
export const fetchSalesQuotation = async (SalesQuotationID) => {
  try {
    const { headers } = getAuthHeader();
    console.log(
      `Fetching Sales Quotation ID ${SalesQuotationID} from: ${APIBASEURL}/sales-Quotation/${SalesQuotationID}`
    );
    const response = await axios.get(
      `${APIBASEURL}/sales-Quotation/${SalesQuotationID}`,
      { headers }
    );
    console.log("Sales Quotation API Response:", response.data);
    if (response.data && response.data.data) {
      const quotation = response.data.data;

      let addressMap = {};
      let currencyMap = {};

      try {
        console.log(
          "Fetching addresses from: http://localhost:7000/api/addresses"
        );
        const addressResponse = await axios.get(
          "http://localhost:7000/api/addresses",
          { headers }
        );
        console.log("Address API Raw Response:", addressResponse.data);
        if (addressResponse.data && addressResponse.data.data) {
          addressMap = addressResponse.data.data.reduce((acc, address) => {
            if (address.AddressID && address.AddressTitle) {
              acc[address.AddressID] = address.AddressTitle;
              acc[String(address.AddressID)] = address.AddressTitle;
            }
            return acc;
          }, {});
          console.log("Address Map:", addressMap);
        }
      } catch (err) {
        console.error(
          "Could not fetch addresses:",
          err.response?.data || err.message
        );
      }

      try {
        console.log(
          "Fetching currencies from: http://localhost:7000/api/currencies"
        );
        const currencyResponse = await axios.get(
          "http://localhost:7000/api/currencies",
          { headers }
        );
        console.log("Currency API Raw Response:", currencyResponse.data);
        if (currencyResponse.data && currencyResponse.data.data) {
          currencyMap = currencyResponse.data.data.reduce((acc, currency) => {
            if (currency.CurrencyID && currency.CurrencyName) {
              acc[currency.CurrencyID] = currency.CurrencyName;
              acc[String(currency.CurrencyID)] = currency.CurrencyName;
            }
            return acc;
          }, {});
          console.log("Currency Map:", currencyMap);
        }
      } catch (err) {
        console.error(
          "Could not fetch currencies:",
          err.response?.data || err.message
        );
      }

      quotation.CollectionAddressTitle = quotation.CollectionAddressID
        ? addressMap[quotation.CollectionAddressID] ||
          `Address ID: ${quotation.CollectionAddressID}`
        : "-";
      quotation.DestinationAddressTitle = quotation.DestinationAddressID
        ? addressMap[quotation.DestinationAddressID] ||
          `Address ID: ${quotation.DestinationAddressID}`
        : "-";
      quotation.CurrencyName = quotation.CurrencyID
        ? currencyMap[quotation.CurrencyID] ||
          `Currency ID: ${quotation.CurrencyID}`
        : "-";

      return quotation;
    }
    console.warn("No data found in Sales Quotation response:", response.data);
    return null;
  } catch (error) {
    console.error(
      `Error fetching Sales Quotation ${SalesQuotationID}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Get Sales Quotation parcels by SalesQuotationID
export const fetchSalesQuotationParcels = async (SalesQuotationParcelID) => {
  try {
    const { headers } = getAuthHeader();
    if (!SalesQuotationParcelID) {
      console.warn("No SalesQuotationParcelID provided, returning empty parcels");
      return [];
    }
    
    const response = await axios.get(
      `${APIBASEURL}/sales-Quotation-Parcel/${SalesQuotationParcelID}`,
      { headers }
    );
    console.log("Sales Quotation Parcels API Response:", response.data);
    if (response.data && response.data.data) {
      const parcels = response.data.data;

      let uomMap = {};
      try {
        const uomResponse = await axios.get(`${APIBASEURL}/uoms`, { headers });
        if (uomResponse.data && uomResponse.data.data) {
          uomMap = uomResponse.data.data.reduce((acc, uom) => {
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
        console.error(
          "Could not fetch UOMs:",
          err.response?.data || err.message
        );
      }

      let itemMap = {};
      try {
        const itemResponse = await axios.get(`${APIBASEURL}/items`, {
          headers,
        });
        if (itemResponse.data && itemResponse.data.data) {
          itemMap = itemResponse.data.data.reduce((acc, item) => {
            acc[item.ItemID] = item.ItemName || item.Description;
            acc[String(item.ItemID)] = item;
            return acc;
          }, {});
          console.log("Item Map:", itemMap);
        }
      } catch (err) {
        console.error(
          "Could not fetch items:",
          err.response?.data || err.message
        );
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
    console.warn("No parcels found in response:", response.data);
    return [];
  } catch (error) {
    console.error(
      `Error fetching parcels for SalesQuotationID ${SalesQuotationID}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Fetch Purchase RFQs for dropdown, filtered by those with Supplier Quotations
export const fetchPurchaseRFQs = async () => {
  try {
    const { headers } = getAuthHeader();
    console.log("Fetching Purchase RFQs from:", `${APIBASEURL}/purchase-rfq`);
    const purchaseRFQResponse = await axios.get(`${APIBASEURL}/purchase-rfq`, {
      headers,
    });
    console.log("Purchase RFQs API Response:", purchaseRFQResponse.data);

    if (purchaseRFQResponse.data && purchaseRFQResponse.data.data) {
      const purchaseRFQs = purchaseRFQResponse.data.data;

      console.log(
        "Fetching Supplier Quotations from:",
        `${APIBASEURL}/supplier-Quotation`
      );
      const supplierQuotationResponse = await axios.get(
        `${APIBASEURL}/supplier-Quotation`,
        { headers }
      );
      console.log(
        "Supplier Quotations API Response:",
        supplierQuotationResponse.data
      );

      const purchaseRFQIDsWithQuotations = new Set();
      if (
        supplierQuotationResponse.data &&
        supplierQuotationResponse.data.data
      ) {
        supplierQuotationResponse.data.data.forEach((quotation) => {
          if (quotation.PurchaseRFQID) {
            purchaseRFQIDsWithQuotations.add(String(quotation.PurchaseRFQID));
          }
        });
      }
      console.log("Purchase RFQ IDs with Supplier Quotations:", [
        ...purchaseRFQIDsWithQuotations,
      ]);

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
      console.warn(
        "No data found in Purchase RFQs response:",
        purchaseRFQResponse.data
      );
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

// Approve a Sales Quotation
export const approveSalesQuotation = async (SalesQuotationID) => {
  try {
    const { headers, personId } = getAuthHeader();
    console.log(
      `Approving Sales Quotation with ID: ${SalesQuotationID}, ApproverID: ${personId}`
    );

    if (!personId) {
      throw new Error("No personId found for approval");
    }

    const response = await axios.post(
      `${APIBASEURL}/sales-Quotation/approve`,
      {
        SalesQuotationID: Number(SalesQuotationID),
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
      SalesQuotationID, // Fixed typo: was SalesQuotationID
    };
  } catch (error) {
    console.error("Error approving Sales Quotation:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error.response?.data || error;
  }
};

// Fetch approval status for a Sales Quotation
export const fetchSalesQuotationApprovalStatus = async (SalesQuotationID) => {
  try {
    const { headers } = getAuthHeader();

    const response = await axios.get(
      `${APIBASEURL}/sales-Quotation/${SalesQuotationID}`,
      { headers }
    );

    if (response.data && response.data.data) {
      const status = response.data.data.Status;
      return {
        SalesQuotationID: SalesQuotationID,
        ApprovedYN: status === "Approved" ? true : false,
        ApproverDateTime: new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching Sales Quotation status:", error);
    throw error;
  }
};

// Fetch global Sales Quotation status
export const fetchSalesQuotationStatus = async (SalesQuotationID) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(
      `${APIBASEURL}/sales-Quotation/${SalesQuotationID}`,
      { headers }
    );

    console.log(
      "Fetched Sales Quotation status for ID:",
      SalesQuotationID,
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
    return "Pending"; // Default to Pending
  } catch (error) {
    console.error("Error fetching Sales Quotation status:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return "Pending"; // Fallback to Pending
  }
};

// Fetch user-specific approval status
export const fetchUserApprovalStatus = async (SalesQuotationID, approverId) => {
  try {
    const { headers } = getAuthHeader();
    console.log("Fetching approval status with params:", {
      SalesQuotationID,
      approverId,
    });
    const response = await axios.get(
      `${APIBASEURL}/sales-Quotation-Approvals/${SalesQuotationID}/${approverId}`,
      { headers }
    );

    console.log(
      "Full API response for SalesQuotationID:",
      SalesQuotationID,
      "ApproverID:",
      approverId,
      {
        status: response.status,
        data: response.data,
      }
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
    return "Pending"; // Fallback to Pending
  }
};
