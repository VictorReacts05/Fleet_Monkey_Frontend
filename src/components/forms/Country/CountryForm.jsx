import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";
import { createCountry, updateCountry, fetchCountries } from "./CountryAPI";
import { toast } from "react-toastify";

const CountryForm = ({ countryId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    countryName: "",
  });

  const [errors, setErrors] = useState({
    countryName: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countryId) {
      loadCountry();
    }
  }, [countryId]);

  const loadCountry = async () => {
    try {
      setLoading(true);
      // Fetch all countries and find the one with matching ID
      const response = await fetchCountries(1, 100);
      const countries = response.data || [];
      const country = countries.find(c => c.CountryOfOriginID === countryId);
      
      if (country) {
        setFormData({
          countryName: country.CountryOfOrigin || '',
        });
      }
    } catch (error) {
      console.error('Error loading country:', error);
      toast.error('Failed to load country details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Country Name validation
    if (!formData.countryName.trim()) {
      newErrors.countryName = "Country name is required";
      isValid = false;
    } else if (!/^[A-Za-z\s-]{2,}$/.test(formData.countryName)) {
      newErrors.countryName = "Country name must be at least 2 characters and contain only letters, spaces, and hyphens";
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
        
        if (countryId) {
          // Update existing country
          await updateCountry(countryId, { 
            CountryOfOrigin: formData.countryName 
          });
          toast.success("Country updated successfully");
        } else {
          // Create new country
          await createCountry({ 
            CountryOfOrigin: formData.countryName 
          });
          toast.success("Country created successfully");
        }
        
        if (onSave) onSave();
        if (onClose) onClose();
      } catch (error) {
        console.error('Error saving country:', error);
        toast.error(`Failed to save country: ${error.message || 'Unknown error'}`);
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
      title={countryId ? "Edit Country" : "Add Country"}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <FormInput
        label="Country Name"
        name="countryName"
        value={formData.countryName}
        onChange={handleChange}
        error={errors.countryName}
        required
      />
    </FormPage>
  );
};

export default CountryForm;
