import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// In-memory cache
const cache = {
  addresses: null,
  currencies: null,
  customers: null,
  suppliers: null,
  serviceTypes: null,
  companies: null,
  uoms: null,
  items: null,
};

export const getAuthHeader = (user = null) => {
  try {
    if (!user) {
      console.warn("No user data provided, proceeding without login token");
      return { headers: {}, personId: "" };
    }

    const personId =
      user?.personId ||
      user?.PersonID ||
      user?.id ||
      user?.UserID ||
      user?.ID ||
      null;

    if (!personId) {
      console.warn("No valid personId found in user data");
      return { headers: {}, personId: "" };
    }

    const headers = {
      "Content-Type": "application/json",
    };
    const token = user?.token || user?.Token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found, proceeding without Authorization header");
    }

    return { headers, personId };
  } catch (error) {
    console.error("Error processing user data:", error);
    return { headers: {}, personId: "" };
  }
};

export const fetchItems = async (user) => {
  try {
    if (cache.items) {
      console.log("Returning cached items");
      return cache.items;
    }
    const { headers } = getAuthHeader(user);
    const response = await axios.get(`${APIBASEURL}/Items`, { headers });
    console.log("Items API Raw Response:", response.data);
    cache.items = response.data.data || [];
    return cache.items;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

export const fetchUOMs = async (user) => {
  try {
    if (cache.uoms) {
      console.log("Returning cached UOMs");
      return cache.uoms;
    }
    const { headers } = getAuthHeader(user);
    const response = await axios.get(`${APIBASEURL}/UOMs`, { headers });
    console.log("UOMs API Raw Response:", response.data);
    cache.uoms = response.data.data || [];
    return cache.uoms;
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    throw error;
  }
};

export const fetchSupplier = async (supplierId, user) => {
  try {
    const { headers } = getAuthHeader(user);
    console.log(
      `Fetching supplier ID ${supplierId} from: ${APIBASEURL}/Suppliers/${supplierId}`
    );
    const response = await axios.get(`${APIBASEURL}/Suppliers/${supplierId}`, {
      headers,
    });
    console.log("Supplier API Response:", response.data);
    if (response.data?.data) {
      return response.data.data;
    }
    console.warn("No supplier data found:", response.data);
    return null;
  } catch (error) {
    console.error(
      `Error fetching supplier ${supplierId}:`,
      error.response?.data || error.message,
      "Status:",
      error.response?.status
    );
    throw error.response?.data || error;
  }
};

export const sendPurchaseOrderEmail = async (purchaseOrderId, user) => {
  try {
    const { headers } = getAuthHeader(user);
    console.log(
      `Sending purchase order email for PO ${purchaseOrderId} to: ${APIBASEURL}/sendPurchaseOrder/send-purchase-order`
    );
    const response = await axios.post(
      `${APIBASEURL}/sendPurchaseOrder/send-purchase-order`,
      { poId: parseInt(purchaseOrderId, 10) },
      { headers }
    );
    console.log("Send Purchase Order Email Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error sending purchase order email for PO ${purchaseOrderId}:`,
      error.response?.data || error.message,
      "Status:",
      error.response?.status
    );
    throw error.response?.data || error;
  }
};

export const fetchPurchaseOrders = async (page = 1, limit = 10, user) => {
  try {
    const { headers } = getAuthHeader(user);
    console.log(
      `Fetching POs page ${page}, limit ${limit} from: ${APIBASEURL}/po`
    );
    const response = await axios.get(`${APIBASEURL}/po`, {
      params: { page, limit },
      headers,
    });
    console.log("POs API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching POs:",
      error.response?.data || error.message,
      "Status:",
      error.response?.status
    );
    throw error.response?.data || error;
  }
};

export const fetchPurchaseOrder = async (purchaseOrderId, user) => {
  try {
    const { headers } = getAuthHeader(user);
    console.log(
      `Fetching PO ID ${purchaseOrderId} from: ${APIBASEURL}/po/${purchaseOrderId}`
    );
    const response = await axios.get(`${APIBASEURL}/po/${purchaseOrderId}`, {
      headers,
    });
    console.log("PO API Response:", response.data);

    if (response.data?.data?.length > 0) {
      const po = response.data.data[0];
      console.log("PO IDs:", {
        CurrencyID: po.CurrencyID,
        SupplierID: po.SupplierID,
      });

      let addressMap = {};
      let currencyMap = {};
      let customerMap = {};
      let supplierMap = {};
      let serviceTypeMap = {};
      let companyMap = {};

      try {
        if (cache.addresses) {
          console.log("Using cached addresses");
          addressMap = cache.addresses;
        } else {
          const addressResponse = await axios.get(`${APIBASEURL}/Addresses`, {
            headers,
          });
          if (addressResponse.data?.data) {
            addressMap = (
              Array.isArray(addressResponse.data.data)
                ? addressResponse.data.data
                : [addressResponse.data.data]
            ).reduce((acc, address) => {
              if (address.AddressID) {
                const addressParts = [
                  address.AddressName,
                  address.AddressLine1,
                  address.AddressLine2,
                  address.City,
                  address.State,
                  address.Country,
                ].filter((part) => part?.trim());
                const fullAddress = addressParts.length
                  ? addressParts.join(", ")
                  : address.AddressTitle || "Unknown Address";
                acc[address.AddressID] = fullAddress;
                acc[String(address.AddressID)] = fullAddress;
              }
              return acc;
            }, {});
            cache.addresses = addressMap;
          } else {
            console.warn("No address data found:", addressResponse.data);
          }
        }
      } catch (err) {
        console.error(
          "Could not fetch addresses:",
          err.response?.data || err.message
        );
      }

      try {
        if (cache.currencies) {
          console.log("Using cached currencies");
          currencyMap = cache.currencies;
        } else {
          console.log(`Fetching currencies from: ${APIBASEURL}/Currencies`);
          const currencyResponse = await axios.get(`${APIBASEURL}/Currencies`, {
            headers,
          });
          console.log("Currencies API Raw Response:", currencyResponse.data);
          const currencies = Array.isArray(currencyResponse.data.data)
            ? currencyResponse.data.data
            : currencyResponse.data.data
            ? [currencyResponse.data.data]
            : [];
          currencyMap = currencies.reduce((acc, currency) => {
            if (currency.CurrencyID && currency.CurrencyName) {
              acc[currency.CurrencyID] = currency.CurrencyName;
              acc[String(currency.CurrencyID)] = currency.CurrencyName;
            }
            return acc;
          }, {});
          cache.currencies = currencyMap;
          console.log("Currency Map:", currencyMap);
        }
      } catch (err) {
        console.error(
          "Could not fetch currencies:",
          err.response?.data || err.message
        );
      }

      try {
        if (cache.customers) {
          console.log("Using cached customers");
          customerMap = cache.customers;
        } else {
          console.log(`Fetching customers from: ${APIBASEURL}/Customers`);
          const customerResponse = await axios.get(`${APIBASEURL}/Customers`, {
            headers,
          });
          console.log("Customers API Raw Response:", customerResponse.data);
          if (customerResponse.data?.data) {
            customerMap = (
              Array.isArray(customerResponse.data.data)
                ? customerResponse.data.data
                : [customerResponse.data.data]
            ).reduce((acc, customer) => {
              if (customer.CustomerID && customer.CustomerName) {
                acc[customer.CustomerID] = customer.CustomerName;
                acc[String(customer.CustomerID)] = customer.CustomerName;
              }
              return acc;
            }, {});
            cache.customers = customerMap;
            console.log("Customer Map:", customerMap);
          } else {
            console.warn("No customer data found:", customerResponse.data);
          }
        }
      } catch (err) {
        console.error(
          "Could not fetch customers:",
          err.response?.data || err.message
        );
      }

      try {
        if (cache.suppliers) {
          console.log("Using cached suppliers");
          supplierMap = cache.suppliers;
        } else {
          console.log(`Fetching suppliers from: ${APIBASEURL}/Suppliers`);
          const supplierResponse = await axios.get(`${APIBASEURL}/Suppliers`, {
            headers,
          });
          console.log("Suppliers API Raw Response:", supplierResponse.data);
          const suppliers = Array.isArray(supplierResponse.data.data)
            ? supplierResponse.data.data
            : supplierResponse.data.data
            ? [supplierResponse.data.data]
            : [];
          supplierMap = suppliers.reduce((acc, supplier) => {
            if (supplier.SupplierID && supplier.SupplierName) {
              acc[supplier.SupplierID] = supplier.SupplierName;
              acc[String(supplier.SupplierID)] = supplier.SupplierName;
            }
            return acc;
          }, {});
          cache.suppliers = supplierMap;
          console.log("Supplier Map:", supplierMap);
        }
      } catch (err) {
        console.error(
          "Could not fetch suppliers:",
          err.response?.data || err.message
        );
      }

      try {
        if (cache.serviceTypes) {
          console.log("Using cached service types");
          serviceTypeMap = cache.serviceTypes;
        } else {
          console.log(
            `Fetching service types from: ${APIBASEURL}/Service-Types`
          );
          const serviceTypeResponse = await axios.get(
            `${APIBASEURL}/Service-Types`,
            { headers }
          );
          console.log(
            "Service Types API Raw Response:",
            serviceTypeResponse.data
          );
          if (serviceTypeResponse.data?.data) {
            serviceTypeMap = (
              Array.isArray(serviceTypeResponse.data.data)
                ? serviceTypeResponse.data.data
                : [serviceTypeResponse.data.data]
            ).reduce((acc, service) => {
              if (service.ServiceTypeID && service.ServiceType) {
                acc[service.ServiceTypeID] = service.ServiceType;
                acc[String(service.ServiceTypeID)] = service.ServiceType;
              }
              return acc;
            }, {});
            cache.serviceTypes = serviceTypeMap;
            console.log("Service Type Map:", serviceTypeMap);
          } else {
            console.warn(
              "No service type data found:",
              serviceTypeResponse.data
            );
          }
        }
      } catch (err) {
        console.error(
          "Could not fetch service types:",
          err.response?.data || err.message
        );
      }

      try {
        if (cache.companies) {
          console.log("Using cached companies");
          companyMap = cache.companies;
        } else {
          console.log(`Fetching companies from: ${APIBASEURL}/Companies`);
          const companyResponse = await axios.get(`${APIBASEURL}/Companies`, {
            headers,
          });
          console.log("Companies API Response:", companyResponse.data);
          if (companyResponse.data?.data) {
            companyMap = (
              Array.isArray(companyResponse.data.data)
                ? companyResponse.data.data
                : [companyResponse.data.data]
            ).reduce((acc, company) => {
              if (company.CompanyID && company.CompanyName) {
                acc[company.CompanyID] = company.CompanyName;
                acc[String(company.CompanyID)] = company.CompanyName;
              }
              return acc;
            }, {});
            cache.companies = companyMap;
            console.log("Company Map:", companyMap);
          } else {
            console.warn("No company data found:", companyResponse.data);
          }
        }
      } catch (err) {
        console.error(
          "Could not fetch companies:",
          err.response?.data || err.message
        );
      }

      po.CollectionAddressTitle = po.CollectionAddressID
        ? addressMap[po.CollectionAddressID] || "Unknown Address"
        : "-";
      po.DestinationAddressTitle = po.DestinationAddressID
        ? addressMap[po.DestinationAddressID] || "Unknown Address"
        : [];
      po.CurrencyName = po.CurrencyID
        ? currencyMap[po.CurrencyID] || "Unknown Currency"
        : [];
      po.CustomerName = po.CustomerID
        ? customerMap[po.CustomerID] || "Unknown Customer"
        : [];
      po.SupplierName = po.SupplierID
        ? supplierMap[po.SupplierID] || "Unknown Supplier"
        : [];
      po.ServiceTypeName = po.ServiceTypeID
        ? serviceTypeMap[po.ServiceTypeID] || "Unknown Service Type"
        : [];
      po.CompanyName = po.CompanyID
        ? companyMap[po.CompanyID] || "Unknown Company"
        : [];

      console.log("Final PO Object:", {
        CurrencyName: po.CurrencyName,
        SupplierName: po.SupplierName,
        ServiceTypeName: po.ServiceTypeName,
        CompanyName: po.CompanyName,
        CustomerName: po.CustomerName,
        CollectionAddressTitle: po.CollectionAddressTitle,
        DestinationAddressTitle: po.DestinationAddressTitle,
      });

      return po;
    }
    console.warn("No PO data found:", response.data);
    return null;
  } catch (error) {
    console.error(
      `Error fetching PO ${purchaseOrderId}:`,
      error.response?.data || error.message,
      "Status:",
      error.response?.status
    );
    throw error.response?.data || error;
  }
};

export const fetchPurchaseOrderParcels = async (purchaseOrderId, user) => {
  try {
    const { headers } = getAuthHeader(user);
    if (!purchaseOrderId) {
      console.warn("No purchaseOrderId provided, returning empty parcels");
      return [];
    }

    console.log(
      `Fetching parcels for PO ${purchaseOrderId} from: ${APIBASEURL}/PO-Parcel?POID=${purchaseOrderId}`
    );
    const response = await axios.get(
      `${APIBASEURL}/PO-Parcel?POID=${purchaseOrderId}`,
      { headers }
    );
    console.log("PO Parcels API Response:", response.data);

    if (response.data?.data) {
      const parcels = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];

      let uomMap = {};
      let itemMap = {};

      try {
        if (cache.uoms) {
          console.log("Using cached uoms");
          uomMap = cache.uoms;
        } else {
          const uomResponse = await axios.get(`${APIBASEURL}/UOMs`, {
            headers,
          });
          console.log("UOMs API Raw Response:", uomResponse.data);
          if (uomResponse.data?.data) {
            uomMap = (
              Array.isArray(uomResponse.data.data)
                ? uomResponse.data.data
                : [uomResponse.data.data]
            ).reduce((acc, uom) => {
              const uomName =
                uom.UOM ||
                uom.UOMName ||
                uom.Name ||
                uom.Description ||
                "Unknown UOM";
              if (uom.UOMID) {
                acc[uom.UOMID] = uomName;
                acc[String(uom.UOMID)] = uomName;
              }
              return acc;
            }, {});
            cache.uoms = uomMap;
            console.log("UOM Map:", uomMap);
          }
        }
      } catch (err) {
        console.error(
          "Could not fetch UOMs:",
          err.response?.data || err.message
        );
      }

      try {
        if (cache.items) {
          console.log("Using cached items");
          itemMap = cache.items;
        } else {
          const itemResponse = await axios.get(`${APIBASEURL}/Items`, {
            headers,
          });
          console.log("Items API Raw Response:", itemResponse.data);
          if (itemResponse.data?.data) {
            itemMap = (
              Array.isArray(itemResponse.data.data)
                ? itemResponse.data.data
                : [itemResponse.data.data]
            ).reduce((acc, item) => {
              if (item.ItemID && item.ItemName) {
                acc[item.ItemID] = item.ItemName;
                acc[String(item.ItemID)] = item.ItemName;
              }
              return acc;
            }, {});
            cache.items = itemMap;
            console.log("Item Map:", itemMap);
          }
        }
      } catch (err) {
        console.error(
          "Could not fetch items:",
          err.response?.data || err.message
        );
      }

      const enhancedParcels = parcels.map((parcel) => {
        console.log("Processing parcel:", parcel);
        parcel.ItemName =
          parcel.ItemID && itemMap[parcel.ItemID]
            ? itemMap[parcel.ItemID]
            : parcel.ItemName || `Item #${parcel.ItemID}`;
        parcel.UOMName =
          parcel.UOMID && uomMap[parcel.UOMID]
            ? uomMap[parcel.UOMID]
            : parcel.UOM || `UOM #${parcel.UOMID}`;
        return parcel;
      });

      return enhancedParcels;
    }
    console.warn("No parcels found:", response.data);
    return [];
  } catch (error) {
    console.error(
      `Error fetching parcels for PO ${purchaseOrderId}:`,
      error.response?.data || error.message,
      "Status:",
      error.response?.status
    );
    throw error.response?.data || error;
  }
};

export const fetchPurchaseOrderApprovalStatus = async (
  purchaseOrderId,
  user
) => {
  try {
    const { headers, personId } = getAuthHeader(user);
    if (!personId) {
      throw new Error("No valid personId found in user data");
    }
    const response = await axios.get(
      `${APIBASEURL}/po-Approval/${purchaseOrderId}/${personId}`,
      { headers }
    );
    console.log(
      `Approval status response for Purchase Order ${purchaseOrderId}:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Purchase Order approval status:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const approvePurchaseOrder = async (
  purchaseOrderId,
  isApproved = true,
  user
) => {
  try {
    const { headers } = getAuthHeader(user);
    const endpoint = isApproved
      ? `${APIBASEURL}/po/approve`
      : `${APIBASEURL}/po/disapprove`;

    const response = await axios.post(
      endpoint,
      { POID: parseInt(purchaseOrderId, 10) },
      { headers }
    );

    console.log(
      `Approval/disapproval response for Purchase Order ${purchaseOrderId}:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error("Error approving/disapproving Purchase Order:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const deletePurchaseOrder = async (id, user) => {
  try {
    const { headers } = getAuthHeader(user);
    console.log(`Deleting PO ${id} at: ${APIBASEURL}/po/${id}`);
    const response = await axios.delete(`${APIBASEURL}/po/${id}`, { headers });
    console.log("Delete PO:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting PO:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const fetchSalesOrders = async (user) => {
  try {
    const { headers } = getAuthHeader(user);
    console.log(`Fetching sales orders from: ${APIBASEURL}/sales-Order`);
    const response = await axios.get(`${APIBASEURL}/sales-Order`, { headers });
    console.log("Sales Orders API Response:", response.data);
    const salesOrders = Array.isArray(response.data.data)
      ? response.data.data
      : response.data.data
      ? [response.data.data]
      : [];
    return salesOrders.filter((order) => order.Status === "Approved");
  } catch (error) {
    console.error(
      "Error fetching sales orders:",
      error.response?.data || error.message,
      "Status:",
      error.response?.status
    );
    throw error.response?.data || error;
  }
};

export const createPurchaseOrder = async (salesOrderID, user) => {
  try {
    const { headers } = getAuthHeader(user);
    console.log(
      `Creating PO with sales order ID ${salesOrderID} at: ${APIBASEURL}/po`
    );
    const response = await axios.post(
      `${APIBASEURL}/po`,
      { salesOrderID: parseInt(salesOrderID, 10) },
      { headers }
    );
    console.log("Create PO Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating PO:",
      error.response?.data || error.message,
      "Status:",
      error.response?.status
    );
    throw error.response?.data || error;
  }
};
