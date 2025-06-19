import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Helper function to get auth token and personId from localStorage
export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  let personId = null;
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      personId = user.personId || user.id || user.userId || null;
    }
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
  }

  if (!token || !personId) {
    console.warn(
      "User authentication data not found, proceeding without auth token or personId"
    );
    return { headers: {}, personId: null };
  }

  return {
    headers: { Authorization: `Bearer ${token}` },
    personId,
  };
};

// Fetch all subscription plans
export const fetchSubscriptionPlans = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    console.log("token:", localStorage.getItem("token"));
    console.log("user data:", localStorage.getItem("user"));

    let url = `${APIBASEURL}/subscriptionPlan?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const { headers } = getAuthHeader();
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a new subscription plan
export const createSubscriptionPlan = async (subscriptionData) => {
  try {
    const { headers, personId } = getAuthHeader();

    // Use CreatedByID from subscriptionData if provided, otherwise fall back to personId
    const createdById = subscriptionData.CreatedByID
      ? Number(subscriptionData.CreatedByID)
      : Number(personId);

    if (!createdById) {
      throw new Error("personId is required for createdById");
    }

    const apiData = {
      subscriptionPlanName: subscriptionData.SubscriptionPlanName,
      description: subscriptionData.Description,
      fees: Number(subscriptionData.Fees) || 0,
      billingFrequencyId: Number(subscriptionData.BillingFrequencyID) || 1,
      createdById: createdById,
    };

    // Validate required fields
    const errors = [];
    if (
      !apiData.subscriptionPlanName ||
      typeof apiData.subscriptionPlanName !== "string" ||
      apiData.subscriptionPlanName.trim() === ""
    ) {
      errors.push(
        "subscriptionPlanName is required and must be a non-empty string"
      );
    }
    if (isNaN(apiData.fees) || apiData.fees < 0) {
      errors.push("fees must be a positive number");
    }
    if (!apiData.billingFrequencyId || isNaN(apiData.billingFrequencyId)) {
      errors.push("billingFrequencyId is required and must be a valid number");
    }
    if (!apiData.createdById || isNaN(apiData.createdById)) {
      errors.push("createdById is required and must be a valid number");
    }
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    console.log("Sending payload to API:", apiData);

    const response = await axios.post(
      `${APIBASEURL}/subscriptionPlan`,
      apiData,
      { headers }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error.response?.data || error.message;
  }
};

// Update an existing subscription plan
export const updateSubscriptionPlan = async (id, subscriptionData) => {
  try {
    const { headers, personId } = getAuthHeader();

    // Use CreatedByID from subscriptionData if provided, otherwise fall back to personId
    const createdById = subscriptionData.CreatedByID
      ? Number(subscriptionData.CreatedByID)
      : Number(personId);

    if (!createdById) {
      throw new Error("personId is required for createdById");
    }

    const apiData = {
      subscriptionPlanId: Number(id),
      subscriptionPlanName: subscriptionData.SubscriptionPlanName,
      description: subscriptionData.Description,
      fees: Number(subscriptionData.Fees) || 0,
      billingFrequencyId: Number(subscriptionData.BillingFrequencyID) || 1,
      createdById: createdById,
    };

    // Validate required fields
    const errors = [];
    if (
      !apiData.subscriptionPlanName ||
      typeof apiData.subscriptionPlanName !== "string" ||
      apiData.subscriptionPlanName.trim() === ""
    ) {
      errors.push(
        "subscriptionPlanName is required and must be a non-empty string"
      );
    }
    if (isNaN(apiData.fees) || apiData.fees < 0) {
      errors.push("fees must be a positive number");
    }
    if (!apiData.billingFrequencyId || isNaN(apiData.billingFrequencyId)) {
      errors.push("billingFrequencyId is required and must be a valid number");
    }
    if (!apiData.createdById || isNaN(apiData.createdById)) {
      errors.push("createdById is required and must be a valid number");
    }
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    if (subscriptionData.RowVersionColumn) {
      apiData.rowVersionColumn = subscriptionData.RowVersionColumn;
    }

    console.log("Sending payload to API:", apiData);

    const response = await axios.put(
      `${APIBASEURL}/subscriptionplans/${id}`,
      apiData,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error.response?.data || error.message;
  }
};

// Delete a subscription plan
export const deleteSubscriptionPlan = async (id) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      throw new Error(
        "personId is required for deletedById. Check localStorage or pass personId explicitly."
      );
    }

    const requestBody = {
      deletedById: Number(personId),
    };

    console.log(
      "Sending DELETE request to:",
      `${APIBASEURL}/subscriptionplans/${id}`
    );
    console.log("Request body:", requestBody);

    const response = await axios.delete(
      `${APIBASEURL}/subscriptionplans/${id}`,
      {
        headers,
        data: requestBody,
      }
    );

    console.log("Delete response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Request URL:", error.config.url);
      console.error("Request body sent:", error.config.data);
    } else if (error.request) {
      console.error("No response received, request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error.response?.data || error.message;
  }
};

// Get a subscription plan by ID
export const getSubscriptionPlanById = async (id) => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/subscriptionPlan/${id}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch billing frequencies for dropdown
export const fetchBillingFrequencies = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(`${APIBASEURL}/billingFrequency`, {
      headers,
    });
    console.log("Billing frequencies response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching billing frequencies:", error);
    // Return mock data for testing if API fails
    return {
      data: [
        { BillingFrequencyID: 1, BillingFrequencyName: "Weekly" },
        { BillingFrequencyID: 2, BillingFrequencyName: "Biweekly" },
        { BillingFrequencyID: 3, BillingFrequencyName: "Monthly" },
        { BillingFrequencyID: 4, BillingFrequencyName: "Quarterly" },
        { BillingFrequencyID: 5, BillingFrequencyName: "Annually" },
      ],
    };
  }
};
