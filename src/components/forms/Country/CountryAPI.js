import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/country-Of-Origin";

const getAuthToken = () => {
  return localStorage.getItem("token");
};

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

    const user = JSON.parse(localStorage.getItem("user")) || {};
    console.log("[DEBUG] Current user from localStorage:", user);

    const countryName = countryData.countryOfOrigin || countryData.CountryOfOrigin;
    if (!countryName || typeof countryName !== "string") {
      throw new Error("Invalid or missing country name");
    }

    const currentDateTime = new Date().toISOString();
    const dataWithCreator = {
      CountryOfOrigin: countryName,
      CreatedByID: user.personId || 1,
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
    console.log("[DEBUG] Update request data:", JSON.stringify(data, null, 2));
    const response = await axios.put(
      `${API_BASE_URL}/${countryId}`,
      data,
      getAxiosConfig()
    );
    console.log("[DEBUG] Successful update response:", response.data);
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
    if (!deletedById) {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      deletedById = user.personId || 1;
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

export const getCountryById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, getAxiosConfig());
    console.log("[DEBUG] getCountryById response:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("[ERROR] Failed to fetch country by ID:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data || error.message;
  }
};