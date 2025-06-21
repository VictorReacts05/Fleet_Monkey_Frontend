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

// Validate required fields for item operations
const validateItemData = (data, operation = "create") => {
  const errors = [];
  if (
    !data.ItemCode ||
    typeof data.ItemCode !== "string" ||
    data.ItemCode.trim() === ""
  ) {
    errors.push("ItemCode is required and must be a non-empty string");
  }
  if (
    !data.ItemName ||
    typeof data.ItemName !== "string" ||
    data.ItemName.trim() === ""
  ) {
    errors.push("ItemName is required and must be a non-empty string");
  }
  return errors;
};

export const fetchItems = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    let url = `${APIBASEURL}/items?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const response = await axios.get(url);

    if (response.data?.data) {
      response.data.data = response.data.data.map((item) => ({
        id: item.ItemID || item.itemId,
        ItemID: item.ItemID || item.itemId,
        ItemCode: item.ItemCode || item.itemCode || "",
        ItemName: item.ItemName || item.itemName || "",
        createdDateTime: item.CreatedDateTime || item.createdDateTime || "",
      }));
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const createItem = async (itemData) => {
  try {
    const user = getUserData();
    console.log("User data:", user);

    const requestData = {
      itemCode: itemData.ItemCode,
      itemName: itemData.ItemName,
      createdById: user.personId || user.id || 1,
    };

    console.log("Formatted request data:", requestData);

    const response = await axios.post(`${APIBASEURL}/items`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error in createItem:", error);
    throw (
      error.response?.data || {
        success: false,
        message: error.message || "Failed to create item",
        data: null,
        itemId: null,
      }
    );
  }
};

export const updateItem = async (id, itemData) => {
  try {
    console.log("Input itemData:", itemData);
    console.log("Updating item with ID:", id);

    const validationErrors = validateItemData(itemData, "update");
    if (validationErrors.length > 0) {
      console.error("Validation errors:", validationErrors);
      throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
    }

    const user = getUserData();
    console.log("User data:", user);

    const requestData = {
      ItemID: Number(id),
      itemCode: itemData.ItemCode,
      itemName: itemData.ItemName,
      createdById:
        Number(itemData.CreatedByID) || user.personId || user.id || 1,
    };

    if (itemData.RowVersionColumn) {
      requestData.RowVersionColumn = itemData.RowVersionColumn;
    }

    console.log("Formatted request data:", requestData);
    console.log("Request URL:", `${APIBASEURL}/items/${id}`);

    const response = await axios.put(`${APIBASEURL}/items/${id}`, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in updateItem:", error);
    throw error.response?.data || { message: error.message, success: false };
  }
};

export const deleteItem = async (id) => {
  try {
    console.log(`Deleting item with ID: ${id}`);
    const user = getUserData();

    if (!user || (!user.personId && !user.id)) {
      throw new Error("User authentication data not found");
    }

    const response = await axios.delete(`${APIBASEURL}/items/${id}`, {
      data: {
        deletedById: user.personId || user.id || 1,
        createdById: user.personId || user.id || 1,
      },
    });

    console.log("Delete item response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in deleteItem:", error);
    throw (
      error.response?.data || {
        message: error.message || "Failed to delete item",
        success: false,
      }
    );
  }
};

export const getItemById = async (id) => {
  try {
    console.log(`Fetching item with ID: ${id}`);
    const response = await axios.get(`${APIBASEURL}/items/${id}`);
    console.log("Item data response:", response.data);

    let itemData = null;
    if (response.data?.data) {
      itemData = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;
    } else if (response.data?.result === 0) {
      itemData = response.data.data;
    } else if (response.data?.ItemID) {
      itemData = response.data;
    }

    if (!itemData) {
      throw new Error("Item data not found in response");
    }

    itemData = {
      ItemID: itemData.ItemID || itemData.itemId,
      ItemCode: itemData.ItemCode || itemData.itemCode || "",
      ItemName: itemData.ItemName || itemData.itemName || "",
      createdDateTime:
        itemData.CreatedDateTime || itemData.createdDateTime || "",
    };

    console.log("Processed item data:", itemData);
    return itemData;
  } catch (error) {
    console.error("Error fetching item:", error);
    throw error.response?.data || { message: error.message, success: false };
  }
};
