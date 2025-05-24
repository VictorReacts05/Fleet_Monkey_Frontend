import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Get Sales Quotation parcels by ID
export const fetchSalesQuotationParcels = async (salesQuotationId) => {
  try {
    if (!salesQuotationId) {
      return [];
    }
    
    const response = await axios.get(
      `${APIBASEURL}/sales-quotation-parcels?salesQuotationId=${salesQuotationId}`
    );
    if (response.data && response.data.data) {
      const parcels = response.data.data;
      
      // Fetch all UOMs once to avoid multiple API calls
      let uomMap = {};
      try {
        const uomResponse = await axios.get(`${APIBASEURL}/uoms`);
        
        if (uomResponse.data && uomResponse.data.data) {
          uomMap = uomResponse.data.data.reduce((acc, uom) => {
            console.log("UOM object structure:", JSON.stringify(uom));
            
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
        console.log("Processing parcel:", parcel);
        
        if (parcel.ItemID && itemMap[parcel.ItemID]) {
          parcel.ItemName = itemMap[parcel.ItemID];
        }
        
        if (parcel.UOMID) {
          
          if (uomMap[parcel.UOMID]) {
            parcel.UOMName = uomMap[parcel.UOMID];
          } else {
            try {
              const singleUomResponse = axios.get(`${APIBASEURL}/uoms/${parcel.UOMID}`);
              singleUomResponse.then(response => {
                if (response.data && response.data.data) {
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
    console.error("Error fetching Sales Quotation parcels:", error);
    try {
      const response = await axios.get(`${APIBASEURL}/sales-quotation-parcels`);
      if (response.data && response.data.data) {
        const filteredParcels = response.data.data.filter(
          parcel => String(parcel.SalesQuotationId) === String(salesQuotationId)
        );
        
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