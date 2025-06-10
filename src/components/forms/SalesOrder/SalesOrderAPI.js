import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl"; // Adjust path as needed

export const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Raw user data from localStorage:", localStorage.getItem("user"));
    console.log("Parsed user data:", user);
    const personId = user?.personId || user?.id || user?.userId || null;
    console.log("Extracted personId:", personId);

    if (!user || !personId) {
      console.warn("User data or personId not found, redirecting to login");
      window.location.href = "/"; // Redirect to login page
      throw new Error("User not authenticated");
    }

    const headers = {
      "Content-Type": "application/json",
    };
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("Using token for Authorization:", token.slice(0, 20) + "...");
    } else {
      console.warn("No token found in localStorage, redirecting to login");
      window.location.href = "/"; // Redirect to login page
      throw new Error("No token found");
    }

    return { headers, personId };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    window.location.href = "/"; // Redirect to login page
    throw error;
  }
};

// Fetch a single Sales Order by ID
export const fetchSalesOrder = async (SalesOrderID) => {
  try {
    const { headers } = getAuthHeader();
    console.log(
      `Fetching Sales Order ID ${SalesOrderID} from: ${APIBASEURL}/sales-order/${SalesOrderID}`
    );
    const response = await axios.get(
      `${APIBASEURL}/sales-order/${SalesOrderID}`,
      { headers }
    );
    console.log("Sales Order API Response:", response.data);
    if (response.data && response.data.data) {
      const order = response.data.data;

      let addressMap = {};
      let currencyMap = {};
      let serviceTypeMap = {};
      let shippingPriorityMap = {};

      try {
        console.log("Fetching addresses from: http://localhost:7000/api/addresses");
        const addressResponse = await axios.get(
          `${APIBASEURL}/addresses`,
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
        console.error("Could not fetch addresses:", err.response?.data || err.message);
      }

      try {
        console.log("Fetching currencies from: http://localhost:7000/api/currencies");
        const currencyResponse = await axios.get(
          `${APIBASEURL}/currencies`,
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
        console.error("Could not fetch currencies:", err.response?.data || err.message);
      }

      try {
        console.log("Fetching service types from: http://localhost:7000/api/service-types");
        const serviceTypeResponse = await axios.get(
          `${APIBASEURL}/service-types`,
          { headers }
        );
        console.log("Service Type API Raw Response:", serviceTypeResponse.data);
        if (serviceTypeResponse.data && serviceTypeResponse.data.data) {
          serviceTypeMap = serviceTypeResponse.data.data.reduce((acc, serviceType) => {
            if (serviceType.ServiceTypeID && serviceType.ServiceType) {
              acc[serviceType.ServiceTypeID] = serviceType.ServiceType;
              acc[String(serviceType.ServiceTypeID)] = serviceType.ServiceType;
            }
            return acc;
          }, {});
          console.log("Service Type Map:", serviceTypeMap);
        }
      } catch (err) {
        console.error("Could not fetch service types:", err.response?.data || err.message);
      }

      try {
        console.log("Fetching shipping priorities from: http://localhost:7000/api/shipping-priorities");
        const shippingPriorityResponse = await axios.get(
          `${APIBASEURL}/shipping-priorities`,
          { headers }
        );
        console.log("Shipping Priority API Raw Response:", shippingPriorityResponse.data);
        if (shippingPriorityResponse.data && shippingPriorityResponse.data.data) {
          shippingPriorityMap = shippingPriorityResponse.data.data.reduce((acc, priority) => {
            if (priority.ShippingPriorityID && priority.PriorityName) {
              acc[priority.ShippingPriorityID] = priority.PriorityName;
              acc[String(priority.ShippingPriorityID)] = priority.PriorityName;
            }
            return acc;
          }, {});
          console.log("Shipping Priority Map:", shippingPriorityMap);
        }
      } catch (err) {
        console.error("Could not fetch shipping priorities:", err.response?.data || err.message);
      }

      order.CollectionAddressTitle = order.CollectionAddressID
        ? addressMap[order.CollectionAddressID] || `Address ID: ${order.CollectionAddressID}`
        : "-";
      order.DestinationAddressTitle = order.DestinationAddressID
        ? addressMap[order.DestinationAddressID] || `Address ID: ${order.DestinationAddressID}`
        : "-";
      order.CurrencyName = order.CurrencyID
        ? currencyMap[order.CurrencyID] || `Currency ID: ${order.CurrencyID}`
        : "-";
      order.ServiceType = order.ServiceTypeID
        ? serviceTypeMap[order.ServiceTypeID] || `Service Type ID: ${order.ServiceTypeID}`
        : "-";
      order.ShippingPriorityName = order.ShippingPriorityID
        ? shippingPriorityMap[order.ShippingPriorityID] || `Priority ID: ${order.ShippingPriorityID}`
        : "-";

      return order;
    }
    console.warn("No data found in Sales Order response:", response.data);
    return null;
  } catch (error) {
    console.error(
      `Error fetching Sales Order ${SalesOrderID}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Get Sales Order parcels by SalesOrderID
export const fetchSalesOrderParcels = async (SalesOrderID) => {
  try {
    const { headers } = getAuthHeader();
    if (!SalesOrderID) {
      console.warn("No SalesOrderID provided, returning empty parcels");
      return [];
    }

    const response = await axios.get(
      `${APIBASEURL}/sales-order/parcels/${SalesOrderID}`, // Updated endpoint
      { headers }
    );
    console.log("Sales Order Parcels API Response:", response.data);
    if (response.data && response.data.data) {
      const parcels = response.data.data;

      let uomMap = {};
      try {
        const uomResponse = await axios.get(`${APIBASEURL}/uoms`, { headers });
        if (uomResponse.data && uomResponse.data.data) {
          uomMap = uomResponse.data.data.reduce((acc, uom) => {
            const uomName = uom.UOM || uom.UOMName || uom.Name || uom.Description;
            if (uom.UOMID && uomName) {
              acc[uom.UOMID] = uomName;
              acc[String(uom.UOMID)] = uomName;
            }
            return acc;
          }, {});
          console.log("UOM Map:", uomMap);
        }
      } catch (err) {
        console.error("Could not fetch UOMs:", err.response?.data || err.message);
      }

      let itemMap = {};
      try {
        const itemResponse = await axios.get(`${APIBASEURL}/items`, { headers });
        if (itemResponse.data && itemResponse.data.data) {
          itemMap = itemResponse.data.data.reduce((acc, item) => {
            acc[item.ItemID] = item.ItemName || item.Description;
            acc[String(item.ItemID)] = item;
            return acc;
          }, {});
          console.log("Item Map:", itemMap);
        }
      } catch (err) {
        console.error("Could not fetch items:", err.response?.data || err.message);
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
      `Error fetching parcels for SalesOrderID ${SalesOrderID}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Fetch global Sales Order status
export const fetchSalesOrderStatus = async (SalesOrderID) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(
      `${APIBASEURL}/sales-order/${SalesOrderID}`,
      { headers }
    );

    console.log(
      "Fetched Sales Order status for ID:",
      SalesOrderID,
      response.data
    );

    if (response.data && response.data.data) {
      const status = response.data.data.Status || response.data.data.status;
      if (status) {
        console.log("Parsed status:", status);
        return status;
      }
    } else if (response.data && (response.data.Status || response.data.status)) {
      const status = response.data.Status || response.data.status;
      console.log("Parsed status:", status);
      return status;
    }

    console.warn("Status field not found in response:", response.data);
    return "Pending"; // Default to Pending
  } catch (error) {
    console.error("Error fetching Sales Order status:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return "Pending"; // Fallback to Pending
  }
};

// Fetch user-specific approval status for a Sales Order
export const fetchUserApprovalStatus = async (SalesOrderID, approverId) => {
  try {
    const { headers } = getAuthHeader();
    console.log("Fetching approval status with params:", {
      SalesOrderID,
      approverId,
    });
    const response = await axios.get(
      `${APIBASEURL}/sales-order/approvals/${SalesOrderID}/${approverId}`, // Updated endpoint
      { headers }
    );

    console.log(
      "Full API response for SalesOrderID:",
      SalesOrderID,
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

// Approve a Sales Order
export const approveSalesOrder = async (SalesOrderID) => {
  try {
    const { headers, personId } = getAuthHeader();
    console.log(
      `Approving Sales Order with ID: ${SalesOrderID}, ApproverID: ${personId}`
    );

    if (!personId) {
      throw new Error("No personId found for approval");
    }

    const response = await axios.post(
      `${APIBASEURL}/sales-order/approve`,
      {
        SalesOrderID: Number(SalesOrderID),
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
      SalesOrderID,
    };
  } catch (error) {
    console.error("Error approving Sales Order:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error.response?.data || error;
  }
};

// Fetch approval status for a Sales Order
export const fetchSalesOrderApprovalStatus = async (SalesOrderID) => {
  try {
    const { headers } = getAuthHeader();

    const response = await axios.get(
      `${APIBASEURL}/sales-order/${SalesOrderID}`,
      { headers }
    );

    if (response.data && response.data.data) {
      const status = response.data.data.Status;
      return {
        SalesOrderID: SalesOrderID,
        ApprovedYN: status === "Approved" ? true : false,
        ApproverDateTime: new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching Sales Order approval status:", error);
    throw error;
  }
};

// Fetch address by AddressID
export const fetchAddress = async (addressId) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(
      `${APIBASEURL}/addresses/${addressId}`,
      { headers }
    );
    console.log(`Address API Response for AddressID ${addressId}:`, response.data);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    console.warn(`No address data found for AddressID ${addressId}:`, response.data);
    return null;
  } catch (error) {
    console.error(
      `Error fetching address for AddressID ${addressId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Fetch service types
export const fetchServiceTypes = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/service-types`, { headers });
    console.log("Service Types API Response:", response.data);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    console.warn("No service types found in response:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching service types:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Fetch shipping priorities
export const fetchShippingPriorities = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/shipping-priorities`, { headers });
    console.log("Shipping Priorities API Response:", response.data);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    console.warn("No shipping priorities found in response:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching shipping priorities:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Fetch currencies
export const fetchCurrencies = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/currencies`, { headers });
    console.log("Currencies API Response:", response.data);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    console.warn("No currencies found in response:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching currencies:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Fetch all Sales Orders with pagination
export const fetchSalesOrders = async (page = 1, limit = 10) => {
  try {
    const { headers } = getAuthHeader();
    console.log(
      `Fetching Sales Orders from: ${APIBASEURL}/sales-order?page=${page}&limit=${limit}`
    );
    const response = await axios.get(
      `${APIBASEURL}/sales-order?page=${page}&limit=${limit}`,
      { headers }
    );
    console.log("Sales Orders API Response:", response.data);
    if (response.data && response.data.data) {
      return {
        data: response.data.data,
        total: response.data.total || response.data.data.length,
      };
    }
    console.warn("No data found in Sales Orders response:", response.data);
    return { data: [], total: 0 };
  } catch (error) {
    console.error(
      `Error fetching Sales Orders:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Delete a Sales Order by ID
export const deleteSalesOrder = async (salesOrderId) => {
  try {
    const { headers } = getAuthHeader();
    console.log(
      `Deleting Sales Order ID ${salesOrderId} at: ${APIBASEURL}/sales-order/${salesOrderId}`
    );
    const response = await axios.delete(
      `${APIBASEURL}/sales-order/${salesOrderId}`,
      { headers }
    );
    console.log("Delete Sales Order Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting Sales Order ${salesOrderId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Create a new Sales Order
export const createSalesOrder = async (data) => {
  try {
    const { headers, personId } = getAuthHeader();
    console.log("Creating Sales Order with personId:", personId);
    console.log("Headers for create request:", headers);

    if (!personId) {
      throw new Error("User not logged in. Please log in again.");
    }

    const payload = {
      ...data,
      CreatedByID: Number(personId),
    };

    console.log("Creating Sales Order with data:", payload);
    const response = await axios.post(
      `${APIBASEURL}/sales-order`,
      payload,
      { headers }
    );
    console.log("Create Sales Order Response:", response.data);
    return response.data; // Ensure this includes SalesOrderID
  } catch (error) {
    console.error(
      "Error creating Sales Order:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Fetch Sales Quotations for dropdown (filtered by approved status)
export const fetchSalesQuotations = async () => {
  try {
    const { headers } = getAuthHeader();
    console.log("Fetching Sales Quotations from:", `${APIBASEURL}/sales-quotation`);
    const salesQuotationResponse = await axios.get(`${APIBASEURL}/sales-quotation`, {
      headers,
    });
    console.log("Sales Quotations API Response:", salesQuotationResponse.data);

    if (salesQuotationResponse.data && salesQuotationResponse.data.data) {
      const quotations = salesQuotationResponse.data.data;

      // Filter for approved quotations (Status === "Approved")
      const approvedQuotations = quotations.filter(
        (quotation) => quotation.Status === "Approved"
      );

      console.log("Approved Sales Quotations:", approvedQuotations);

      const formattedQuotations = approvedQuotations.map((quotation) => {
        const formatted = {
          value: String(quotation.SalesQuotationID || quotation.id),
          label: quotation.Series || `Quotation #${quotation.SalesQuotationID || quotation.id}`,
        };
        console.log("Formatted Quotation:", formatted);
        return formatted;
      });
      console.log("Formatted Sales Quotations:", formattedQuotations);

      return formattedQuotations;
    } else {
      console.warn(
        "No data found in Sales Quotations response:",
        salesQuotationResponse.data
      );
      return [];
    }
  } catch (error) {
    console.error(
      "Error fetching Sales Quotations:",
      error.response?.data || error.message
    );
    return [];
  }
};