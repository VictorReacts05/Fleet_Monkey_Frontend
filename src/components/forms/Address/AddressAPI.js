import axios from 'axios';
import APIBASEURL from '../../../utils/apiBaseUrl';

// Helper function to get user data safely
const getUserData = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.warn('No user data in localStorage, using default personId: 1');
      return { personId: 1, token: null };
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return { personId: 1, token: null };
  }
};

// Fetch all address types
export const fetchAddressTypes = async () => {
  try {
    const user = getUserData();
    const headers = {
      'Content-Type': 'application/json',
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };
    const response = await axios.get(`${APIBASEURL}/address-types`, { headers });
    console.log('Fetch address types response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching address types:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Failed to fetch address types',
      success: false,
      status: error.response?.status,
    };
  }
};

// Fetch all cities
export const fetchCities = async () => {
  try {
    const user = getUserData();
    const headers = {
      'Content-Type': 'application/json',
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };
    const response = await axios.get(`${APIBASEURL}/cities`, { headers });
    console.log('Fetch cities response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Failed to fetch cities',
      success: false,
      status: error.response?.status,
    };
  }
};

// Fetch all countries
export const fetchCountries = async () => {
  try {
    const user = getUserData();
    const headers = {
      'Content-Type': 'application/json',
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };
    const response = await axios.get(`${APIBASEURL}/countries`, { headers });
    console.log('Fetch countries response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Failed to fetch countries',
      success: false,
      status: error.response?.status,
    };
  }
};

// Fetch all addresses with pagination, date range, and search
export const fetchAddresses = async (page = 1, limit = 10, fromDate = null, toDate = null, searchTerm = '') => {
  try {
    const user = getUserData();
    const headers = {
      'Content-Type': 'application/json',
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };
    let url = `${APIBASEURL}/addresses?pageNumber=${page}&pageSize=${limit}`;
    if (fromDate) url += `&fromDate=${encodeURIComponent(fromDate)}`;
    if (toDate) url += `&toDate=${encodeURIComponent(toDate)}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    console.log('Fetching addresses with URL:', url);
    const response = await axios.get(url, { headers });
    console.log('Fetch addresses response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Failed to fetch addresses',
      success: false,
      status: error.response?.status,
    };
  }
};

// Create address
export const createAddress = async (addressData) => {
  try {
    console.log('Creating address with data:', addressData);
    const user = getUserData();
    if (!user.personId) {
      throw new Error('User ID not found. Please log in again.');
    }

    const payload = {
      AddressName: addressData.addressName?.trim() || '',
      AddressTypeID: Number(addressData.addressTypeId) || null,
      AddressLine1: addressData.addressLine1?.trim() || '',
      AddressLine2: addressData.addressLine2?.trim() || '',
      CityID: Number(addressData.cityId) || null,
      CountryID: Number(addressData.countryId) || null,
      CreatedByID: Number(user.personId),
      addressName: addressData.addressName?.trim() || '',
      addressTypeId: Number(addressData.addressTypeId) || null,
      addressLine1: addressData.addressLine1?.trim() || '',
      addressLine2: addressData.addressLine2?.trim() || '',
      cityId: Number(addressData.cityId) || null,
      countryId: Number(addressData.countryId) || null,
      createdById: Number(user.personId),
    };

    console.log('Formatted request data:', payload);

    const headers = {
      'Content-Type': 'application/json',
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };

    const response = await axios.post(`${APIBASEURL}/addresses`, payload, { headers });
    console.log('Create address response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createAddress:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Failed to create address',
      success: false,
      status: error.response?.status,
    };
  }
};

// Update address
export const updateAddress = async (id, addressData) => {
  try {
    console.log('Updating address with ID:', id, 'Data:', addressData);
    const user = getUserData();
    if (!user.personId) {
      throw new Error('User ID not found. Please log in again.');
    }

    const payload = {
      AddressID: Number(id),
      AddressName: addressData.addressName?.trim() || '',
      AddressTypeID: Number(addressData.addressTypeId) || null,
      AddressLine1: addressData.addressLine1?.trim() || '',
      AddressLine2: addressData.addressLine2?.trim() || '',
      CityID: Number(addressData.cityId) || null,
      CountryID: Number(addressData.countryId) || null,
      UpdatedByID: Number(user.personId),
      addressId: Number(id),
      addressName: addressData.addressName?.trim() || '',
      addressTypeId: Number(addressData.addressTypeId) || null,
      addressLine1: addressData.addressLine1?.trim() || '',
      addressLine2: addressData.addressLine2?.trim() || '',
      cityId: Number(addressData.cityId) || null,
      countryId: Number(addressData.countryId) || null,
      updatedById: Number(user.personId),
    };

    console.log('Formatted update request data:', payload);

    const headers = {
      'Content-Type': 'application/json',
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };

    const response = await axios.put(`${APIBASEURL}/addresses/${id}`, payload, { headers });
    console.log('Update address response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateAddress:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Failed to update address',
      success: false,
      status: error.response?.status,
    };
  }
};

// Delete address
export const deleteAddress = async (id) => {
  try {
    console.log(`Deleting address with ID: ${id}`);
    const user = getUserData();
    if (!user.personId) {
      throw new Error('User ID not found. Please log in again.');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };

    const response = await axios.delete(`${APIBASEURL}/addresses/${id}`, {
      headers,
      data: {
        DeletedByID: Number(user.personId),
        deletedById: Number(user.personId),
      },
    });

    console.log('Delete address response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in deleteAddress:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Failed to delete address',
      success: false,
      status: error.response?.status,
    };
  }
};

// Get address by ID
export const getAddressById = async (id) => {
  try {
    if (!id || isNaN(Number(id))) {
      throw new Error('Invalid address ID');
    }
    console.log(`Fetching address with ID: ${id}`);
    console.log(`Request URL: ${APIBASEURL}/addresses/${id}`);
    const user = getUserData();
    const headers = {
      'Content-Type': 'application/json',
      ...(user.token && { Authorization: `Bearer ${user.token}` }),
    };
    const response = await axios.get(`${APIBASEURL}/addresses/${id}`, { headers });
    console.log('Address data response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching address:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      responseData: error.response?.data,
      requestUrl: `${APIBASEURL}/addresses/${id}`,
    });
    throw {
      message: error.response?.data?.message || error.message || 'Failed to fetch address',
      success: false,
      status: error.response?.status,
    };
  }
};