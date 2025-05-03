import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import { createCity, updateCity, getCityById, fetchCountries } from "./CityAPI";
import { toast } from "react-toastify";

const CityForm = ({ cityId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    cityName: "",
    countryId: "",
  });

  const [errors, setErrors] = useState({
    cityName: "",
    countryId: "",
  });

  const [countries, setCountries] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load countries for dropdown
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        const response = await fetchCountries();
        const countryOptions = (response.data || []).map((country) => ({
          value: country.CountryOfOriginID,
          label: country.CountryOfOrigin,
        }));
        setCountries(countryOptions);
      } catch (error) {
        console.error("Error loading countries:", error);
        toast.error("Failed to load countries");
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  // Load city data if editing
  useEffect(() => {
    if (cityId) {
      loadCity();
    }
  }, [cityId]);

  const loadCity = async () => {
    try {
      setLoading(true);
      const response = await getCityById(cityId);
      setFormData({
        cityName: response.CityName || "",
        countryId: response.CountryID || "",
      });
    } catch (error) {
      console.error("Error loading city:", error);
      toast.error("Failed to load city details");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // City Name validation
    if (!formData.cityName.trim()) {
      newErrors.cityName = "City name is required";
      isValid = false;
    } else if (!/^[A-Za-z\s-]{2,}$/.test(formData.cityName)) {
      newErrors.cityName =
        "City name must be at least 2 characters and contain only letters, spaces, and hyphens";
      isValid = false;
    }

    // Country validation
    if (!formData.countryId) {
      newErrors.countryId = "Country is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (validateForm()) {
      try {
        setLoading(true);

        const cityData = {
          CityName: formData.cityName,
          CountryID: formData.countryId,
        };

        if (cityId) {
          // Update existing city
          await updateCity(cityId, cityData);
          toast.success("City updated successfully");
        } else {
          // Create new city
          await createCity(cityData);
          toast.success("City created successfully");
        }

        if (onSave) onSave();
        if (onClose) onClose();
      } catch (error) {
        console.error("Error saving city:", error);
        toast.error(`Failed to save city: ${error.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (isSubmitted) {
      validateForm();
    }
  };

  return (
    <FormPage
      title={cityId ? "Edit City" : "Add City"}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <FormSelect
        label="Country"
        name="countryId"
        value={formData.countryId}
        onChange={handleChange}
        options={countries}
        error={errors.countryId}
        required
      />
      <FormInput
        label="City Name"
        name="cityName"
        value={formData.cityName}
        onChange={handleChange}
        error={errors.cityName}
        required
      />
    </FormPage>
  );
};

export default CityForm;
