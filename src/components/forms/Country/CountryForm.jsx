import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";
import { saveCountry, getCountryById } from "./countryStorage";

const CountryForm = ({ countryId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    countryName: "",
  });

  const [errors, setErrors] = useState({
    countryName: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (countryId) {
      const country = getCountryById(countryId);
      if (country) {
        setFormData(country);
      }
    }
  }, [countryId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Country Name validation
    if (!formData.countryName.trim()) {
      newErrors.countryName = "Country name is required";
      isValid = false;
    } else if (!/^[A-Za-z\s-]{2,}$/.test(formData.countryName)) {
      newErrors.countryName =
        "Country name must be at least 2 characters (letters only)";
      isValid = false;
    } else if (formData.countryName.length > 100) {
      newErrors.countryName = "Country name cannot exceed 100 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) {
      return;
    }

    saveCountry(formData);
    onSave();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <FormPage
      title={countryId ? "Edit Country" : "Add Country"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormInput
        label="Country Name"
        name="countryName"
        value={formData.countryName}
        onChange={handleChange}
        error={isSubmitted && errors.countryName}
        helperText={isSubmitted && errors.countryName}
      />
    </FormPage>
  );
};

export default CountryForm;
