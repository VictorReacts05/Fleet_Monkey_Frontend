import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/cities";
const CITIES_ALL_URL = "http://localhost:7000/api/cities/all";
const COUNTRY_API_URL = "http://localhost:7000/api/country-Of-Origin";

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  console.log(
    "[DEBUG] Retrieved token from localStorage:",
    token ? "Token exists" : "No token found"
  );
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
  console.log("[DEBUG] Axios config:", {
    headers: {
      Authorization: token ? "Bearer [REDACTED]" : "No token",
      "Content-Type": "application/json",
    },
  });
  return config;
};

// Helper function to get user from localStorage
const getUserFromLocalStorage = () => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};
  console.log("[DEBUG] User from localStorage:", {
    personId: user.personId || "Not found",
    role: user.role || "Not found",
    loginId: user.loginId || "Not found",
    hasToken: !!user.token,
    rawUserString: userString || "No user data in localStorage",
  });
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
    console.log("[DEBUG] fetchCities called with:", {
      page,
      limit,
      fromDate,
      toDate,
    });
    const user = getUserFromLocalStorage();

    let url = `${CITIES_ALL_URL}?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;
    console.log("[DEBUG] Fetch cities URL:", url);

    const response = await axios.get(url, getAxiosConfig());
    console.log("[DEBUG] fetchCities response:", {
      status: response.status,
      data: response.data,
    });
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
    console.log("[DEBUG] createCity called with cityData:", cityData);
    const user = getUserFromLocalStorage();

    // Validate cityName and countryId
    if (!cityData.cityName || typeof cityData.cityName !== "string") {
      throw new Error("Invalid or missing cityName");
    }
    if (!cityData.countryId || typeof cityData.countryId !== "number") {
      throw new Error("Invalid or missing countryId");
    }
    if (!user.personId) {
      throw new Error(
        "User not authenticated: No personId found in localStorage"
      );
    }

    // Prepare request data
    const currentDateTime = new Date().toISOString();
    const dataWithCreator = {
      cityName: cityData.cityName,
      countryId: cityData.countryId,
      createdById: user.personId,
      createdDateTime: currentDateTime,
      isDeleted: 0,
    };

    console.log(
      "[DEBUG] Final createCity request data:",
      JSON.stringify(dataWithCreator, null, 2)
    );
    console.log("[DEBUG] Full createCity request config:", {
      url: API_BASE_URL,
      method: "POST",
      data: dataWithCreator,
      headers: getAxiosConfig().headers,
    });

    const response = await axios.post(
      API_BASE_URL,
      dataWithCreator,
      getAxiosConfig()
    );
    console.log("[DEBUG] createCity response:", {
      status: response.status,
      data: response.data,
    });
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
    console.log("[DEBUG] updateCity called with:", { cityId, data });
    const user = getUserFromLocalStorage();

    if (!user.personId) {
      throw new Error(
        "User not authenticated: No personId found in localStorage"
      );
    }

    const dataWithUpdater = {
      ...data,
      updatedById: user.personId,
      updatedDateTime: new Date().toISOString(),
    };

    console.log(
      "[DEBUG] Final updateCity request data:",
      JSON.stringify(dataWithUpdater, null, 2)
    );
    console.log("[DEBUG] Full updateCity request config:", {
      url: `${API_BASE_URL}/${cityId}`,
      method: "PUT",
      data: dataWithUpdater,
      headers: getAxiosConfig().headers,
    });

    const response = await axios.put(
      `${API_BASE_URL}/${cityId}`,
      dataWithUpdater,
      getAxiosConfig()
    );
    console.log("[DEBUG] updateCity response:", {
      status: response.status,
      data: response.data,
    });
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
    console.log("[DEBUG] deleteCity called with:", { id, deletedById });
    const user = getUserFromLocalStorage();

    // Use provided deletedById or fall back to personId from localStorage
    const finalDeletedById = deletedById || user.personId || 1;
    console.log("[DEBUG] Final deletedById:", finalDeletedById);
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
    console.log(
      "[DEBUG] Delete request data:",
      JSON.stringify(requestData, null, 2)
    );
    console.log("[DEBUG] Full deleteCity request config:", {
      url: `${API_BASE_URL}/${id}`,
      method: "DELETE",
      data: requestData,
      headers: getAxiosConfig().headers,
    });

    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      ...getAxiosConfig(),
      data: requestData,
    });

    console.log("[DEBUG] deleteCity response:", {
      status: response.status,
      data: response.data,
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
    console.log("[DEBUG] getCityById called with:", { id });
    const user = getUserFromLocalStorage();

    console.log("[DEBUG] Full getCityById request config:", {
      url: `${API_BASE_URL}/${id}`,
      method: "GET",
      headers: getAxiosConfig().headers,
    });

    const response = await axios.get(`${API_BASE_URL}/${id}`, getAxiosConfig());
    console.log("[DEBUG] getCityById response:", {
      status: response.status,
      data: response.data,
    });
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
    console.log("[DEBUG] fetchCountries called");
    const user = getUserFromLocalStorage();

    const url = `${COUNTRY_API_URL}?pageSize=100`;
    console.log("[DEBUG] Fetch countries URL:", url);

    const response = await axios.get(url, getAxiosConfig());
    console.log("[DEBUG] fetchCountries response:", {
      status: response.status,
      data: response.data,
    });
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
