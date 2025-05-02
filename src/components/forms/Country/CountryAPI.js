import axios from "axios";

// Update the API endpoint to match your backend structure
const API_BASE_URL = "http://localhost:7000/api/country-Of-Origin";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Configure axios with auth headers
const getAxiosConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

export const fetchCountries = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    let url = `${API_BASE_URL}?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const response = await axios.get(url, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch countries:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const createCountry = async (countryData) => {
  try {
    console.log("[DEBUG] Original countryData:", countryData);

    // Get current user from localStorage for createdById
    const user = JSON.parse(localStorage.getItem("user")) || {};
    console.log("[DEBUG] Current user from localStorage:", user);

    // Validate country name (check both possible field names)
    const countryName = countryData.countryOfOrigin || countryData.CountryOfOrigin;
    if (!countryName || typeof countryName !== "string") {
      throw new Error("Invalid or missing country name");
    }

    // Prepare request data with correct field casing to match backend expectations
    const currentDateTime = new Date().toISOString();
    const dataWithCreator = {
      CountryOfOrigin: countryName, // Use capital letters to match backend model
      CreatedByID: user.personId || 1, // Use capital letters to match backend model
      createdDateTime: currentDateTime,
      isDeleted: 0,
    };

    console.log(
      "[DEBUG] Final request data:",
      JSON.stringify(dataWithCreator, null, 2)
    );
    console.log("[DEBUG] Full request config:", {
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
    console.log("[DEBUG] Successful response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to create country:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      requestBody: error.config?.data,
      headers: error.response?.headers,
    });
    throw error.response?.data || error.message;
  }
};

export const updateCountry = async (countryId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/${countryId}`,
      data,
      getAxiosConfig()
    );
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to update country:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};

export const deleteCountry = async (id, deletedById) => {
  try {
    // If no deletedById is provided, get personId from localStorage
    if (!deletedById) {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      deletedById = user.personId || 1; // Fallback to 1 if no personId found
    }

    const requestData = { deletedById };
    console.log(
      "[DEBUG] Delete request data:",
      JSON.stringify(requestData, null, 2)
    );
    console.log("[DEBUG] Full request config:", {
      url: `${API_BASE_URL}/${id}`,
      method: "DELETE",
      data: requestData,
      headers: getAxiosConfig().headers,
    });

    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      ...getAxiosConfig(),
      data: requestData,
    });

    console.log("[DEBUG] Successful delete response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[ERROR] Failed to delete country:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      requestBody: error.config?.data,
      headers: error.response?.headers,
    });
    throw error.response?.data || error.message;
  }
};
