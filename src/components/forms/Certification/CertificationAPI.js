import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/certifications";

export const fetchCertifications = async (
  pageNumber = 1,
  pageSize = 10,
  fromDate,
  toDate
) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: {
        pageNumber,
        pageSize,
        fromDate,
        toDate,
      },
    });

    // Log response for debugging

    // Handle different possible response structures
    const data = Array.isArray(response.data)
      ? response.data
      : response.data.data || response.data.results || [];

    // Get cached totalRecords from local storage
    let cachedTotalRecords =
      Number(localStorage.getItem("certificationTotalRecords")) || 0;

    // Update cached totalRecords if the current data.length is larger
    if (data.length > cachedTotalRecords) {
      cachedTotalRecords = data.length;
      localStorage.setItem("certificationTotalRecords", cachedTotalRecords);
    }

    // Use cached totalRecords as the fallback
    const totalRecords = Number(
      response.data.pagination?.totalRecords ||
        response.data.totalRecords ||
        response.data.totalCount ||
        cachedTotalRecords ||
        data.length
    );

    return {
      data,
      pagination: {
        totalRecords,
      },
    };
  } catch (error) {
    console.error("Error fetching certifications:", error);
    throw error.response?.data || error.message;
  }
};

export const createCertification = async (certificationData) => {
  try {
    const response = await axios.post(API_BASE_URL, {
      certificationName: certificationData.CertificationName,
      createdById: certificationData.CreatedByID,
    });
    // Update cached totalRecords after creating a new certification
    const cachedTotalRecords =
      Number(localStorage.getItem("certificationTotalRecords")) || 0;
    localStorage.setItem("certificationTotalRecords", cachedTotalRecords + 1);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateCertification = async (id, certificationData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, {
      certificationName: certificationData.CertificationName,
      rowVersionColumn: certificationData.rowVersionColumn,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteCertification = async (id) => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    await axios.delete(`${API_BASE_URL}/${id}`, {
      data: {
        deletedById: user.personId || 1,
      },
    });
    // Update cached totalRecords after deleting a certification
    const cachedTotalRecords =
      Number(localStorage.getItem("certificationTotalRecords")) || 0;
    if (cachedTotalRecords > 0) {
      localStorage.setItem("certificationTotalRecords", cachedTotalRecords - 1);
    }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCertificationById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
