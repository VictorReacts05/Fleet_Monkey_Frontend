import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token;
};

// Configure axios with auth headers
const getAxiosConfig = () => {
  const token = getAuthToken();
  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
  return config;
};

// Helper function to get user from localStorage
const getUserFromLocalStorage = () => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};
  if (!user.personId) {
    console.warn(
      "[WARN] No personId found in localStorage.user. Using fallback ID 1."
    );
  }
  return user;
};

export const fetchCities = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    const user = getUserFromLocalStorage();

    let url = `${APIBASEURL}/city?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const response = await axios.get(url, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch cities:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    throw error.response?.data || error.message;
  }
};

export const createCity = async (cityData) => {
  try {
    const user = getUserFromLocalStorage();

    // Validate cityName and countryId
    if (!cityData.cityName || typeof cityData.cityName !== "string") {
      throw new Error("Invalid or missing cityName");
    }
    if (!cityData.countryId || isNaN(cityData.countryId)) {
      throw new Error("Invalid or missing countryId");
    }
    if (!user.personId) {
      throw new Error(
        "User not authenticated: No personId found in localStorage"
      );
    }

    // Prepare request data with correct field names (capital letters to match backend)
    const currentDateTime = new Date().toISOString();
    const dataWithCreator = {
      cityName: cityData.cityName,         // Changed from cityName to CityName
      countryId: Number(cityData.countryId), // Changed from countryId to CountryID
      createdById: user.personId,          // Changed from createdById to CreatedByID
      createdDateTime: currentDateTime,
      isDeleted: 0,
    };

    const response = await axios.post(
      `${APIBASEURL}/city`,
      dataWithCreator,
      getAxiosConfig()
    );
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to create city:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      requestBody: error.config?.data,
      headers: error.response?.headers,
    });
    throw error.response?.data || error.message;
  }
};

export const updateCity = async (cityId, data) => {
  try {
    const user = getUserFromLocalStorage();

    if (!user.personId) {
      throw new Error(
        "User not authenticated: No personId found in localStorage"
      );
    }

    // Prepare data with correct field names (capital letters to match backend)
    const dataWithUpdater = {
      cityId: Number(cityId),                // Added CityID with proper capitalization
      cityName: data.cityName,               // Changed from cityName to CityName
      countryId: Number(data.countryId),     // Changed from countryId to CountryID
      createdById: user.personId,            // Changed from createdById to CreatedByID
      updatedDateTime: new Date().toISOString(),
    };

    console.log("[DEBUG] City update request data:", dataWithUpdater);

    const response = await axios.put(
      `${APIBASEURL}/city/${cityId}`,
      dataWithUpdater,
      getAxiosConfig()
    );
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to update city:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      requestBody: error.config?.data,
      headers: error.response?.headers,
    });
    throw error.response?.data || error.message;
  }
};

export const deleteCity = async (id, deletedById) => {
  try {
    const user = getUserFromLocalStorage();

    // Use provided deletedById or fall back to personId from localStorage
    const finalDeletedById = deletedById || user.personId || 1;
    if (finalDeletedById === 1) {
      console.warn(
        "[WARN] Using fallback deletedById: 1. Ensure user is logged in with valid personId."
      );
    }
    if (!user.personId) {
      throw new Error(
        "User not authenticated: No personId found in localStorage"
      );
    }

    const requestData = { deletedById: finalDeletedById };

    const response = await axios.delete(`${APIBASEURL}/city/${id}`, {
      ...getAxiosConfig(),
      data: requestData,
    });

    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to delete city:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      requestBody: error.config?.data,
      headers: error.response?.headers,
    });
    throw error.response?.data || error.message;
  }
};

export const getCityById = async (id) => {
  try {
    const user = getUserFromLocalStorage();

    const response = await axios.get(`${APIBASEURL}/city/${id}`, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to get city by ID:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    throw error.response?.data || error.message;
  }
};
export const fetchCountries = async () => {
  try {
    const user = getUserFromLocalStorage();
    const url = `${APIBASEURL}/country-of-origin?pageSize=500`;
    const response = await axios.get(url, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch countries:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    throw error.response?.data || error.message;
  }
};