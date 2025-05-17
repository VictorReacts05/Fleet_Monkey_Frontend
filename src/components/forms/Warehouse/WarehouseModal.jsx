export const createWarehouse = async (warehouseData) => {
  try {
    const { headers, personId } = getAuthHeader();

    if (!personId) {
      throw new Error("User authentication required: personId is missing for createdByID");
    }

    const apiData = {
      ...warehouseData,
      createdByID: personId,
      createdById: personId,
    };

    console.log("Creating warehouse with data:", apiData);

    const response = await axios.post(API_BASE_URL, apiData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating warehouse:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      const errorMessage = error.response.data.message || error.response.data.error || 'Failed to create warehouse';
      throw new Error(errorMessage);
    }
    throw new Error(error.message || 'An unexpected error occurred');
  }
};