import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

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
    let url = `${APIBASEURL}/country-Of-Origin?pageNumber=${page}&pageSize=${limit}`;
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
      countryOfOrigin: countryName,
      createdById: user.personId || 1,
      createdDateTime: currentDateTime,
      isDeleted: 0,
    };

    console.log(
      "[DEBUG] Final request data:",
      JSON.stringify(dataWithCreator, null, 2)
    );
    console.log("[DEBUG] Full request config:", {
      url: `${APIBASEURL}/country-Of-Origin`,
      method: "POST",
      data: dataWithCreator,
      headers: getAxiosConfig().headers,
    });

    const response = await axios.post(
      `${APIBASEURL}/country-of-origin`,
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
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const payload = {
      countryOfOrigin: data.CountryOfOrigin || data.countryOfOrigin,
      createdById: user.personId || data.CreatedByID || 1,
    };
    console.log(
      "[DEBUG] Update request data:",
      JSON.stringify(payload, null, 2)
    );
    const response = await axios.put(
      `${APIBASEURL}/country-of-origin/${countryId}`,
      payload,
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

export const deleteCountry = async (id, createdById) => {
  try {
    if (!createdById) {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      // deletedById = user.personId || 1;
      createdById = user.personId || 1;
    }

    const requestData = { createdById };
    console.log(
      "[DEBUG] Delete request data:",
      JSON.stringify(requestData, null, 2)
    );
    console.log("[DEBUG] Full request config:", {
      url: `${APIBASEURL}/country-of-origin/${id}`,
      method: "DELETE",
      data: requestData,
      headers: getAxiosConfig().headers,
    });

    const response = await axios.delete(
      `${APIBASEURL}/country-of-origin/${id}`,
      {
        ...getAxiosConfig(),
        data: requestData,
      }
    );

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
    const response = await axios.get(`${APIBASEURL}/country-Of-Origin/${id}`, getAxiosConfig());
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