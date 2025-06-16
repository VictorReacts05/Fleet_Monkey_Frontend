import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

export const getAuthHeader = (user = null) => {
  try {
    let token = null;
    let personId = null;

    // Try to get token and personId from user object
    if (user) {
      personId =
        user?.personId ||
        user?.PersonID ||
        user?.id ||
        user?.UserID ||
        user?.ID ||
        null;
      token = user?.token || user?.Token;
    }

    // Fall back to localStorage if token or personId is missing
    if (!token || !personId) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const storedToken = localStorage.getItem("token");
      if (storedUser?.personId && storedToken) {
        personId = storedUser.personId;
        token = storedToken;
      } else {
        console.warn(
          "No valid token or personId found in user data or localStorage"
        );
        return { headers: {}, personId: "" };
      }
    }

    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found, proceeding without Authorization header");
    }

    return { headers, personId };
  } catch (error) {
    console.error("Error processing auth data:", error);
    return { headers: {}, personId: "" };
  }
};

export const fetchItems = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/items`, { headers }); // Adjust endpoint if needed
    // console.log("fetchItems response:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("fetchItems error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const fetchUOMs = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/uoms`, { headers }); // Adjust endpoint if needed
    // console.log("fetchUOMs response:", response.data);
    const data = response.data.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("fetchUOMs error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const fetchSalesInvoices = async (page = 1, pageSize = 10) => {
  try {
    const response = await axios.get(
      `${APIBASEURL}/salesInvoice`,
      getAuthHeader()
    );
    // console.log("fetchSalesInvoices response:", response.data);
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    console.error("fetchSalesInvoices error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return { data: [], total: 0 };
  }
};

export const fetchSalesInvoiceById = async (id) => {
  try {
    if (!id || id === "undefined" || id === "create") {
      throw new Error("Invalid Sales Invoice ID");
    }

    // console.log("Fetching Sales Invoice with ID:", id);
    const response = await axios.get(
      `${APIBASEURL}/salesInvoice/${id}`,
      getAuthHeader()
    );
    // console.log("fetchSalesInvoiceById response:", response.data);

    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error("Invalid Sales Invoice data format");
  } catch (error) {
    console.error("fetchSalesInvoiceById error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const deleteSalesInvoice = async (id) => {
  try {
    const response = await axios.delete(
      `${APIBASEURL}/sales-invoice/${id}`,
      getAuthHeader()
    );
    // console.log("deleteSalesInvoice response:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("deleteSalesInvoice error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const fetchSalesInvoiceItems = async (salesInvoiceId) => {
  try {
    if (!salesInvoiceId) {
      throw new Error("Invalid Sales Invoice ID");
    }

    // console.log("Fetching items for Sales Invoice ID:", salesInvoiceId);
    const response = await axios.get(
      `${APIBASEURL}/salesInvoiceParcel?SalesinvoiceID=${salesInvoiceId}`,
      getAuthHeader()
    );
    // console.log("fetchSalesInvoiceItems response:", response.data);

    if (response.data && response.data.data) {
      const items = response.data.data;

      let itemMap = {};
      try {
        const itemResponse = await axios.get(
          `${APIBASEURL}/items`,
          getAuthHeader()
        );
        if (itemResponse.data && itemResponse.data.data) {
          itemMap = itemResponse.data.data.reduce((acc, item) => {
            acc[item.ItemID] = item.ItemName || item.Description;
            acc[String(item.ItemID)] = item.ItemName || item.Description;
            return acc;
          }, {});
        }
      } catch (err) {
        console.error("Could not fetch items:", err);
      }

      let uomMap = {};
      try {
        const uomResponse = await axios.get(
          `${APIBASEURL}/uoms`,
          getAuthHeader()
        );
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
        }
      } catch (err) {
        console.error("Could not fetch UOMs:", err);
      }

      const enhancedItems = items.map((item, index) => ({
        id: item.SalesInvoiceItemID || Date.now() + index,
        itemId: String(item.ItemID || ""),
        uomId: String(item.UOMID || ""),
        quantity: String(item.Quantity || "0"),
        itemName:
          item.ItemID && itemMap[item.ItemID]
            ? itemMap[item.ItemID]
            : "Unknown Item",
        uomName:
          item.UOMID && uomMap[item.UOMID]
            ? uomMap[item.UOMID]
            : "Unknown Unit",
        srNo: index + 1,
      }));

      return enhancedItems;
    }
    return [];
  } catch (error) {
    console.error("fetchSalesInvoiceItems error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
};

export const fetchCurrencies = async () => {
  try {
    const response = await axios.get(
      `${APIBASEURL}/currencies`,
      getAuthHeader()
    );
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return [];
  }
};

export const fetchServiceTypes = async () => {
  try {
    const response = await axios.get(
      `${APIBASEURL}/service-types`,
      getAuthHeader()
    );
    // console.log("fetchServiceTypes response:", response.data);
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    console.warn("Unexpected service types response format:", response.data);
    return [];
  } catch (error) {
    console.error("fetchServiceTypes error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const fetchShippingPriorities = async () => {
  try {
    const response = await axios.get(
      `${APIBASEURL}/mailing-priorities`,
      getAuthHeader()
    );
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching shipping priorities:", error);
    return [];
  }
};