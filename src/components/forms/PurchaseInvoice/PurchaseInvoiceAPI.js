import axios from 'axios';
import APIBASEURL from './../../../utils/apiBaseUrl';

export const fetchPurchaseInvoices = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${APIBASEURL}/pInvoice`, {
      params: { page, limit },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase invoices:', error);
    throw error;
  }
};

export const getPurchaseInvoiceById = async (id) => {
  try {
    const response = await axios.get(`${APIBASEURL}/pInvoice/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase invoice with ID ${id}:`, error);
    throw error;
  }
};

export const deletePurchaseInvoice = async (id) => {
  try {
    const response = await axios.delete(`${APIBASEURL}/pInvoice/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting purchase invoice:', error);
    throw error;
  }
};