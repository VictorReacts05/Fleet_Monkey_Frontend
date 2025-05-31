import axios from 'axios';

const API_URL = '/api/po';

export const fetchPurchaseOrders = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(API_URL, {
      params: { page, limit },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    throw error;
  }
};

export const deletePurchaseOrder = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    throw error;
  }
};