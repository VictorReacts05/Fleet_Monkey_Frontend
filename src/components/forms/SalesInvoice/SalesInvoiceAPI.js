import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

export const getAuthHeader = (user = null) => {
  try {
    let token = null;
    let personId = null;

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
    const response = await axios.get(`${APIBASEURL}/items`, { headers });
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
    const response = await axios.get(`${APIBASEURL}/uoms`, { headers });
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

export const fetchSalesInvoices = async (
  page = 1,
  pageSize = 10,
  fromDate = null,
  toDate = null,
  searchTerm = null
) => {
  try {
    let url = `${APIBASEURL}/salesInvoice?pageNumber=${page}&pageSize=${pageSize}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    const response = await axios.get(url, getAuthHeader());
    console.log("Raw API response for SalesInvoices:", response.data);

    if (response.data && response.data.data) {
      return {
        data: response.data.data,
        pagination: response.data.pagination || { totalRecords: 0 },
      };
    }

    console.warn("No data found in response:", response.data);
    return { data: [], pagination: { totalRecords: 0 } };
  } catch (error) {
    console.error("fetchSalesInvoices error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return { data: [], pagination: { totalRecords: 0 } };
  }
};

export const fetchCompanyById = async (id) => {
  try {
    if (!id) {
      return { CompanyName: "Unknown Company" };
    }
    const response = await axios.get(
      `${APIBASEURL}/companies/${id}`,
      getAuthHeader()
    );
    return response.data.data || { CompanyName: "Unknown Company" };
  } catch (error) {
    console.error("fetchCompanyById error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return { CompanyName: "Unknown Company" };
  }
};

export const fetchCustomerById = async (id) => {
  try {
    if (!id) {
      return { CustomerName: "Unknown Customer" };
    }
    const response = await axios.get(
      `${APIBASEURL}/customers/${id}`,
      getAuthHeader()
    );
    return response.data.data || { CustomerName: "Unknown Customer" };
  } catch (error) {
    console.error("fetchCustomerById error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return { CustomerName: "Unknown Customer" };
  }
};

export const fetchSupplierById = async (id) => {
  try {
    if (!id) {
      return { SupplierName: "Unknown Supplier" };
    }
    const response = await axios.get(
      `${APIBASEURL}/suppliers/${id}`,
      getAuthHeader()
    );
    return response.data.data || { SupplierName: "Unknown Supplier" };
  } catch (error) {
    console.error("fetchSupplierById error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return { SupplierName: "Unknown Supplier" };
  }
};

export const fetchSalesInvoiceById = async (id) => {
  try {
    if (!id || id === "undefined" || id === "create") {
      throw new Error("Invalid Sales Invoice ID");
    }

    const response = await axios.get(
      `${APIBASEURL}/salesInvoice/${id}`,
      getAuthHeader()
    );

    if (response.data && response.data.data) {
      const invoiceData = response.data.data;

      const [company, customer, supplier] = await Promise.all([
        fetchCompanyById(invoiceData.CompanyID),
        fetchCustomerById(invoiceData.CustomerID),
        fetchSupplierById(invoiceData.SupplierID),
      ]);

      return {
        ...invoiceData,
        CompanyName: company.CompanyName || "Unknown Company",
        CustomerName: customer.CustomerName || "Unknown Customer",
        SupplierName: supplier.SupplierName || "Unknown Supplier",
      };
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
      `${APIBASEURL}/salesInvoice/${id}`,
      getAuthHeader()
    );
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


export const fetchCertifications = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/certifications?pageSize=500`, getAuthHeader());
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching certifications:", error);
    throw error;
  }
};

export const fetchSalesInvoiceItems = async (salesInvoiceId) => {
  try {
    if (!salesInvoiceId || salesInvoiceId === "undefined") {
      throw new Error("Invalid Sales Invoice ID");
    }

    const { headers } = getAuthHeader();
    const response = await axios.get(
      `${APIBASEURL}/salesInvoiceParcel?salesInvoiceId=${salesInvoiceId}`,
      { headers }
    );

    if (response.data && response.data.data) {
      const items = Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];

      let itemMap = {};
      try {
        const itemResponse = await axios.get(
          `${APIBASEURL}/items`,
          { headers }
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
          { headers }
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

      let certificationMap = {};
      try {
        const certResponse = await axios.get(
          `${APIBASEURL}/certifications?pageSize=500`,
          { headers }
        );
        if (certResponse.data && certResponse.data.data) {
          certificationMap = certResponse.data.data.reduce((acc, cert) => {
            const certName = cert.CertificationName || cert.name || "Unknown Certification";
            const certId = cert.CertificationID || cert.id;
            if (certId && certName) {
              acc[certId] = certName;
              acc[String(certId)] = certName;
            }
            return acc;
          }, {});
        }
      } catch (err) {
        console.error("Could not fetch certifications:", err);
      }

      const enhancedItems = items.map((item, index) => ({
        id: item.SalesInvoiceParcelID || Date.now() + index,
        itemId: String(item.ItemID || ""),
        uomId: String(item.UOMID || ""),
        certificationId: String(item.CertificationID || ""),
        quantity: String(item.Quantity || "0"),
        itemName:
          item.ItemID && itemMap[item.ItemID]
            ? itemMap[item.ItemID]
            : item.ItemName || "Unknown Item",
        uomName:
          item.UOMID && uomMap[item.UOMID]
            ? uomMap[item.UOMID]
            : item.UOMName || "Unknown Unit",
        certificationName:
          item.CertificationID && certificationMap[item.CertificationID]
            ? certificationMap[item.CertificationID]
            : item.CertificationName || "None",
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

export const fetchSalesOrders = async () => {
  try {
    const response = await axios.get(
      `${APIBASEURL}/sales-Order`,
      getAuthHeader()
    );
    return response.data.data || [];
  } catch (error) {
    console.error("fetchSalesOrders error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
};

export const createSalesInvoice = async (data) => {
  try {
    const { headers } = getAuthHeader();
    const salesOrderId = parseInt(data.salesOrderId);
    console.log("createSalesInvoice: Input data", { salesOrderId, headers });

    if (isNaN(salesOrderId) || salesOrderId <= 0) {
      console.error("createSalesInvoice: Invalid Sales Order ID", salesOrderId);
      throw new Error("Invalid Sales Order ID provided");
    }

    const payload = {
      salesOrderId: salesOrderId,
    };
    console.log("createSalesInvoice: Sending payload", payload);

    const response = await axios.post(`${APIBASEURL}/salesInvoice`, payload, {
      headers,
    });
    console.log("createSalesInvoice: Raw API Response", response.data);

    // Check for SalesInvoiceID in multiple possible locations, including lowercase
    const salesInvoiceId =
      response.data?.data?.SalesInvoiceID ||
      response.data?.data?.salesInvoiceId || // Added to handle lowercase 'salesInvoiceId'
      response.data?.SalesInvoiceID ||
      response.data?.id ||
      null;

    console.log("createSalesInvoice: Extracted SalesInvoiceID", salesInvoiceId);

    if (!salesInvoiceId) {
      console.error(
        "createSalesInvoice: Sales Invoice ID not found in response",
        response.data
      );
      throw new Error("Sales Invoice ID not found in response");
    }

    const formattedResponse = {
      success: true,
      message: "Sales Invoice inserted successfully",
      data: {
        SalesInvoiceID: salesInvoiceId,
      },
    };
    console.log("createSalesInvoice: Formatted Response", formattedResponse);

    return formattedResponse;
  } catch (error) {
    console.error("createSalesInvoice error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack,
    });
    throw error;
  }
};