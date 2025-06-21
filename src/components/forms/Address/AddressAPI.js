import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Define API base URLs directly
const API_ADDRESS_TYPES = `${APIBASEURL}/address-types`;
const API_CITIES = `${APIBASEURL}/city`; // Updated to /api/city
const API_COUNTRIES = `${APIBASEURL}/country-of-origin`;
const API_ADDRESSES = `${APIBASEURL}/addresses`;

// Helper function to get user data safely
const getUserData = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.warn("No user data in localStorage, using default personId: 1");
      return { personId: 1, token: null };
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return { personId: 1, token: null };
  }
};

// Fetch all address types
export const fetchAddressTypes = async () => {
  try {
    const user = getUserData();
    const headers = {
      "Content-Type": "application/json",
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };
    console.log("Fetching address types from:", API_ADDRESS_TYPES);
    const response = await axios.get(API_ADDRESS_TYPES, { headers });
    console.log("Raw address types response:", response.data);
    // Normalize response to always return an array
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data.results)
      ? response.data.results
      : [];
    console.log("Normalized address types data:", data);
    if (!data.length) {
      console.warn("No address types data returned from API");
    }
    return data;
  } catch (error) {
    console.error("Error fetching address types:", error);
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    return []; // Return empty array to allow partial success
  }
};

// Fetch all cities
export const fetchCities = async () => {
  try {
    const user = getUserData();
    const headers = {
      "Content-Type": "application/json",
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };
    console.log("Fetching cities from:", API_CITIES);
    const response = await axios.get(API_CITIES, { headers });
    console.log("Raw cities response:", response.data);
    // Normalize response to always return an array
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data.results)
      ? response.data.results
      : [];
    console.log("Normalized cities data:", data);
    if (!data.length) {
      console.warn("No cities data returned from API");
    }
    return data;
  } catch (error) {
    console.error("Error fetching cities:", error);
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    return []; // Return empty array to allow partial success
  }
};

// Fetch all countries
export const fetchCountries = async () => {
  try {
    const user = getUserData();
    const headers = {
      "Content-Type": "application/json",
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };
    console.log("Fetching countries from:", API_COUNTRIES);
    const response = await axios.get(API_COUNTRIES, { headers });
    console.log("Raw countries response:", response.data);
    // Normalize response to always return an array
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data.data)
      ? response.data.data
      : Array.isArray(response.data.results)
      ? response.data.results
      : [];
    console.log("Normalized countries data:", data);
    if (!data.length) {
      console.warn("No countries data returned from API");
    }
    return data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    return []; // Return empty array to allow partial success
  }
};

// Fetch all addresses with pagination, date range, and search
export const fetchAddresses = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null,
  searchTerm = ""
) => {
  try {
    const user = getUserData();
    const headers = {
      "Content-Type": "application/json",
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };
    let url = `${API_ADDRESSES}?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${encodeURIComponent(fromDate)}`;
    if (toDate) url += `&toDate=${encodeURIComponent(toDate)}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    console.log("Fetching addresses with URL:", url);
    const response = await axios.get(url, { headers });
    console.log("Fetch addresses response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw {
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch addresses",
      success: false,
      status: error.response?.status,
    };
  }
};

// Create address
export const createAddress = async (addressData) => {
  try {
    console.log("Creating address with data:", addressData);
    const user = getUserData();
    if (!user.personId) {
      throw new Error("User ID not found. Please log in again.");
    }

    const payload = {
      addressName: addressData.addressName?.trim() || "",
      addressTypeId: Number(addressData.addressTypeId) || null,
      addressLine1: addressData.addressLine1?.trim() || "",
      addressLine2: addressData.addressLine2?.trim() || "",
      city: Number(addressData.cityId) || null,
      country: Number(addressData.countryId) || null,
      createdById: Number(user.personId),
      addressTitle: "",
      county: "",
      state: "",
      postalCode: "",
      preferredBillingAddress: 0,
      preferredShippingAddress: 0,
      longitude: null,
      latitude: null,
      disabled: 0,
    };

    console.log("Formatted create request data:", payload);

    const headers = {
      "Content-Type": "application/json",
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };

    const response = await axios.post(API_ADDRESSES, payload, { headers });
    console.log("Create address response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in createAddress:", error);
    throw {
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to create address",
      success: false,
      status: error.response?.status,
    };
  }
};

// Update address
export const updateAddress = async (id, addressData) => {
  try {
    console.log("Updating address with ID:", id, "Data:", addressData);
    const user = getUserData();
    if (!user.personId) {
      throw new Error("User ID not found. Please log in again.");
    }

    const payload = {
      addressId: Number(id),
      addressName: addressData.addressName?.trim() || "",
      addressTypeId: Number(addressData.addressTypeId) || null,
      addressLine1: addressData.addressLine1?.trim() || "",
      addressLine2: addressData.addressLine2?.trim() || "",
      city: Number(addressData.cityId) || null,
      country: Number(addressData.countryId) || null,
      createdById: Number(user.personId),
      addressTitle: "",
      county: "",
      state: "",
      postalCode: "",
      preferredBillingAddress: 0,
      preferredShippingAddress: 0,
      longitude: null,
      latitude: null,
      disabled: 0,
    };

    console.log("Formatted update request data:", payload);

    const headers = {
      "Content-Type": "application/json",
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };

    const response = await axios.put(`${API_ADDRESSES}/${id}`, payload, {
      headers,
    });
    console.log("Update address response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in updateAddress:", error);
    throw {
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to update address",
      success: false,
      status: error.response?.status,
    };
  }
};

// Delete address
export const deleteAddress = async (id) => {
  try {
    console.log(`Deleting address with ID: ${id}`);
    const user = getUserData();
    if (!user.personId) {
      throw new Error("User ID not found. Please log in again.");
    }

    const headers = {
      "Content-Type": "application/json",
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };

    const response = await axios.delete(`${API_ADDRESSES}/${id}`, {
      headers,
      data: {
        createdById: Number(user.personId),
      },
    });

    console.log("Delete address response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in deleteAddress:", error);
    throw {
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to delete address",
      success: false,
      status: error.response?.status,
    };
  }
};

// Get address by ID
export const getAddressById = async (id) => {
  try {
    if (!id || isNaN(Number(id))) {
      throw new Error("Invalid address ID");
    }
    console.log(`Fetching address with ID: ${id}`);
    console.log(`Request URL: ${API_ADDRESSES}/${id}`);
    const user = getUserData();
    const headers = {
      "Content-Type": "application/json",
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };
    const response = await axios.get(`${API_ADDRESSES}/${id}`, { headers });
    console.log("Address data response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching address:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      responseData: error.response?.data,
      requestUrl: `${API_ADDRESSES}/${id}`,
    });
    throw {
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch address",
      success: false,
      status: error.response?.status,
    };
  }
};
