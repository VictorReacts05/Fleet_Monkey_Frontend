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

const AddressForm = ({
  addressId = null,
  initialData = null,
  onSave,
  onClose,
}) => {
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

  // Fetch dropdown data on mount
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        setDropdownLoading(true);

        // Fetch all dropdown data concurrently
        const [typesData, citiesData, countriesData] = await Promise.all([
          fetchAddressTypes(),
          fetchCities(),
          fetchCountries(),
        ]);

        console.log("Raw address types data:", typesData);
        console.log("Raw cities data:", citiesData);
        console.log("Raw countries data:", countriesData);

        // Map address types → { value, label }
        const mappedTypes = Array.isArray(typesData)
          ? typesData
              .map((item, index) => {
                const value =
                  item.AddressTypeID != null
                    ? item.AddressTypeID.toString()
                    : "";
                const label = item.AddressType || "";
                console.log(`Mapping address type [${index}]:`, {
                  value,
                  label,
                  item,
                });
                return { value, label };
              })
              .filter((item) => {
                const isValid = item.value && item.label;
                if (!isValid)
                  console.warn(`Invalid address type filtered out:`, item);
                return isValid;
              })
          : [];
        console.log("Mapped address types:", mappedTypes);

        // Map cities → { value, label }
        const mappedCities = Array.isArray(citiesData)
          ? citiesData
              .map((item, index) => {
                const value = item.CityID != null ? item.CityID.toString() : "";
                const label = item.CityName || "";
                console.log(`Mapping city [${index}]:`, { value, label, item });
                return { value, label };
              })
              .filter((item) => {
                const isValid = item.value && item.label;
                if (!isValid) console.warn(`Invalid city filtered out:`, item);
                return isValid;
              })
          : [];
        console.log("Mapped cities:", mappedCities);

        // Map countries → { value, label }
        const mappedCountries = Array.isArray(countriesData)
          ? countriesData
              .map((item, index) => {
                const value =
                  item.CountryOfOriginID != null
                    ? item.CountryOfOriginID.toString()
                    : "";
                const label = item.CountryOfOrigin || "";
                console.log(`Mapping country [${index}]:`, {
                  value,
                  label,
                  item,
                });
                return { value, label };
              })
              .filter((item) => {
                const isValid = item.value && item.label;
                if (!isValid)
                  console.warn(`Invalid country filtered out:`, item);
                return isValid;
              })
          : [];
        console.log("Mapped countries:", mappedCountries);

        setAddressTypes(mappedTypes);
        setCities(mappedCities);
        setCountries(mappedCountries);

        // Debug notifications
        if (!mappedTypes.length) {
          toast.warn(
            "No valid address types loaded. Check API response for http://localhost:7000/api/address-types"
          );
        }
        if (!mappedCities.length) {
          toast.warn(
            "No valid cities loaded. Check API response for http://localhost:7000/api/city"
          );
        }
        if (!mappedCountries.length) {
          toast.warn(
            "No valid countries loaded. Check API response for http://localhost:7000/api/country-of-origin"
          );
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast.error(`Failed to load dropdown data: ${error.message || error}`);
      } finally {
        setDropdownLoading(false);
      }
    };

    loadDropdowns();
  }, []);

  // Populate formData if editing and initialData is provided
  useEffect(() => {
    if (addressId && initialData) {
      console.log("Populating form with initialData:", initialData);
      setFormData({
        addressName: initialData.AddressName || "",
        addressTypeId:
          initialData.AddressTypeID != null
            ? initialData.AddressTypeID.toString()
            : "",
        addressLine1: initialData.AddressLine1 || "",
        addressLine2: initialData.AddressLine2 || "",
        cityId: initialData.City != null ? initialData.City.toString() : "",
        countryId:
          initialData.Country != null ? initialData.Country.toString() : "",
      });
    }
  }, [addressId, initialData]);

  // Fetch address data if editing but no initialData
  useEffect(() => {
    if (addressId && !initialData) {
      const fetchOne = async () => {
        try {
          setLoading(true);
          const data = await getAddressById(addressId);
          console.log("Fetched address data for edit:", data);
          setFormData({
            addressName: data.AddressName || "",
            addressTypeId:
              data.AddressTypeID != null ? data.AddressTypeID.toString() : "",
            addressLine1: data.AddressLine1 || "",
            addressLine2: data.AddressLine2 || "",
            cityId: data.City != null ? data.City.toString() : "",
            countryId: data.Country != null ? data.Country.toString() : "",
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
        if (value.length < 2)
          return "Address name must be at least 2 characters";
        if (!/^[a-zA-Z0-9\s-]+$/.test(value))
          return "Address name can only contain letters, numbers, spaces, and hyphens";
        return "";
      case "addressTypeId":
        if (!value) return "Address type is required";
        return "";
      case "addressLine1":
        if (!value.trim()) return "Address line 1 is required";
        if (value.length < 5)
          return "Address line 1 must be at least 5 characters";
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
      addressTypeId: getValidationError(
        "addressTypeId",
        formData.addressTypeId
      ),
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
    console.log(`Field changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (isSubmitted) {
      setErrors((prev) => ({
        ...prev,
        [name]: getValidationError(name, value),
      }));
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    setIsSubmitted(true);
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

      if (onSave) onSave(response.data || response);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving address:", error);
      const message = error.message || error;
      toast.error(
        `Failed to ${addressId ? "update" : "create"} address: ${message}`
      );
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

  // Log final dropdown options before rendering
  console.log("Rendering FormSelect with addressTypes:", addressTypes);
  console.log("Rendering FormSelect with cities:", cities);
  console.log("Rendering FormSelect with countries:", countries);

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
  