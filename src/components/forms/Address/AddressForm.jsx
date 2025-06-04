// src/features/address/AddressForm.jsx
import React, { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import FormPage from "../../Common/FormPage";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormTextArea from "../../Common/FormTextArea";
import {
  fetchAddressTypes,
  fetchCities,
  fetchCountries,
  createAddress,
  updateAddress,
  getAddressById,
} from "./AddressAPI";

const AddressForm = ({ addressId = null, initialData = null, onSave, onClose }) => {
  // Form state
  const [formData, setFormData] = useState({
    addressName: "",
    addressTypeId: "",
    addressLine1: "",
    addressLine2: "",
    cityId: "",
    countryId: "",
  });

  const [errors, setErrors] = useState({
    addressName: "",
    addressTypeId: "",
    addressLine1: "",
    addressLine2: "",
    cityId: "",
    countryId: "",
  });

  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dropdown options
  const [addressTypes, setAddressTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);

  // 1) Fetch dropdown data on mount
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        setDropdownLoading(true);

        const [typesData, citiesData, countriesDataRaw] = await Promise.all([
          fetchAddressTypes(),
          fetchCities(),
          fetchCountries(),
        ]);

        // typesData: array of { AddressTypeID, AddressType, … }
        // citiesData: array of { CityID, CityName, … }
        // countriesDataRaw: array of { CountryOfOriginID, CountryOfOrigin, … }

        // Map address types → { value, label }
        const mappedTypes = typesData.map((item) => ({
          value: item.AddressTypeID || item.addressTypeId || item.id,
          label:
            item.AddressType ||
            item.addressType ||
            item.AddressTypeName ||
            item.addressTypeName ||
            item.name ||
            "",
        }));

        // Map cities → { value, label }
        const mappedCities = citiesData.map((item) => ({
          value: item.CityID || item.cityId || item.id,
          label: item.CityName || item.cityName || item.name || "",
        }));

        // *** Here's the fix: map countriesDataRaw correctly ***
        const mappedCountries = countriesDataRaw.map((item) => ({
          // use CountryOfOriginID as value
          value: item.CountryOfOriginID,
          // use CountryOfOrigin as label
          label: item.CountryOfOrigin,
        }));

        // Debug logs (optional):
        console.log("Mapped addressTypes:", mappedTypes);
        console.log("Mapped cities:", mappedCities);
        console.log("Mapped countries:", mappedCountries);

        setAddressTypes(mappedTypes);
        setCities(mappedCities);
        setCountries(mappedCountries);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast.error(`Failed to load dropdown data: ${error.message || error}`);
      } finally {
        setDropdownLoading(false);
      }
    };

    loadDropdowns();
  }, []);

  // 2) If editing (addressId) and initialData passed, populate formData
  useEffect(() => {
    if (addressId && initialData) {
      setFormData({
        addressName: initialData.AddressName || initialData.addressName || "",
        addressTypeId: initialData.AddressTypeID || initialData.addressTypeId || "",
        addressLine1: initialData.AddressLine1 || initialData.addressLine1 || "",
        addressLine2: initialData.AddressLine2 || initialData.addressLine2 || "",
        cityId: initialData.CityID || initialData.cityId || "",
        countryId: initialData.CountryID || initialData.countryId || "",
      });
    }
  }, [addressId, initialData]);

  // 3) If editing but initialData is not yet available, fetch it
  useEffect(() => {
    if (addressId && !initialData) {
      const fetchOne = async () => {
        try {
          setLoading(true);
          const data = await getAddressById(addressId);
          setFormData({
            addressName: data.AddressName || data.addressName || "",
            addressTypeId: data.AddressTypeID || data.addressTypeId || "",
            addressLine1: data.AddressLine1 || data.addressLine1 || "",
            addressLine2: data.AddressLine2 || data.addressLine2 || "",
            cityId: data.CityID || data.cityId || "",
            countryId: data.CountryID || data.countryId || "",
          });
        } catch (error) {
          console.error("Error loading address:", error);
          toast.error(`Failed to load address: ${error.message || error}`);
        } finally {
          setLoading(false);
        }
      };
      fetchOne();
    }
  }, [addressId, initialData]);

  // Validation logic
  const getValidationError = (field, value) => {
    switch (field) {
      case "addressName":
        if (!value.trim()) return "Address name is required";
        if (value.length < 2) return "Address name must be at least 2 characters";
        if (!/^[a-zA-Z0-9\s-]+$/.test(value))
          return "Address name can only contain letters, numbers, spaces, and hyphens";
        return "";
      case "addressTypeId":
        if (!value) return "Address type is required";
        return "";
      case "addressLine1":
        if (!value.trim()) return "Address line 1 is required";
        if (value.length < 5) return "Address line 1 must be at least 5 characters";
        return "";
      case "addressLine2":
        return ""; // optional
      case "cityId":
        if (!value) return "City is required";
        return "";
      case "countryId":
        if (!value) return "Country is required";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {
      addressName: getValidationError("addressName", formData.addressName),
      addressTypeId: getValidationError("addressTypeId", formData.addressTypeId),
      addressLine1: getValidationError("addressLine1", formData.addressLine1),
      addressLine2: getValidationError("addressLine2", formData.addressLine2),
      cityId: getValidationError("cityId", formData.cityId),
      countryId: getValidationError("countryId", formData.countryId),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err);
  };

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (isSubmitted) {
      setErrors((prev) => ({ ...prev, [name]: getValidationError(name, value) }));
    }
  };

  // Submit handler
   const handleSubmit = async (e) => {
    if (e?.preventDefault) {
     e.preventDefault();
    }
    if (!validateForm()) return;

    try {
      setLoading(true);

      let response;
      if (addressId) {
        response = await updateAddress(addressId, formData);
        toast.success("Address updated successfully");
      } else {
        response = await createAddress(formData);
        toast.success("Address created successfully");
      }

      // Return newly created/updated record
      if (onSave) onSave(response.data || response);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving address:", error);
      const message = error.message || error;
      toast.error(`Failed to ${addressId ? "update" : "create"} address: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // If dropdowns are still loading, show a spinner
  if (dropdownLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <FormPage onSubmit={handleSubmit} onCancel={onClose} loading={loading}>
      <FormInput
        label="Address Name"
        name="addressName"
        value={formData.addressName}
        onChange={handleChange}
        error={errors.addressName}
        required
        placeholder="Enter address name"
      />

      <FormSelect
        label="Address Type"
        name="addressTypeId"
        value={formData.addressTypeId}
        onChange={handleChange}
        error={errors.addressTypeId}
        options={addressTypes}
        required
      />

      <FormTextArea
        label="Address Line 1"
        name="addressLine1"
        value={formData.addressLine1}
        onChange={handleChange}
        error={errors.addressLine1}
        required
        rows={3}
        placeholder="Enter address line 1"
      />

      <FormTextArea
        label="Address Line 2"
        name="addressLine2"
        value={formData.addressLine2}
        onChange={handleChange}
        error={errors.addressLine2}
        rows={2}
        placeholder="(Optional) Address line 2"
      />

      <FormSelect
        label="City"
        name="cityId"
        value={formData.cityId}
        onChange={handleChange}
        error={errors.cityId}
        options={cities}
        required
      />

      <FormSelect
        label="Country"
        name="countryId"
        value={formData.countryId}
        onChange={handleChange}
        error={errors.countryId}
        options={countries}
        required
      />
    </FormPage>
  );
};

export default AddressForm;
