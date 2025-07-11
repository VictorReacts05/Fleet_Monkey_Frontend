import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

export const fetchCertifications = async (
  pageNumber = 1,
  pageSize = 10,
  fromDate,
  toDate,
  sortBy = "CreatedDateTime",       // or any relevant field
  sortOrder = "desc"                // set default to descending
) => {
  try {
    const response = await axios.get(`${APIBASEURL}/certifications`, {
      params: {
        pageNumber,
        pageSize,
        fromDate,
        toDate,
        sortBy,
        sortOrder,
      },
    });

    const data = Array.isArray(response.data)
      ? response.data
      : response.data.data || response.data.results || [];

    let cachedTotalRecords =
      Number(localStorage.getItem("certificationTotalRecords")) || 0;

    if (data.length > cachedTotalRecords) {
      cachedTotalRecords = data.length;
      localStorage.setItem("certificationTotalRecords", cachedTotalRecords);
    }

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
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user")) || {};
    
    // Prepare data with correct field names (capital letters to match backend)
    const requestData = {
      certificationName: certificationData.CertificationName,
      createdById: certificationData.CreatedByID || user.personId || 1,
    };
    
    console.log("[DEBUG] Certification create request data:", requestData);
    
    const response = await axios.post(`${APIBASEURL}/certifications`, requestData);
    
    // Update cached totalRecords after creating a new certification
    const cachedTotalRecords =
      Number(localStorage.getItem("certificationTotalRecords")) || 0;
    localStorage.setItem("certificationTotalRecords", cachedTotalRecords + 1);
    
    return response.data;
  } catch (error) {
    console.error("Error creating certification:", error);
    throw error.response?.data || error.message;
  }
};

export const updateCertification = async (id, certificationData) => {
  try {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user")) || {};
    
    // Prepare data with correct field names (capital letters to match backend)
    const requestData = {
      certificationId: Number(id),
      certificationName: certificationData.CertificationName,
      createdById: user.personId || 1,
    };
    
    if (certificationData.RowVersionColumn) {
      requestData.RowVersionColumn = certificationData.RowVersionColumn;
    }
    
    console.log("[DEBUG] Certification update request data:", requestData);
    
    const response = await axios.put(`${APIBASEURL}/certifications/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error updating certification:", error);
    throw error.response?.data || error.message;
  }
};

export const deleteCertification = async (id) => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    await axios.delete(`${APIBASEURL}/certifications/${id}`, {
      data: {
        createdById: user.personId,
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
    const response = await axios.get(`${APIBASEURL}/certifications/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
