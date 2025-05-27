import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Helper function to get auth token and personId from localStorage
const getAuthHeader = () => {
  try {
    console.log("User in localStorage:", localStorage.getItem("user"));

    const user = JSON.parse(localStorage.getItem("user")) || {};
    console.log("Parsed user object:", user);

    const personId = user?.personId || user?.id || user?.userId || null;
    console.log("Found personId:", personId);

    const token = user?.token || localStorage.getItem("token");
    console.log(
      "Found token:",
      token
        ? `Yes (token exists: ${token.substring(0, 10)}...)`
        : "No token found"
    );

    if (!personId) {
      console.warn("No personId found in user object");
    }

    return {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          }
        : {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
      personId,
    };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      personId: null,
    };
  }
};

// Create a new address type
export const createAddressType = async (addressTypeData) => {
  try {
    const { headers, personId } = getAuthHeader();

    const createdById =
      addressTypeData.CreatedByID || addressTypeData.createdById || personId;
    if (!createdById) {
      throw new Error("personId is required for CreatedByID");
    }

    const apiData = {
      AddressType: String(
        addressTypeData.AddressType || addressTypeData.addressType || ""
      ).trim(),
      addressType: String(
        addressTypeData.AddressType || addressTypeData.addressType || ""
      ).trim(),
      CreatedByID: Number(createdById),
      createdById: Number(createdById),
    };

    if (!apiData.AddressType && !apiData.addressType) {
      throw new Error("AddressType is required in the payload");
    }
    if (!apiData.CreatedByID && !apiData.createdById) {
      throw new Error("CreatedByID is required in the payload");
    }

    console.log(
      "Creating address type with formatted data:",
      JSON.stringify(apiData)
    );

    const response = await axios.post(`${APIBASEURL}/address-types`, apiData, {
      headers,
    });

    console.log("Create response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating address type:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Request URL:", error.config?.url);
      throw new Error(
        error.response.data?.message || "Failed to create address type"
      );
    } else if (error.request) {
      console.error("No response received, request:", error.request);
      throw new Error("No response received from server");
    } else {
      console.error("Error message:", error.message);
      throw error;
    }
  }
};

// Update an existing address type
export const updateAddressType = async (id, addressTypeData) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      throw new Error("personId is required for ModifiedByID");
    }

    const apiData = {
      AddressTypeID: Number(id),
      AddressType: String(
        addressTypeData.AddressType || addressTypeData.addressType || ""
      ).trim(),
      addressType: String(
        addressTypeData.AddressType || addressTypeData.addressType || ""
      ).trim(),
      CreatedByID: Number(personId),
      createdById: Number(personId),
    };

    if (addressTypeData.RowVersionColumn) {
      apiData.RowVersionColumn = addressTypeData.RowVersionColumn;
    }

    console.log(
      "Updating address type with formatted data:",
      JSON.stringify(apiData)
    );

    const response = await axios.put(
      `${APIBASEURL}/address-types/${id}`,
      apiData,
      {
        headers,
      }
    );

    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating address type:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Request URL:", error.config?.url);
      throw new Error(
        error.response.data?.message || "Failed to update address type"
      );
    } else if (error.request) {
      console.error("No response received, request:", error.request);
      throw new Error("No response received from server");
    } else {
      console.error("Error message:", error.message);
      throw error;
    }
  }
};

// Delete an address type
export const deleteAddressType = async (id) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      throw new Error("personId is required for deletion");
    }

    // Include both DeletedByID and CreatedByID to handle backend expectations
    const deleteData = {
      DeletedByID: Number(personId),
      deletedById: Number(personId),
      CreatedByID: Number(personId),
      createdById: Number(personId),
    };

    console.log(
      "Deleting address type with ID:",
      id,
      "and data:",
      JSON.stringify(deleteData)
    );

    const response = await axios.delete(`${APIBASEURL}/address-types/${id}`, {
      headers,
      data: deleteData,
    });

    console.log("Delete response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting address type:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Request URL:", error.config?.url);
      throw new Error(
        error.response.data?.message || "Failed to delete address type"
      );
    } else if (error.request) {
      console.error("No response received, request:", error.request);
      throw new Error("No response received from server");
    } else {
      console.error("Error message:", error.message);
      throw error;
    }
  }
};

// Get an address type by ID
export const getAddressTypeById = async (id) => {
  try {
    const { headers } = getAuthHeader();

    const response = await axios.get(`${APIBASEURL}/address-types/${id}`, {
      headers,
    });

    console.log("Address type data response:", response.data);

    let addressTypeData = null;
    if (response.data.data) {
      addressTypeData = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;
    } else if (response.data.AddressTypeID) {
      addressTypeData = response.data;
    }

    if (!addressTypeData) {
      console.warn("Address type data not found in response:", response.data);
      return response.data;
    }

    console.log("Processed address type data:", addressTypeData);
    return addressTypeData;
  } catch (error) {
    console.error("Error fetching address type:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Request URL:", error.config?.url);
      throw new Error(
        error.response.data?.message || "Failed to fetch address type"
      );
    } else if (error.request) {
      console.error("No response received, request:", error.request);
      throw new Error("No response received from server");
    } else {
      console.error("Error message:", error.message);
      throw error;
    }
  }
};

// Fetch address types with pagination and filtering
export const fetchAddressTypes = async (
  page,
  pageSize,
  fromDate,
  toDate,
  searchTerm
) => {
  try {
    const { headers } = getAuthHeader();

    const params = {
      page,
      pageSize,
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(searchTerm && { search: searchTerm }),
    };

    console.log("Fetching address types with params:", params);

    const response = await axios.get(`${APIBASEURL}/address-types`, {
      headers,
      params,
    });

    console.log("Fetch address types response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching address types:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Request URL:", error.config?.url);
      throw new Error(
        error.response.data?.message || "Failed to fetch address types"
      );
    } else if (error.request) {
      console.error("No response received, request:", error.request);
      throw new Error("No response received from server");
    } else {
      console.error("Error message:", error.message);
      throw error;
    }
  }
};
