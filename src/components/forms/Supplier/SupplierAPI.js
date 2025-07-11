import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Helper function to get user data safely
const getUserData = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.warn("No user data in localStorage, using default personId: 1");
      return { personId: 1 };
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return { personId: 1 };
  }
};

// Validate required fields for supplier operations
const validateSupplierData = (data, operation = "create") => {
  const errors = [];
  if (operation !== "delete") {
    if (
      !data.supplierName ||
      typeof data.supplierName !== "string" ||
      data.supplierName.trim() === ""
    ) {
      errors.push("supplierName is required and must be a non-empty string");
    }
    if (data.supplierEmail && !/^\S+@\S+\.\S+$/.test(data.supplierEmail)) {
      errors.push("supplierEmail must be a valid email if provided");
    }
  }
  return errors;
};

export const fetchSuppliers = async (page = 1, limit = 10,fromDate = null,
  toDate = null,
  searchTerm = "") => {
  try {
    let url = `${APIBASEURL}/suppliers?pageNumber=${page}&pageSize=${limit}`;
        if (fromDate) url += `&fromDate=${encodeURIComponent(fromDate)}`;
    if (toDate) url += `&toDate=${encodeURIComponent(toDate)}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    const response = await axios.get(url);
    console.log("Fetch suppliers response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const createSupplier = async (supplierData) => {
  try {
    console.log("Creating supplier with data:", supplierData);

    // Validate input
    const validationErrors = validateSupplierData(supplierData, "create");
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
    }

    const user = getUserData();

    // Format request data
    const requestData = {
      supplierName: supplierData.supplierName.trim(),
      companyId: 48, // Default to 48
      billingCurrencyId: supplierData.billingCurrencyId
        ? Number(supplierData.billingCurrencyId)
        : null,
      website: supplierData.website || "",
      supplierNotes: supplierData.supplierNotes || "",
      supplierEmail: supplierData.supplierEmail || "",
      userId: user.personId || 1,
    };

    console.log("Formatted request data:", requestData);

    const response = await axios.post(`${APIBASEURL}/suppliers`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error in createSupplier:", error);
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const updateSupplier = async (id, supplierData) => {
  try {
    console.log("Updating supplier with ID:", id, "Data:", supplierData);

    // Validate input
    const validationErrors = validateSupplierData(supplierData, "update");
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
    }

    const user = getUserData();

    // Format request data
    const requestData = {
      supplierId: Number(id),
      supplierName: supplierData.supplierName.trim(),
      companyId: 48, // Default to 48
      billingCurrencyId: supplierData.billingCurrencyId
        ? Number(supplierData.billingCurrencyId)
        : null,
      website: supplierData.website || "",
      supplierNotes: supplierData.supplierNotes || "",
      supplierEmail: supplierData.supplierEmail || "",
      userId: user.personId || 1,
    };

    console.log("Formatted update request data:", requestData);

    const response = await axios.put(
      `${APIBASEURL}/suppliers/${id}`,
      requestData
    );
    return response.data;
  } catch (error) {
    console.error("Error in updateSupplier:", error);
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const deleteSupplier = async (id) => {
  try {
    console.log(`Deleting supplier with ID: ${id}`);
    const user = getUserData();

    const response = await axios.delete(`${APIBASEURL}/suppliers/${id}`, {
      data: {
        userId: user.personId || 1,
      },
    });

    console.log("Delete supplier response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in deleteSupplier:", error);
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const getSupplierById = async (id) => {
  try {
    console.log(`Fetching supplier with ID: ${id}`);
    const response = await axios.get(`${APIBASEURL}/suppliers/${id}`);
    console.log("Get supplier by ID response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getSupplierById:", error);
    throw error.response?.data || { message: error.message, success: false };
  }
};
