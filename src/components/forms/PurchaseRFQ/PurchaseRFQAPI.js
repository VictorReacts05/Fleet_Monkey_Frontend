import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

export const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.personId) {
      throw new Error("No valid personId found in localStorage");
    }
    return {
      headers: {
        Authorization: `Bearer ${user.personId}`,
      },
    };
  } catch (err) {
    console.error("getAuthHeader error:", err.message);
    throw err;
  }
};

export const fetchServiceTypes = async () => {
  try {
    const response = await axios.get(
      `${APIBASEURL}/service-types`,
      getAuthHeader()
    );
    console.log("fetchServiceTypes response:", response.data);
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

export const fetchSalesRFQParcels = async (salesRFQId) => {
  try {
    if (!salesRFQId) return [];

    console.log("Fetching parcels for SalesRFQ ID:", salesRFQId);
    const response = await axios.get(
      `${APIBASEURL}/sales-rfq-parcels?salesRFQID=${salesRFQId}`,
      getAuthHeader()
    );

    if (response.data && response.data.data) {
      const parcels = response.data.data;

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
        console.log("Could not fetch UOMs:", err);
      }

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
        console.log("Could not fetch items:", err);
      }

      const enhancedParcels = parcels.map((parcel) => {
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
    console.error("fetchSalesRFQParcels error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
};

export const getPurchaseRFQById = async (id) => {
  try {
    if (!id || id === "undefined" || id === "create") {
      throw new Error("Invalid Purchase RFQ ID");
    }

    console.log("Fetching Purchase RFQ with ID:", id);
    const response = await axios.get(
      `${APIBASEURL}/purchase-rfq/${id}`,
      getAuthHeader()
    );
    console.log("API Response:", response.data);

    if (response.data && response.data.data && response.data.data.SalesRFQID) {
      const salesRFQId = response.data.data.SalesRFQID;
      console.log("Found associated SalesRFQ ID:", salesRFQId);

      try {
        const [salesRFQResponse, parcelsResponse, itemsResponse, uomsResponse] =
          await Promise.all([
            axios.get(`${APIBASEURL}/sales-rfq/${salesRFQId}`, getAuthHeader()),
            axios.get(
              `${APIBASEURL}/sales-rfq-parcels?salesRFQID=${salesRFQId}`,
              getAuthHeader()
            ),
            axios.get(`${APIBASEURL}/items`, getAuthHeader()),
            axios.get(`${APIBASEURL}/uoms`, getAuthHeader()),
          ]);

        console.log("Original SalesRFQ data:", salesRFQResponse.data);

        const itemMap = {};
        if (itemsResponse.data && itemsResponse.data.data) {
          itemsResponse.data.data.forEach((item) => {
            itemMap[item.ItemID] = item.ItemName || item.Description;
          });
        }

        const uomMap = {};
        if (uomsResponse.data && uomsResponse.data.data) {
          uomsResponse.data.data.forEach((uom) => {
            uomMap[uom.UOMID] = uom.UOM || uom.UOMName;
          });
        }

        if (parcelsResponse.data && parcelsResponse.data.data) {
          const parcels = parcelsResponse.data.data.filter(
            (parcel) => String(parcel.SalesRFQID) === String(salesRFQId)
          );
          console.log(
            `Found ${parcels.length} valid parcels for SalesRFQ ID ${salesRFQId}`
          );

          const formattedParcels = parcels.map((parcel, index) => ({
            id: parcel.SalesRFQParcelID || Date.now() + index,
            itemId: String(parcel.ItemID || ""),
            uomId: String(parcel.UOMID || ""),
            quantity: String(parcel.ItemQuantity || parcel.Quantity || "0"),
            itemName:
              parcel.ItemID && itemMap[parcel.ItemID]
                ? itemMap[parcel.ItemID]
                : "Unknown Item",
            uomName:
              parcel.UOMID && uomMap[parcel.UOMID]
                ? uomMap[parcel.UOMID]
                : "Unknown Unit",
            srNo: index + 1,
          }));

          response.data.data.parcels = formattedParcels;
        } else {
          console.log("No parcels found for SalesRFQ ID:", salesRFQId);
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

export const createPurchaseRFQ = async (purchaseRFQData) => {
  try {
    const response = await axios.post(
      `${APIBASEURL}/purchase-rfq`,
      purchaseRFQData,
      getAuthHeader()
    );
    return {
      success: true,
      data: response.data,
      purchaseRFQId: response.data.PurchaseRFQID,
    };
  } catch (error) {
    console.error("Error creating Purchase RFQ:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const updatePurchaseRFQ = async (id, purchaseRFQData) => {
  try {
    const response = await axios.put(
      `${APIBASEURL}/purchase-rfq/${id}`,
      purchaseRFQData,
      getAuthHeader()
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating Purchase RFQ:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const fetchSalesRFQs = async () => {
  try {
    const response = await axios.get(
      `${APIBASEURL}/sales-rfq`,
      getAuthHeader()
    );
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching Sales RFQs:", error);
    return [];
  }
};

export const fetchPurchaseRFQApprovalStatus = async (purchaseRFQId) => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.personId) {
      throw new Error("No valid personId found in localStorage");
    }
    const headers = getAuthHeader().headers;
    const response = await axios.get(
      `${APIBASEURL}/purchase-rfq-approvals/${purchaseRFQId}/${user.personId}`,
      { headers }
    );
    console.log(
      `Approval status response for RFQ ${purchaseRFQId}:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Purchase RFQ approval status:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const approvePurchaseRFQ = async (purchaseRFQId, isApproved = true) => {
  try {
    const headers = getAuthHeader().headers;
    const endpoint = isApproved
      ? `${APIBASEURL}/purchase-rfq/approve`
      : `${APIBASEURL}/purchase-rfq/disapprove`;

    const response = await axios.post(
      endpoint,
      { PurchaseRFQID: parseInt(purchaseRFQId, 10) },
      { headers }
    );

    console.log(
      `Approval/disapproval response for RFQ ${purchaseRFQId}:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error("Error approving/disapproving Purchase RFQ:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const createPurchaseRFQFromSalesRFQ = async (salesRFQId) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const createdById = user?.personId || user?.id || user?.userId || 2036;

    const payload = {
      SalesRFQID: parseInt(salesRFQId, 10),
      createdById: parseInt(createdById, 10),
    };

    const response = await axios.post(
      `${APIBASEURL}/purchase-rfq`,
      payload,
      getAuthHeader()
    );

    const purchaseRFQId =
      response.data.data?.PurchaseRFQID || response.data.newPurchaseRFQId;
    response.purchaseRFQId = purchaseRFQId;

    return response;
  } catch (error) {
    console.error("Error creating Purchase RFQ from Sales RFQ:", {
      message: error.message,
      status: error.response?.status,
      responseData: error.response?.data,
    });
    throw new Error(error.response?.data?.message || error.message);
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
