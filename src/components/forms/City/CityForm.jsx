import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import { getCountries } from "../Country/countryStorage";

const CityForm = ({ cityId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    cityName: "",
    countryId: "",
    countryName: "", // Stores country name for display/saving
  });

  const [errors, setErrors] = useState({
    cityName: "",
    countryId: "",
  });

  const [countries, setCountries] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const countryList = getCountries();
    setCountries(
      countryList.map((country) => ({
        value: country.id,
        label: country.countryName,
      }))
    );

    if (cityId) {
      const cities = JSON.parse(localStorage.getItem("cities") || "[]");
      const city = cities.find((c) => c.id === cityId);
      if (city) {
        const selectedCountry = countryList.find(
          (c) => c.id === city.countryId
        );
        setFormData({
          ...city,
          countryName: selectedCountry ? selectedCountry.countryName : "",
        });
      }
    }
  }, [cityId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Country validation
    if (!formData.countryId) {
      newErrors.countryId = "Country is required";
      isValid = false;
    }

    // City Name validation
    if (!formData.cityName.trim()) {
      newErrors.cityName = "City name is required";
      isValid = false;
    } else if (!/^[A-Za-z\s-]{2,}$/.test(formData.cityName)) {
      newErrors.cityName =
        "City name must be at least 2 characters (letters only)";
      isValid = false;
    } else if (formData.cityName.length > 100) {
      newErrors.cityName = "City name cannot exceed 100 characters";
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

    const cities = JSON.parse(localStorage.getItem("cities") || "[]");

    // Get country name before saving
    const selectedCountry = countries.find(
      (c) => c.value === formData.countryId
    );
    const cityData = {
      ...formData,
      countryName: selectedCountry ? selectedCountry.label : "",
    };

    if (cityId) {
      const updatedCities = cities.map((city) =>
        city.id === cityId ? { ...cityData, id: cityId } : city
      );
      localStorage.setItem("cities", JSON.stringify(updatedCities));
    } else {
      const newCity = {
        ...cityData,
        id: Date.now(),
      };
      localStorage.setItem("cities", JSON.stringify([...cities, newCity]));
    }

    onSave();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <FormPage
      title={cityId ? "Edit City" : "Add City"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormSelect
        label="Country"
        name="countryId"
        value={formData.countryId}
        onChange={handleChange}
        options={countries}
        error={isSubmitted && errors.countryId}
        helperText={isSubmitted && errors.countryId}
      />
      <FormInput
        label="City Name"
        name="cityName"
        value={formData.cityName}
        onChange={handleChange}
        error={isSubmitted && errors.cityName}
        helperText={isSubmitted && errors.cityName}
      />
    </FormPage>
  );
};

export default CityForm;
