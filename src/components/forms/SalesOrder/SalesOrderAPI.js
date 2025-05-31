import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Get Sales Order parcels by ID
export const fetchSalesOrderParcels = async (salesOrderId) => {
  try {
    if (!salesOrderId) return [];

    // Fetch parcels
    const response = await axios.get(`${APIBASEURL}/sales-order-parcels?salesOrderId=${salesOrderId}`);
    const parcels = response.data?.data || [];

    // Fetch UOMs
    let uomMap = {};
    try {
      const uomResponse = await axios.get(`${APIBASEURL}/uoms`);
      const uoms = uomResponse.data?.data || [];

      uomMap = uoms.reduce((acc, uom) => {
        const name = uom.UOM || uom.UOMName || uom.Name || uom.Description;
        if (uom.UOMID && name) {
          acc[uom.UOMID] = name;
          acc[String(uom.UOMID)] = name;
        }
        return acc;
      }, {});
    } catch (err) {
      console.warn("Failed to fetch UOMs:", err);
    }

    // Fetch Items
    let itemMap = {};
    try {
      const itemResponse = await axios.get(`${APIBASEURL}/items`);
      const items = itemResponse.data?.data || [];

      itemMap = items.reduce((acc, item) => {
        const name = item.ItemName || item.Description;
        acc[item.ItemID] = name;
        acc[String(item.ItemID)] = name;
        return acc;
      }, {});
    } catch (err) {
      console.warn("Failed to fetch items:", err);
    }

    // Enhance each parcel with UOM and Item Name
    const enhancedParcels = await Promise.all(
      parcels.map(async (parcel) => {
        if (parcel.ItemID && itemMap[parcel.ItemID]) {
          parcel.ItemName = itemMap[parcel.ItemID];
        }

        if (parcel.UOMID) {
          if (uomMap[parcel.UOMID]) {
            parcel.UOMName = uomMap[parcel.UOMID];
          } else {
            // Fallback: fetch single UOM if not found in map
            try {
              const singleUom = await axios.get(`${APIBASEURL}/uoms/${parcel.UOMID}`);
              const singleData = singleUom.data?.data;
              parcel.UOMName = singleData?.UOM || singleData?.UOMName;
            } catch (err) {
              console.warn(`Failed to fetch single UOM for ID ${parcel.UOMID}`, err);
            }
          }
        }

        return parcel;
      })
    );

    return enhancedParcels;
  } catch (error) {
    console.error("Error fetching Sales Order parcels:", error);
    return [];
  }
};
