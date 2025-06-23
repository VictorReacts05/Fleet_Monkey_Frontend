import React, { useState, useEffect } from "react";
import { Grid, CircularProgress, Box } from "@mui/material";
import { toast } from "react-toastify";
import FormPage from "../../common/FormPage";
import FormInput from "../../common/FormInput";
import FormSelect from "../../common/FormSelect";
import FormTextArea from "../../common/FormTextArea";
import {
  fetchAddressTypes,
  fetchCities,
  fetchCountries,
  createAddress,
  updateAddress,
  getAddressById,
} from "./AddressAPI";
import {Typography} from "@mui/material";

const AddressForm = ({ addressId = null, onSave, onClose }) => {
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dropdown options
  const [addressTypes, setAddressTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);

  // Fetch dropdown data and address data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching data for addressId: ${addressId || "none"}`);

        // Fetch dropdown data concurrently
        const [typesData, citiesData, countriesData] = await Promise.all([
          fetchAddressTypes(),
          fetchCities(),
          fetchCountries(),
        ]);

        // Map address types
        const mappedTypes = Array.isArray(typesData)
          ? typesData
              .map((item) => ({
                value:
                  item.AddressTypeID != null
                    ? item.AddressTypeID.toString()
                    : "",
                label: item.AddressType || "",
              }))
              .filter((item) => item.value && item.label)
          : [];
        console.log("Mapped address types:", mappedTypes);

        // Map cities
        const mappedCities = Array.isArray(citiesData)
          ? citiesData
              .map((item) => ({
                value: item.CityID != null ? item.CityID.toString() : "",
                label: item.CityName || "",
              }))
              .filter((item) => item.value && item.label)
          : [];
        console.log("Mapped cities:", mappedCities);

        // Map countries
        const mappedCountries = Array.isArray(countriesData)
          ? countriesData
              .map((item) => ({
                value:
                  item.CountryOfOriginID != null
                    ? item.CountryOfOriginID.toString()
                    : "",
                label: item.CountryOfOrigin || "",
              }))
              .filter((item) => item.value && item.label)
          : [];
        console.log("Mapped countries:", mappedCountries);

        setAddressTypes(mappedTypes);
        setCities(mappedCities);
        setCountries(mappedCountries);

        // Warn if dropdowns are empty
        if (!mappedTypes.length) toast.warn("No valid address types loaded.");
        if (!mappedCities.length) toast.warn("No valid cities loaded.");
        if (!mappedCountries.length) toast.warn("No valid countries loaded.");

        // Fetch address data if editing
        if (addressId) {
          console.log(`Fetching address data for ID: ${addressId}`);
          const response = await getAddressById(addressId);
          console.log("Raw getAddressById response:", response);
          // Normalize response
          const addressData = response.data || response;
          console.log("Normalized address data:", addressData);
          const newFormData = {
            addressName: addressData.AddressName || "",
            addressTypeId:
              addressData.AddressTypeID != null
                ? addressData.AddressTypeID.toString()
                : "",
            addressLine1: addressData.AddressLine1 || "",
            addressLine2: addressData.AddressLine2 || "",
            cityId: addressData.City != null ? addressData.City.toString() : "",
            countryId:
              addressData.Country != null ? addressData.Country.toString() : "",
          };
          console.log("Setting formData to:", newFormData);
          setFormData(newFormData);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        console.log(
          `Failed to load form data: ${error.message || "Unknown error"}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addressId]);

  // Validation logic
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "addressName":
        if (!value.trim()) error = "Address name is required";
        else if (value.length < 2)
          error = "Address name must be at least 2 characters";
        else if (!/^[a-zA-Z0-9\s-]+$/.test(value))
          error =
            "Address name can only contain letters, numbers, spaces, and hyphens";
        break;
      case "addressTypeId":
        if (!value) error = "Address type is required";
        else if (!addressTypes.some((type) => type.value === value))
          error = "Invalid address type selected";
        break;
      case "addressLine1":
        if (!value.trim()) error = "Address line 1 is required";
        else if (value.length < 5)
          error = "Address line 1 must be at least 5 characters";
        break;
      case "addressLine2":
        break; // Optional
      case "cityId":
        if (!value) error = "City is required";
        else if (!cities.some((city) => city.value === value))
          error = "Invalid city selected";
        break;
      case "countryId":
        if (!value) error = "Country is required";
        else if (!countries.some((country) => country.value === value))
          error = "Invalid country selected";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (isSubmitted) validateField(name, value);
  };

  // Handle blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSubmitted(true);

    const validationErrors = {
      addressName: validateField("addressName", formData.addressName)
        ? ""
        : errors.addressName || "Address name is required",
      addressTypeId: validateField("addressTypeId", formData.addressTypeId)
        ? ""
        : errors.addressTypeId || "Address type is required",
      addressLine1: validateField("addressLine1", formData.addressLine1)
        ? ""
        : errors.addressLine1 || "Address line 1 is required",
      addressLine2: validateField("addressLine2", formData.addressLine2)
        ? ""
        : errors.addressLine2 || "",
      cityId: validateField("cityId", formData.cityId)
        ? ""
        : errors.cityId || "City is required",
      countryId: validateField("countryId", formData.countryId)
        ? ""
        : errors.countryId || "Country is required",
    };

    if (Object.values(validationErrors).some((error) => error !== "")) {
      setErrors(validationErrors);
      console.log("Please fix the validation errors");
      return;
    }

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
      console.log(
        `Failed to ${addressId ? "update" : "create"} address: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Show spinner during loading
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Debug UI
  console.log("Rendering with formData:", formData);
  return (
    <FormPage
      title=""
      loading={loading}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <Grid
        container
        spacing={2}
        sx={{
          maxHeight: "calc(100vh - 200px)",
          width: "100%",
          margin: 0,
          overflow: "hidden",
        }}
      >
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            required
            label="Address Name"
            name="addressName"
            value={formData.addressName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.addressName}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormSelect
            required
            label="Address Type"
            name="addressTypeId"
            value={formData.addressTypeId}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.addressTypeId}
            helperText={errors.addressTypeId}
            options={addressTypes}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormTextArea
            required
            label="Address Line 1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.addressLine1}
            rows={3}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormTextArea
            label="Address Line 2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.addressLine2}
            rows={2}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormSelect
            required
            label="City"
            name="cityId"
            value={formData.cityId}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.cityId}
            helperText={errors.cityId}
            options={cities}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormSelect
            required
            label="Country"
            name="countryId"
            value={formData.countryId}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.countryId}
            helperText={errors.countryId}
            options={countries}
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default AddressForm;
