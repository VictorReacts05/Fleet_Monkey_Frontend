import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

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

// Helper function to get user data safely
const getUserData = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData) {
      throw new Error("User data not found in localStorage");
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return { personId: null }; // Avoid defaulting to 1 for production
  }
};

// Fetch all form role approvers with pagination and search
export const fetchFormRoleApprovers = async (
  pageNumber = 1,
  pageSize = 10,
  searchTerm = ''
) => {
  try {
    let url = `${APIBASEURL}/formRoleApprover?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;

    const response = await axios.get(url, getAxiosConfig());

    const data = Array.isArray(response.data.data)
      ? response.data.data
      : response.data.data || [];

    const cachedTotalRecords =
      Number(localStorage.getItem('formRoleApproverTotalRecords')) || 0;

    if (data.length > cachedTotalRecords) {
      localStorage.setItem('formRoleApproverTotalRecords', data.length);
    }

    const totalRecords = Number(
      response.data.totalRecords || cachedTotalRecords || data.length
    );

    return {
      data,
      pagination: {
        totalRecords,
      },
    };
  } catch (error) {
    console.error('[ERROR] Failed to fetch form role approvers:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(
      error.response?.data?.message || 'Failed to fetch form role approvers. Please try again later.'
    );
  }
};
// Fetch all form roles for dropdown
export const fetchFormRoles = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/formRole`, getAxiosConfig());
    return Array.isArray(response.data.data)
      ? response.data.data
      : response.data.data || [];
  } catch (error) {
    console.error("[ERROR] Failed to fetch form roles:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data?.message || error.message;
  }
};

// Fetch all persons for dropdown
export const fetchPersons = async () => {
  try {
    const response = await axios.get(`${APIBASEURL}/persons`, getAxiosConfig());
    return Array.isArray(response.data.data)
      ? response.data.data
      : response.data.data || [];
  } catch (error) {
    console.error("[ERROR] Failed to fetch persons:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data?.message || error.message;
  }
};

// Create a new form role approver
export const createFormRoleApprover = async (formRoleApproverData) => {
  try {
    const user = getUserData();

    if (!user.personId) {
      throw new Error("User ID not found in localStorage");
    }

    const requestData = {
      formRoleId: Number(formRoleApproverData.FormRoleID),
      userId: Number(formRoleApproverData.UserID),
      activeYN: formRoleApproverData.ActiveYN === true ,
      createdById: Number(user.personId)
    };

    console.log("[DEBUG] Creating form role approver with payload:", requestData);

    const response = await axios.post(
      `${APIBASEURL}/formRoleApproval`,
      requestData,
      getAxiosConfig()
    );

    console.log("[DEBUG] Create form role approver response:", response.data);

    // Update cached totalRecords
    const cachedTotalRecords =
      Number(localStorage.getItem("formRoleApproverTotalRecords")) || 0;
    localStorage.setItem("formRoleApproverTotalRecords", cachedTotalRecords + 1);

    return {
      formRoleApproverId: response.data.formRoleApproverId,
      message: response.data.message,
    };
  } catch (error) {
    console.error("[ERROR] Failed to create form role approver:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data?.message || error.message;
  }
};

// Update an existing form role approver
export const updateFormRoleApprover = async (id, formRoleApproverData) => {
  try {
    const user = getUserData();

    if (!user.personId) {
      throw new Error("User ID not found in localStorage");
    }

    const requestData = {
      formRoleApproverId: Number(id),
      formRoleId: Number(formRoleApproverData.FormRoleID),
      userId: Number(formRoleApproverData.UserID),
      activeYN: formRoleApproverData.ActiveYN === true ,
      createdById: Number(user.personId),
    };

    if (formRoleApproverData.RowVersionColumn) {
      requestData.RowVersionColumn = formRoleApproverData.RowVersionColumn;
    }

    console.log("[DEBUG] Updating form role approver with payload:", requestData);

    const response = await axios.put(
      `${APIBASEURL}/formRoleApprover/${id}`,
      requestData,
      getAxiosConfig()
    );

    console.log("[DEBUG] Update form role approver response:", response.data);

    return {
      formRoleApproverId: id,
      message: response.data.message,
    };
  } catch (error) {
    console.error("[ERROR] Failed to update form role approver:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data?.message || error.message;
  }
};

// Delete a form role approver
export const deleteFormRoleApprover = async (id) => {
  try {
    const user = getUserData();

    if (!user.personId) {
      throw new Error("User ID not found in localStorage");
    }

    const requestData = {
      createdById: Number(user.personId),
    };

    console.log("[DEBUG] Deleting form role approver with ID:", id, "payload:", requestData);

    const response = await axios.delete(`${APIBASEURL}/formRoleApprover/${id}`, {
      ...getAxiosConfig(),
      data: requestData,
    });

    console.log("[DEBUG] Delete form role approver response:", response.data);

    // Update cached totalRecords
    const cachedTotalRecords =
      Number(localStorage.getItem("formRoleApproverTotalRecords")) || 0;
    if (cachedTotalRecords > 0) {
      localStorage.setItem(
        "formRoleApproverTotalRecords",
        cachedTotalRecords - 1
      );
    }

    return {
      formRoleApproverId: id,
      message: response.data.message,
    };
  } catch (error) {
    console.error("[ERROR] Failed to delete form role approver:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data?.message || error.message;
  }
};

// Get a form role approver by ID
export const getFormRoleApproverById = async (id) => {
  try {
    const response = await axios.get(
      `${APIBASEURL}/formRoleApprover/${id}`,
      getAxiosConfig()
    );

    console.log("[DEBUG] Get form role approver response:", response.data);

    const data =
      Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data || response.data;

    return data;
  } catch (error) {
    console.error("[ERROR] Failed to get form role approver:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error.response?.data?.message || error.message;
  }
};