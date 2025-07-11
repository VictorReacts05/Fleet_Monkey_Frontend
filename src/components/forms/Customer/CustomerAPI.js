import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Add axios interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to get user data safely
const getUserData = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.warn("No user data in localStorage, using default personId: 1");
      return { personId: 1 }; // Default for development
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return { personId: 1 }; // Fallback
  }
};

// Validate required fields for customer operations
const validateCustomerData = (data, operation = "create") => {
  const errors = [];
  if (
    !data.CustomerName ||
    typeof data.CustomerName !== "string" ||
    data.CustomerName.trim() === ""
  ) {
    errors.push("CustomerName is required and must be a non-empty string");
  }
  if (
    operation !== "delete" &&
    (!data.CompanyID || isNaN(Number(data.CompanyID)))
  ) {
    errors.push("CompanyID is required and must be a valid number");
  }
  if (data.BillingCurrencyID && isNaN(Number(data.BillingCurrencyID))) {
    errors.push("BillingCurrencyID must be a valid number if provided");
  }
  return errors;
};

export const fetchCustomers = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    let url = `${APIBASEURL}/customers`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const response = await axios.get(url);

    if (response.data?.data) {
      response.data.data = response.data.data.map((customer) => ({
        id: customer.CustomerID || customer.customerId,
        CustomerID: customer.CustomerID || customer.customerId,
        CustomerName: customer.CustomerName || customer.customerName || "",
        CustomerEmail: customer.CustomerEmail || customer.customerEmail || "",
        CompanyID: customer.CompanyID || customer.companyId,
        CompanyName: customer.CompanyName || customer.companyName || "",
        ImportCode: customer.ImportCode || customer.importCode || "",
        BillingCurrencyID:
          customer.BillingCurrencyID || customer.billingCurrencyId,
        CurrencyName:
          customer.BillingCurrencyName || customer.billingCurrencyName || "",
        Website: customer.Website || customer.website || "",
        CustomerNotes: customer.CustomerNotes || customer.customerNotes || "",
        createdDateTime:
          customer.CreatedDateTime || customer.createdDateTime || "",
      }));
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const fetchCurrencies = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/currencies?pageSize=500`);
    console.log("Currencies API response:", response.data);

    let currenciesData = [];
    if (response.data?.data) {
      currenciesData = response.data.data;
    } else if (Array.isArray(response.data)) {
      currenciesData = response.data;
    } else if (response.data?.results) {
      currenciesData = response.data.results;
    }

    const formattedCurrencies = currenciesData.map((currency) => ({
      CurrencyID: currency.CurrencyID || currency.currencyID || currency.id,
      CurrencyName:
        currency.CurrencyName || currency.currencyName || currency.name || "",
    }));

    return { success: true, data: formattedCurrencies };
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return { success: false, data: [], error: error.message };
  }
};

export const fetchCompanies = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/companies?pageSize=500`);
    console.log("Companies API response:", response.data);

    let companiesData = [];
    if (response.data?.data) {
      companiesData = response.data.data;
    } else if (Array.isArray(response.data)) {
      companiesData = response.data;
    } else if (response.data?.results) {
      companiesData = response.data.results;
    }

    const formattedCompanies = companiesData.map((company) => ({
      CompanyID: company.CompanyID || company.companyID || company.id,
      CompanyName:
        company.CompanyName || company.companyName || company.name || "",
    }));

    return { success: true, data: formattedCompanies };
  } catch (error) {
    console.error("Error fetching companies:", error);
    return { success: false, data: [], error: error.message };
  }
};

