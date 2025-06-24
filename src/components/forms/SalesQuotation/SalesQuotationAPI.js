import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

const getTokenFromRedux = () => {
  try {
    const state = window.__REDUX_STATE__ || {};
    console.log("Full Redux state:", JSON.stringify(state, null, 2));
    const token = state.loginReducer?.loginDetails?.token || null;
    console.log("Redux token:", token ? token.slice(0, 20) + "..." : "null");

    if (!token) {
      const localToken = localStorage.getItem("token");
      console.log(
        "LocalStorage token:",
        localToken ? localToken.slice(0, 20) + "..." : "null"
      );
      return localToken || null;
    }

    return token;
  } catch (error) {
    console.error("Error accessing Redux state for token:", error);
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

    let token = user.token || getTokenFromRedux();
    console.log(
      "Token from user or Redux:",
      token ? token.slice(0, 20) + "..." : "null"
    );

    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log(
        "Authorization header set with token:",
        token.slice(0, 20) + "..."
      );
    } else {
      console.error(
        "No token found in user data or Redux. Requests may fail with 401 Unauthorized."
      );
    }

    return { headers, personId };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return { headers: {}, personId: null };
  }
};

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
      let priorityMap = {};

      // Fetch addresses
      try {
        console.log(`Fetching addresses from: ${APIBASEURL}/addresses`);
        const addressResponse = await axios.get(`${APIBASEURL}/addresses`, { headers });
        console.log("Address API Raw Response:", addressResponse.data);
        if (addressResponse.data && addressResponse.data.data) {
          addressMap = addressResponse.data.data.reduce((acc, address) => {
            if (address.AddressID) {
              acc[address.AddressID] = {
                AddressLine1: address.AddressLine1 || "Unknown",
                City: address.City || "Unknown",
                AddressTitle: address.AddressTitle || "Unknown",
              };
              acc[String(address.AddressID)] = acc[address.AddressID];
            }
            return acc;
          }, {});
          console.log("Address Map:", addressMap);
        }
      } catch (err) {
        console.error("Could not fetch addresses:", err.response?.data || err.message);
      }

      // Fetch currencies
      try {
        console.log(`Fetching currencies from: ${APIBASEURL}/currencies`);
        const currencyResponse = await axios.get(`${APIBASEURL}/currencies`, { headers });
        console.log("Currency API Raw Response:", currencyResponse.data);
        if (currencyResponse.data && currencyResponse.data.data) {
          currencyMap = currencyResponse.data.data.reduce((acc, currency) => {
            if (currency.CurrencyID && currency.CurrencyName) {
              acc[currency.CurrencyID] = currency.CurrencyName;
              acc[String(currency.CurrencyID)] = currency.CurrencyName;
            }
            return acc[String(key)]
          }, {});
          console.log("Currency Map:", currencyMap);
        }
      } catch (err) {
        console.error("Could not fetch currencies:", err.response?.data || err.message);
      }

      // Fetch mailing priorities
      try {
        console.log(`Fetching mailing priorities from: ${APIBASEURL}/mailing-priorities`);
        const priorityResponse = await axios.get(`${APIBASEURL}/mailing-priorities`, { headers });
        console.log("Mailing Priorities API Raw Response:", priorityResponse.data);
        if (priorityResponse.data && priorityResponse.data.data) {
          priorityMap = priorityResponse.data.data.reduce((acc, priority) => {
            if (priority.MailingPriorityID) {
              acc[priority.MailingPriorityID] = priority.PriorityName || priority.MailingPriorityName || "Unknown";
              acc[String(priority.MailingPriorityID)] = acc[priority.MailingPriorityID];
            }
            return acc;
          }, {});
          console.log("Priority Map:", priorityMap);
        }
      } catch (err) {
        console.error("Could not fetch mailing priorities:", err.response?.data || err.message);
      }

      // Map CollectionAddress and DestinationAddress as AddressLine1 + City
      quotation.CollectionAddress = quotation.CollectionAddressID
        ? addressMap[quotation.CollectionAddressID]
          ? `${addressMap[quotation.CollectionAddressID].AddressLine1}, ${addressMap[quotation.CollectionAddressID].City}`
          : `Address ID: ${quotation.CollectionAddressID}`
        : "-";
      quotation.DestinationAddress = quotation.DestinationAddressID
        ? addressMap[quotation.DestinationAddressID]
          ? `${addressMap[quotation.DestinationAddressID].AddressLine1}, ${addressMap[quotation.DestinationAddressID].City}`
          : `Address ID: ${quotation.DestinationAddressID}`
        : "-";
      quotation.CurrencyName = quotation.CurrencyID
        ? currencyMap[quotation.CurrencyID] || `Currency ID: ${quotation.CurrencyID}`
        : "-";
      quotation.ShippingPriorityName = quotation.ShippingPriorityID
        ? priorityMap[quotation.ShippingPriorityID] || `Priority ID: ${quotation.ShippingPriorityID}`
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

