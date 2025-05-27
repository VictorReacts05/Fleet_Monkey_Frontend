import axios from "axios";
import APIBASEURL from "../../../utils/apiBaseUrl";

// Helper function to get auth token and personId from localStorage
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.token) {
      console.warn(
        "User authentication data not found, proceeding without auth token"
      );
      return { headers: {}, personId: null };
    }

    // Try different possible keys for personId
    const personId = user.personId || user.id || user.userId || null;

    if (!personId) {
      console.warn(
        "No personId found in user object. Available keys:",
        Object.keys(user)
      );
    }

    return {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      personId,
    };
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return { headers: {}, personId: null };
  }
};

// Fetch all subscription plans
export const fetchSubscriptionPlans = async (
  page = 1,
  limit = 10,
  fromDate = null,
  toDate = null
) => {
  try {
    let url = `${APIBASEURL}/subscriptionPlan?page=${page}&limit=${limit}`;
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

    if (!personId) {
      throw new Error("personId is required for createdByID");
    }

    const apiData = {
      SubscriptionPlanName: subscriptionData.planName,
      Description: subscriptionData.description,
      Fees: Number(subscriptionData.fees) || 0,
      BillingFrequencyID: Number(subscriptionData.billingFrequencyId) || 1,
      CreatedByID: Number(personId)
    };

    const response = await axios.post(`${APIBASEURL}/subscriptionPlan`, apiData, { headers });
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
    
    if (!personId) {
      throw new Error("personId is required for CreatedByID");
    }

    const apiData = {
      SubscriptionPlanID: Number(id),
      SubscriptionPlanName: subscriptionData.planName,
      Description: subscriptionData.description,
      Fees: Number(subscriptionData.fees) || 0,
      BillingFrequencyID: Number(subscriptionData.billingFrequencyId) || 1,
      CreatedByID: Number(personId)
    };
    
    if (subscriptionData.RowVersionColumn) {
      apiData.RowVersionColumn = subscriptionData.RowVersionColumn;
    }

    const response = await axios.put(`${APIBASEURL}/subscriptionplans/${id}`, apiData, {
      headers,
    });
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
        "personId is required for deletedByID. Check localStorage or pass personId explicitly."
      );
    }

    const requestBody = {
      deletedByID: Number(personId),
    };

    console.log("Sending DELETE request to:", `${APIBASEURL}/subscriptionplans/${id}`);
    console.log("Request body:", requestBody);

    const response = await axios.delete(`${APIBASEURL}/subscriptionplans/${id}`, {
      headers,
      data: requestBody,
    });

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
    const response = await axios.get(`${APIBASEURL}/subscriptionPlan/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch billing frequencies for dropdown
export const fetchBillingFrequencies = async () => {
  try {
    const { headers } = getAuthHeader();
    const response = await axios.get(
      `${APIBASEURL}/billingFrequency`, // Make sure this endpoint is correct
      { headers }
    );
    console.log("Billing frequencies response:", response.data); // Add logging
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
        { BillingFrequencyID: 5, BillingFrequencyName: "Annually" }
      ] 
    };
  }
};