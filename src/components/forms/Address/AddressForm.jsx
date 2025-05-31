import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Select, InputLabel, FormControl, Box, CircularProgress } from '@mui/material';
import FormPage from '../../Common/FormPage';
import FormInput from '../../Common/FormInput';
import { toast } from 'react-toastify';
import { fetchAddressTypes, fetchCities, fetchCountries, createAddress, updateAddress, getAddressById } from './AddressAPI';

const AddressForm = ({ addressId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    addressName: '',
    addressTypeId: '',
    addressLine1: '',
    addressLine2: '',
    cityId: '',
    countryId: '',
  });

  const [errors, setErrors] = useState({
    addressName: '',
    addressTypeId: '',
    addressLine1: '',
    addressLine2: '',
    cityId: '',
    countryId: '',
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [addressTypes, setAddressTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchDropdownData();
    if (addressId) {
      loadAddress();
    }
  }, [addressId]);

  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      const [addressTypesData, citiesData, countriesData] = await Promise.all([
        fetchAddressTypes(),
        fetchCities(),
        fetchCountries(),
      ]);
      setAddressTypes(addressTypesData);
      setCities(citiesData);
      setCountries(countriesData);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error(`Failed to load dropdown data: ${error.message}${error.status ? ` (Status: ${error.status})` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAddress = async () => {
    try {
      setLoading(true);
      const response = await getAddressById(addressId);
      console.log('Loaded address response:', response);

      const addressData = response.AddressID ? response : response.data || response;

      setFormData({
        addressName: addressData.AddressName || addressData.addressName || '',
        addressTypeId: addressData.AddressTypeID || addressData.addressTypeId || '',
        addressLine1: addressData.AddressLine1 || addressData.addressLine1 || '',
        addressLine2: addressData.AddressLine2 || addressData.addressLine2 || '',
        cityId: addressData.CityID || addressData.cityId || '',
        countryId: addressData.CountryID || addressData.countryId || '',
      });
    } catch (error) {
      console.error('Error loading address:', error);
      toast.error(`Failed to load address: ${error.message}${error.status ? ` (Status: ${error.status})` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const getValidationError = (field, value) => {
    switch (field) {
      case 'addressName':
        if (!value.trim()) {
          return 'Address name is required';
        } else if (value.length < 2) {
          return 'Address name must be at least 2 characters';
        } else if (!/^[a-zA-Z0-9\s-]+$/.test(value)) {
          return 'Address name can only contain letters, numbers, spaces, and hyphens';
        }
        return '';
      case 'addressTypeId':
        if (!value) {
          return 'Address type is required';
        }
        return '';
      case 'addressLine1':
        if (!value.trim()) {
          return 'Address line 1 is required';
        } else if (value.length < 5) {
          return 'Address line 1 must be at least 5 characters';
        }
        return '';
      case 'addressLine2':
        return ''; // Optional field
      case 'cityId':
        if (!value) {
          return 'City is required';
        }
        return '';
      case 'countryId':
        if (!value) {
          return 'Country is required';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {
      addressName: getValidationError('addressName', formData.addressName),
      addressTypeId: getValidationError('addressTypeId', formData.addressTypeId),
      addressLine1: getValidationError('addressLine1', formData.addressLine1),
      addressLine2: getValidationError('addressLine2', formData.addressLine2),
      cityId: getValidationError('cityId', formData.cityId),
      countryId: getValidationError('countryId', formData.countryId),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (isSubmitted) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: getValidationError(name, value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setIsSubmitted(true);

    if (validateForm()) {
      try {
        setLoading(true);

        const user = JSON.parse(localStorage.getItem('user')) || {};
        const personId = user?.personId || user?.id || user?.userId;
        const token = user?.token || localStorage.getItem('token');

        if (!personId) {
          throw new Error('User ID not found. Please log in again.');
        }

        const payload = {
          addressName: formData.addressName.trim(),
          addressTypeId: Number(formData.addressTypeId),
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim(),
          cityId: Number(formData.cityId),
          countryId: Number(formData.countryId),
          // Include uppercase variants for backend compatibility
          AddressName: formData.addressName.trim(),
          AddressTypeID: Number(formData.addressTypeId),
          AddressLine1: formData.addressLine1.trim(),
          AddressLine2: formData.addressLine2.trim(),
          CityID: Number(formData.cityId),
          CountryID: Number(formData.countryId),
        };

        console.log('Submitting payload:', payload);
        console.log('Token exists:', !!token);

        let response;
        if (addressId) {
          response = await updateAddress(addressId, payload);
          toast.success('Address updated successfully');
        } else {
          response = await createAddress(payload);
          toast.success('Address created successfully');
        }

        console.log('Address response:', response);
        if (onSave) onSave(response.data || response);
        if (onClose) onClose();
      } catch (error) {
        console.error('Error saving address:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
        });
        toast.error(`Failed to ${addressId ? 'update' : 'create'} address: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <FormPage onSubmit={handleSubmit} onCancel={onClose} loading={loading}>
      <FormInput
        label="Address Name"
        name="addressName"
        value={formData.addressName}
        onChange={handleChange}
        error={errors.addressName}
        required
      />

      <FormControl fullWidth margin="normal" error={!!errors.addressTypeId}>
        <InputLabel>Address Type</InputLabel>
        <Select
          name="addressTypeId"
          value={formData.addressTypeId}
          onChange={handleChange}
          label="Address Type"
          required
        >
          <MenuItem value="">Select Address Type</MenuItem>
          {addressTypes.map((type) => (
            <MenuItem key={type.AddressTypeID || type.id} value={type.AddressTypeID || type.id}>
              {type.AddressType || type.addressType}
            </MenuItem>
          ))}
        </Select>
        {errors.addressTypeId && (
          <Typography color="error" variant="caption">
            {errors.addressTypeId}
          </Typography>
        )}
      </FormControl>

      <FormInput
        label="Address Line 1"
        name="addressLine1"
        value={formData.addressLine1}
        onChange={handleChange}
        error={errors.addressLine1}
        required
        multiline
        rows={4}
      />

      <FormInput
        label="Address Line 2"
        name="addressLine2"
        value={formData.addressLine2}
        onChange={handleChange}
        error={errors.addressLine2}
        multiline
        rows={4}
      />

      <FormControl fullWidth margin="normal" error={!!errors.cityId}>
        <InputLabel>City</InputLabel>
        <Select
          name="cityId"
          value={formData.cityId}
          onChange={handleChange}
          label="City"
          required
        >
          <MenuItem value="">Select City</MenuItem>
          {cities.map((city) => (
            <MenuItem key={city.CityID || city.id} value={city.CityID || city.id}>
              {city.CityName || city.name}
            </MenuItem>
          ))}
        </Select>
        {errors.cityId && (
          <Typography color="error" variant="caption">
            {errors.cityId}
          </Typography>
        )}
      </FormControl>

      <FormControl fullWidth margin="normal" error={!!errors.countryId}>
        <InputLabel>Country</InputLabel>
        <Select
          name="countryId"
          value={formData.countryId}
          onChange={handleChange}
          label="Country"
          required
        >
          <MenuItem value="">Select Country</MenuItem>
          {countries.map((country) => (
            <MenuItem key={country.CountryID || country.id} value={country.CountryID || country.id}>
              {country.CountryName || country.name}
            </MenuItem>
          ))}
        </Select>
        {errors.countryId && (
          <Typography color="error" variant="caption">
            {errors.countryId}
          </Typography>
        )}
      </FormControl>
    </FormPage>
  );
};

export default AddressForm;