export const fetchSalesQuotationParcels = async (salesQuotationId) => {
  try {
    const { headers } = getAuthHeader();
    if (!salesQuotationId) {
      console.warn("No salesQuotationId provided, returning empty parcels");
      return [];
    }

    console.log(
      `Fetching parcels for SalesQuotationID ${salesQuotationId} from: ${APIBASEURL}/sales-Quotation-Parcel?SalesQuotationID=${salesQuotationId}`
    );
    const response = await axios.get(
      `${APIBASEURL}/sales-Quotation-Parcel/?salesQuotationId=${salesQuotationId}`,
      { headers }
    );
    console.log("Sales Quotation Parcels API Response:", response.data);
    if (response.data && response.data.data) {
      const parcels = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];

      let uomMap = {};
      try {
        const uomResponse = await axios.get(`${APIBASEURL}/uoms`, { headers });
        console.log("UOMs API Raw Response:", uomResponse.data);
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
        console.log("Items API Raw Response:", itemResponse.data);
        if (itemResponse.data && itemResponse.data.data) {
          itemMap = itemResponse.data.data.reduce((acc, item) => {
            const itemName =
              item.ItemName || item.Description || "Unknown Item";
            acc[item.ItemID] = itemName;
            acc[String(item.ItemID)] = itemName;
            return acc;
          }, {});
          console.log("Item Map:", itemMap);
        }
      } catch (err) {
        console.error(
          "Error fetching items:",
          err.response?.data || err.message
        );
      }

      const enhancedParcels = parcels.map((parcel) => {
        console.log("Processing parcel:", parcel);
        parcel.ItemName =
          parcel.ItemID && itemMap[parcel.ItemID]
            ? itemMap[parcel.ItemID]
            : "Unknown Item";
        parcel.UOMName =
          parcel.UOMID && uomMap[parcel.UOMID] ? uomMap[parcel.UOMID] : "-";
        parcel.SupplierRate = parseFloat(parcel.SupplierRate) || 0;
        parcel.SupplierAmount = parseFloat(parcel.SupplierAmount) || 0;
        parcel.SalesRate = parseFloat(parcel.SalesRate) || 0;
        parcel.SalesAmount = parseFloat(parcel.SalesAmount) || 0;
        parcel.SupplierQuotationParcelID =
          parcel.SupplierQuotationParcelID || null;
        console.log("Enhanced parcel:", parcel);
        return parcel;
      });

      console.log("Enhanced Parcels:", enhancedParcels);
      return enhancedParcels;
    }
    console.warn("No parcels found in response:", response.data);
    return [];
  } catch (error) {
    console.error(
      `Error fetching parcels for SalesQuotationID ${salesQuotationId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

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
      createdById: Number(personId),
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

export const updateSalesQuotation = async (SalesQuotationID, data) => {
  try {
    const { headers, personId } = getAuthHeader();
    console.log(
      `Updating Sales Quotation ID ${SalesQuotationID} with personId:`,
      personId
    );
    if (!personId) {
      throw new Error("User not logged in. Please log in again.");
    }

    const payload = {
      ...data,
      UpdatedByID: Number(personId),
    };

    console.log("Updating Sales Quotation with data:", payload);
    const response = await axios.put(
      `${APIBASEURL}/sales-Quotation/${SalesQuotationID}`,
      payload,
      { headers }
    );
    console.log("Update Sales Quotation Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error updating Sales Quotation ${SalesQuotationID}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const updateSalesQuotationParcels = async (parcels) => {
  try {
    const { headers, personId } = getAuthHeader();
    console.log("Updating Sales Quotation Parcels with data:", parcels);

    if (!personId) {
      throw new Error("User not logged in. Please log in again.");
    }

    const responses = await Promise.all(
      parcels.map((parcel) =>
        axios.put(
          `${APIBASEURL}/sales-Quotation-Parcel/${parcel.SalesQuotationParcelID}`,
          {
            salesQuotationParcelId: parcel.SalesQuotationParcelID,
            salesQuotationId: Number(parcel.SalesQuotationID),
            supplierQuotationParcelId: parcel.SupplierQuotationParcelID,
            salesRate: parcel.SalesRate,
            // salesAmount: parcel.SalesAmount,
            createdById: Number(personId),
          },
          { headers }
        )
      )
    );

    console.log("Update Sales Quotation Parcels Responses:", responses);
    return responses;
  } catch (error) {
    console.error(
      "Error updating Sales Quotation Parcels:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

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
      SalesQuotationID,
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
    return "Pending";
  } catch (error) {
    console.error("Error fetching Sales Quotation status:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return "Pending";
  }
};

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
    return "Pending";
  }
};

export const fetchCustomerById = async (customerId) => {
  try {
    const { headers } = getAuthHeader();
    console.log("Fetching Customer with ID:", customerId);
    const response = await axios.get(`${APIBASEURL}/customers/${customerId}`, {
      headers,
    });
    console.log("Fetched Customer:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching Customer:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const sendSalesQuotation = async (salesQuotationId) => {
  try {
    const { headers } = getAuthHeader();
    console.log("Preparing to send Sales Quotation with ID:", salesQuotationId);
    const payload = { salesQuotationID: parseInt(salesQuotationId) };
    console.log("Sending payload:", payload);
    console.log("Request headers:", headers);
    console.log("Request URL:", `${APIBASEURL}/send-sales-quotation`);
    const response = await axios.post(
      `${APIBASEURL}/send-sales-quotation/send-sales-quotation`,
      payload,
      { headers }
    );
    console.log("Send Sales Quotation Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending Sales Quotation:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error.response?.data || error;
  }
};
