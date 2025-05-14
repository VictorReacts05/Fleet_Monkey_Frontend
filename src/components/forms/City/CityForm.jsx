import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import { createCity, updateCity, getCityById, fetchCountries } from "./CityAPI";
import { toast } from "react-toastify";
import { Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { showToast } from "../../toastNotification";

// Create custom styles for the form components
const useStyles = makeStyles((theme) => ({
  errorSelect: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: theme.palette.error.main,
      },
      "&:hover fieldset": {
        borderColor: theme.palette.error.main,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.error.main,
      },
      backgroundColor: theme.palette.error.light,
    },
  },
}));

const CityForm = ({ cityId, onSave, onClose }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    cityName: "",
    countryId: "",
  });

  const [errors, setErrors] = useState({
    cityName: "",
    countryId: "",
  });

  const [countries, setCountries] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Define required fields
  const requiredFields = {
    cityName: true,
    countryId: true,
  };

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
        countryId: response.CountryID || "", // Fixed typo here (was 'CountryID' instead of 'CountryID')
      });
    } catch (error) {
      console.error("Error loading city:", error);
      toast.error("Failed to load city details");
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value, isSubmitting = false) => {
    let error = "";
    
    // Check required fields only when submitting or when the field has been touched
    if ((isSubmitting || submitted) && requiredFields[name] && !value) {
      error = `${name === 'cityName' ? 'City name' : 'Country'} is required`;
    } else {
      switch (name) {
        case "cityName":
          if (value) {
            if (value.trim().length < 2) {
              error = "City name must be at least 2 characters";
            } else if (!/^[A-Za-z\s-]+$/.test(value)) {
              error = "City name can only contain letters, spaces, and hyphens";
            }
          }
          break;
        case "countryId":
          // Handled by required check above
          break;
        default:
          break;
      }
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate all fields
    Object.keys(formData).forEach(field => {
      const valid = validateField(field, formData[field], true);
      if (!valid) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      const cityData = {
        CityName: formData.cityName.trim(),
        CountryID: formData.countryId,
      };

      if (cityId) {
        await updateCity(cityId, cityData);
        toast.success("City updated successfully");
        showToast("City updated successfully", "success");
      } else {
        await createCity(cityData);
        toast.success("City created successfully");
        showToast("City created successfully","success");
      }

      onSave?.();
      onClose?.();
    } catch (error) {
      console.error("Error saving city:", error);
      toast.error(`Failed to save city: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose?.();
  };

  return (
    <FormPage
      title={cityId ? "Edit City" : "Add City"}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormSelect
            label="Country *"
            name="countryId"
            value={formData.countryId}
            onChange={handleChange}
            options={countries}
            error={!!errors.countryId}
            helperText={errors.countryId || ""}
            className={errors.countryId ? classes.errorSelect : ""}
          />
        </Grid>
        <Grid item xs={12}>
          <FormInput
            label="City Name *"
            name="cityName"
            value={formData.cityName}
            onChange={handleChange}
            error={!!errors.cityName}
            helperText={errors.cityName || ""}
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default CityForm;