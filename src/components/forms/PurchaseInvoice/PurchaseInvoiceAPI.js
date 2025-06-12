import axios from 'axios';
import APIBASEURL from './../../../utils/apiBaseUrl';

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


// Function to fetch items
export const fetchItems = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/items`, { headers });
    console.log("fetchItems response:", response.data);
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

// Function to fetch UOMs
export const fetchUOMs = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/uoms`, { headers });
    console.log("fetchUOMs response:", response.data);
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

  
export const fetchPurchaseInvoices = async (page = 1, limit = 10) => {
  try {
    const { headers } = getAuthHeader();
    console.log(
      `Fetching Purchase Invoices page ${page}, limit ${limit} from: ${APIBASEURL}/pInvoice`
    );
    const response = await axios.get(`${APIBASEURL}/pInvoice`, {
      params: { page, limit },
      headers,
    });
    console.log("Purchase Invoices API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching Purchase Invoices:",
      error.response?.data || error.message,
      "Status:",
      error.response?.status
    );
    throw error.response?.data || error;
  }
};

export const fetchPurchaseInvoice = async (purchaseInvoiceId) => {
  try {
    const { headers } = getAuthHeader();
    console.log(
      `Fetching Purchase Invoice ID ${purchaseInvoiceId} from: ${APIBASEURL}/pInvoice/${purchaseInvoiceId}`
    );
    const response = await axios.get(`${APIBASEURL}/pInvoice/${purchaseInvoiceId}`, {
      headers,
    });
    console.log("Purchase Invoice API Response:", response.data);

    if (response.data?.data) {
      const invoice = response.data.data; // Directly use the object, no array check
      console.log("Processed Purchase Invoice:", invoice);

      if (!invoice.PInvoiceID) {
        console.warn("No PInvoiceID found in response data:", invoice);
        return null;
      }

      let addressMap = {};
      let currencyMap = {};
      let customerMap = {};
      let supplierMap = {};
      let serviceTypeMap = {};
      let companyMap = {};

      // Fetch addresses
      try {
        console.log(`Fetching addresses from: ${APIBASEURL}/Addresses`);
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
          console.log("Address Map:", addressMap);
        } else {
          console.warn("No address data found:", addressResponse.data);
        }
      } catch (err) {
        console.error(
          "Could not fetch addresses:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
      }

      // Fetch currencies
      try {
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
        console.log("Currency Map:", currencyMap);
        console.log(
          `CurrencyID ${invoice.CurrencyID} mapped to:`,
          currencyMap[invoice.CurrencyID] || "Not found"
        );
      } catch (err) {
        console.error(
          "Could not fetch currencies:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
      }

      // Fetch customers
      try {
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
          console.log("Customer Map:", customerMap);
        } else {
          console.warn("No customer data found:", customerResponse.data);
        }
      } catch (err) {
        console.error(
          "Could not fetch customers:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
      }

      // Fetch suppliers
      try {
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
        console.log("Supplier Map:", supplierMap);
        console.log(
          `SupplierID ${invoice.SupplierID} mapped to:`,
          supplierMap[invoice.SupplierID] || "Not found"
        );
      } catch (err) {
        console.error(
          "Could not fetch suppliers:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
      }

      // Fetch service types
      try {
        console.log(`Fetching service types from: ${APIBASEURL}/Service-Types`);
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
          console.log("Service Type Map:", serviceTypeMap);
        } else {
          console.warn("No service type data found:", serviceTypeResponse.data);
        }
      } catch (err) {
        console.error(
          "Could not fetch service types:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
      }

      // Fetch companies
      try {
        console.log(`Fetching companies from: ${APIBASEURL}/Companies`);
        const companyResponse = await axios.get(`${APIBASEURL}/Companies`, {
          headers,
        });
        console.log("Companies API Raw Response:", companyResponse.data);
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
          console.log("Company Map:", companyMap);
        } else {
          console.warn("No company data found:", companyResponse.data);
        }
      } catch (err) {
        console.error(
          "Could not fetch companies:",
          err.response?.data || err.message,
          "Status:",
          err.response?.status
        );
      }

      // Map values to names
      invoice.CollectionAddressTitle = invoice.CollectionAddressID
        ? addressMap[invoice.CollectionAddressID] || "Unknown Address"
        : "-";
      invoice.DestinationAddressTitle = invoice.DestinationAddressID
        ? addressMap[invoice.DestinationAddressID] || "Unknown Address"
        : "-";
      invoice.BillingAddressTitle = invoice.BillingAddressID
        ? addressMap[invoice.BillingAddressID] || "Unknown Address"
        : "-";
      invoice.CurrencyName = invoice.CurrencyID
        ? currencyMap[invoice.CurrencyID] || "Unknown Currency"
        : "-";
      invoice.CustomerName = invoice.CustomerID
        ? customerMap[invoice.CustomerID] || "Unknown Customer"
        : "-";
      invoice.SupplierName = invoice.SupplierID
        ? supplierMap[invoice.SupplierID] || "Unknown Supplier"
        : "-";
      invoice.ServiceTypeName = invoice.ServiceTypeID
        ? serviceTypeMap[invoice.ServiceTypeID] || "Unknown Service Type"
        : "-";
      invoice.CompanyName = invoice.CompanyID
        ? companyMap[invoice.CompanyID] || "Unknown Company"
        : "-";

      console.log("Final Purchase Invoice Object:", {
        CurrencyName: invoice.CurrencyName,
        SupplierName: invoice.SupplierName,
        ServiceTypeName: invoice.ServiceTypeName,
        CompanyName: invoice.CompanyName,
        CustomerName: invoice.CustomerName,
        CollectionAddressTitle: invoice.CollectionAddressTitle,
        DestinationAddressTitle: invoice.DestinationAddressTitle,
        BillingAddressTitle: invoice.BillingAddressTitle,
      });

      return invoice;
    }
    console.warn("No Purchase Invoice data found:", response.data);
    return null;
  } catch (error) {
    console.error(
      `Error fetching Purchase Invoice ${purchaseInvoiceId}:`,
      error.response?.data || error.message,
      "Status:",
      error.response?.status
    );
    throw error.response?.data || error;
  }
};

export const fetchPurchaseInvoiceItems = async (purchaseInvoiceId) => {
  try {
    const { headers } = getAuthHeader();
    if (!purchaseInvoiceId) {
      console.warn("No purchaseInvoiceId provided, returning empty items");
      return [];
    }

    console.log(
      `Fetching Purchase Invoice Items for ID ${purchaseInvoiceId} from: ${APIBASEURL}pInvoiceParcel?pInvoiceID=${purchaseInvoiceId}`
    );
    if (isNaN(parseInt(purchaseInvoiceId, 10))) {
      console.warn(
        `Invalid Purchase Invoice ID: ${purchaseInvoiceId}, must be a number`
      );
      return [];
    }

    const response = await axios.get(
      `${APIBASEURL}/pInvoiceparcel?pInvoiceID=${purchaseInvoiceId}`,
      { headers }
    );
    console.log("Purchase Invoice Items API Response:", response.data);

    let items = [];
    if (response.data?.data) {
      // Handle both single object and array responses
      items = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];
    } else {
      console.warn("No items found in response:", response.data);
      return [];
    }

    // Fetch UOMs and Items for mapping names
    let uomMap = {};
    let itemMap = {};

    try {
      const uomResponse = await axios.get(`${APIBASEURL}/UOMs`, { headers });
      console.log("UOMs API Raw Response:", uomResponse.data);
      if (uomResponse.data?.data) {
        const uoms = Array.isArray(uomResponse.data.data)
          ? uomResponse.data.data
          : [uomResponse.data.data];
        uomMap = uoms.reduce((acc, uom) => {
          const uomName =
            uom.UOM || uom.UOMName || uom.Name || uom.Description || "Unknown UOM";
          const uomId =
            uom.UOMID || uom.UOMId || uom.uomID || uom.uomId || uom.id || uom.ID;
          if (uomId && uomName) {
            acc[uomId] = uomName;
            acc[String(uomId)] = uomName;
          }
          return acc;
        }, {});
        console.log("UOM Map:", uomMap);
      }
    } catch (err) {
      console.error("Could not fetch UOMs:", err.response?.data || err.message);
    }

    try {
      const itemResponse = await axios.get(`${APIBASEURL}/Items`, { headers });
      console.log("Items API Raw Response:", itemResponse.data);
      if (itemResponse.data?.data) {
        const itemData = Array.isArray(itemResponse.data.data)
          ? itemResponse.data.data
          : [itemResponse.data.data];
        itemMap = itemData.reduce((acc, item) => {
          if (item.ItemID && item.ItemName) {
            acc[item.ItemID] = item.ItemName;
            acc[String(item.ItemID)] = item.ItemName;
          }
          return acc;
        }, {});
        console.log("Item Map:", itemMap);
      }
    } catch (err) {
      console.error("Could not fetch items:", err.response?.data || err.message);
    }

    // Enhance items with ItemName and UOMName
    const enhancedItems = items.map((item, index) => {
      console.log("Processing item:", item);
      const itemId = String(item.ItemID || "");
      const uomId = String(item.UOMID || "");
      return {
        ...item,
        PurchaseInvoiceItemID: item.PInvoiceParcelID || item.id || Date.now() + index,
        PIID: item.PInvoiceID || purchaseInvoiceId,
        ItemName: itemId && itemMap[itemId] ? itemMap[itemId] : "Unknown Item",
        UOMName: uomId && uomMap[uomId] ? uomMap[uomId] : "Unknown UOM",
        ItemQuantity: String(item.ItemQuantity || item.Quantity || "0"),
        Rate: String(item.Rate || "0"),
        Amount: String(item.Amount || "0"),
      };
    });

    console.log("Enhanced Items:", enhancedItems);
    return enhancedItems;
  } catch (error) {
    console.error(
      `Error fetching items for Purchase Invoice ${purchaseInvoiceId}:`,
      error.response?.data || error.message,
      "Status:",
      error.response?.status
    );
    throw error.response?.data || error;
  }
};

export const deletePurchaseInvoice = async (id) => {
  try {
    const { headers } = getAuthHeader();
    console.log(`Deleting Purchase Invoice ${id} at: ${APIBASEURL}/pInvoice/${id}`);
    const response = await axios.delete(`${APIBASEURL}/pInvoice/${id}`, { headers });
    console.log("Delete Purchase Invoice Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting Purchase Invoice:",
      error.response?.data || error.message,
      "Status:",
      error.response?.status
    );
    throw error.response?.data || error;
  }
};