export const createCustomer = async (customerData) => {
  try {
    const user = getUserData(); // Use getUserData for consistency
    console.log("User data:", user);

    const requestData = {
      CustomerName: customerData.CustomerName, // Match backend's PascalCase
      CompanyID: Number(customerData.CompanyID),
      CustomerEmail: customerData.CustomerEmail || "",
      ImportCode: customerData.ImportCode || "",
      BillingCurrencyID: customerData.BillingCurrencyID
        ? Number(customerData.BillingCurrencyID)
        : null,
      Website: customerData.Website || "",
      CustomerNotes: customerData.CustomerNotes || "",
      IsInQuickBooks: customerData.IsInQuickBooks || false,
      QuickBookAccountID: customerData.QuickBookAccountId || null, // Match PascalCase
      CustomerAddressID: customerData.CustomerAddressId || null, // Match PascalCase
      CreatedByID: user.personId || user.id || 1, // Match backend's PascalCase
    };

    console.log("Formatted request data:", requestData);

    const response = await axios.post(`${APIBASEURL}/customers`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error in createCustomer:", error);
    throw (
      error.response?.data || {
        success: false,
        message: error.message || "Failed to create customer",
        data: null,
        customerId: null,
      }
    );
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    console.log("Input customerData:", customerData);
    console.log("Updating customer with ID:", id);

    // Validate input
    const validationErrors = validateCustomerData(customerData, "update");
    if (validationErrors.length > 0) {
      console.error("Validation errors:", validationErrors);
      throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
    }

    const user = getUserData();
    console.log("User data:", user);

    const requestData = {
      CustomerID: Number(id), // Match PascalCase
      CustomerName: customerData.CustomerName,
      CompanyID: Number(customerData.CompanyID),
      ImportCode: customerData.ImportCode || "",
      BillingCurrencyID: customerData.BillingCurrencyID
        ? Number(customerData.BillingCurrencyID)
        : null,
      Website: customerData.Website || "",
      CustomerNotes: customerData.CustomerNotes || "",
      CreatedByID:
        Number(customerData.CreatedByID) || user.personId || user.id || 1, // Match PascalCase
    };

    if (customerData.RowVersionColumn) {
      requestData.RowVersionColumn = customerData.RowVersionColumn;
    }

    console.log("Formatted request data:", requestData);
    console.log("Request URL:", `${APIBASEURL}/customers/${id}`);
    console.log("Request headers:", {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    });

    const response = await axios.put(
      `${APIBASEURL}/customers/${id}`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in updateCustomer:", error);
    console.error("Error response:", error.response?.data);
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const deleteCustomer = async (id) => {
  try {
    console.log(`Deleting customer with ID: ${id}`);
    const user = getUserData();

    if (!user || (!user.personId && !user.id)) {
      throw new Error("User authentication data not found");
    }

    const response = await axios.delete(`${APIBASEURL}/customers/${id}`, {
      data: {
        deletedById: user.personId || user.id || 1, // Match PascalCase
        createdById: user.personId || user.id || 1, // Match PascalCase
      },
    });

    console.log("Delete customer response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in deleteCustomer:", error);
    throw (
      error.response?.data || {
        message: error.message || "Failed to delete customer",
        success: false,
      }
    );
  }
};

export const getCustomerById = async (id) => {
  try {
    console.log(`Fetching customer with ID: ${id}`);
    const response = await axios.get(`${APIBASEURL}/customers/${id}`);
    console.log("Customer data response:", response.data);

    let customerData = null;
    if (response.data?.data) {
      customerData = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;
    } else if (response.data?.result === 0) {
      customerData = response.data.data;
    } else if (response.data?.CustomerID) {
      customerData = response.data;
    }

    if (!customerData) {
      throw new Error("Customer data not found in response");
    }

    // Normalize field names
    customerData = {
      CustomerID: customerData.CustomerID || customerData.customerId,
      CustomerName:
        customerData.CustomerName || customerData.customerName || "",
      CompanyID: customerData.CompanyID || customerData.companyId,
      CompanyName: customerData.CompanyName || customerData.companyName || "",
      ImportCode: customerData.ImportCode || customerData.importCode || "",
      BillingCurrencyID:
        customerData.BillingCurrencyID || customerData.billingCurrencyId,
      CurrencyName:
        customerData.BillingCurrencyName ||
        customerData.billingCurrencyName ||
        "",
      Website: customerData.Website || customerData.website || "",
      CustomerNotes:
        customerData.CustomerNotes || customerData.customerNotes || "",
      createdDateTime:
        customerData.CreatedDateTime || customerData.createdDateTime || "",
    };

    console.log("Processed customer data:", customerData);
    return customerData;
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw error.response?.data || { message: error.message, success: false };
  }
};
