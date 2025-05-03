import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import FormInput from "../../Common/FormInput";
import { createCity, updateCity, fetchCities, fetchCountries } from "./CityAPI";
import { toast } from "react-toastify";

const CityModal = ({ open, onClose, cityId, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    cityName: "",
    countryId: "",
  });
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [errors, setErrors] = useState({});
  const closeButtonRef = useRef(null);

  // Load countries for dropdown
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetchCountries();
        setCountries(response.data || []);
      } catch (error) {
        console.error("Error loading countries:", error);
        toast.error("Failed to load countries");
      }
    };

    if (open) {
      loadCountries();
    }
  }, [open]);

  useEffect(() => {
    const loadCity = async () => {
      if (!cityId) {
        setFormData({ cityName: "", countryId: "" });
        return;
      }

      try {
        setLoading(true);

        // If we already have the data from the list, use it
        if (initialData) {
          setFormData({
            cityName: initialData.cityName || "",
            countryId: initialData.countryId || "",
          });
        } else {
          // Use fetchCities to get city details
          const response = await fetchCities(1, 100);
          const cities = response.data || [];
          const city = cities.find((c) => c.CityID === cityId);

          if (city) {
            setFormData({
              cityName: city.CityName || "",
              countryId: city.CountryID || "",
            });
          } else {
            toast.error("City not found");
          }
        }
      } catch (error) {
        console.error("Error loading city:", error);
        toast.error("Failed to load city details");
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadCity();
    }
  }, [cityId, open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cityName.trim()) {
      newErrors.cityName = "City name is required";
    }

    if (!formData.countryId) {
      newErrors.countryId = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (cityId) {
        // Make sure we're sending the data in the format the API expects
        const updateData = {
          cityId: cityId,
          cityName: formData.cityName,
          countryId: formData.countryId,
          createdById: 1, // Adding required createdById field with a default value
        };

        await updateCity(cityId, updateData);
        toast.success("City updated successfully");
      } else {
        await createCity({
          cityName: formData.cityName,
          countryId: formData.countryId,
          createdById: 1, // Adding required createdById field with a default value
        });
        toast.success("City created successfully");
      }

      // Close modal and refresh list
      setLoading(false);
      onClose();
      setTimeout(() => onSave(), 300);
    } catch (error) {
      console.error("Error saving city:", error);
      toast.error(
        "Failed to save city: " +
          (error.response?.data?.message || error.message)
      );
      setLoading(false);
    }
  };

  // Handle closing with proper focus management
  const handleDialogClose = (event, reason) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="city-dialog-title"
      disableEscapeKeyDown={loading}
      keepMounted={false}
    >
      <DialogTitle id="city-dialog-title">
        {cityId ? "Edit City" : "Add City"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth error={!!errors.countryId}>
              <InputLabel id="country-select-label">Country</InputLabel>
              <Select
                labelId="country-select-label"
                id="country-select"
                name="countryId"
                value={formData.countryId}
                onChange={handleChange}
                label="Country"
                disabled={loading}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300, // Set maximum height for scrollable area
                      overflow: "auto", // Enable scrolling
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>Select a country</em>
                </MenuItem>
                {countries.map((country) => (
                  <MenuItem
                    key={country.CountryOfOriginID}
                    value={country.CountryOfOriginID}
                  >
                    {country.CountryOfOrigin}
                  </MenuItem>
                ))}
              </Select>
              {errors.countryId && (
                <FormHelperText>{errors.countryId}</FormHelperText>
              )}
            </FormControl>
            <FormInput
              label="City Name"
              name="cityName"
              value={formData.cityName}
              onChange={handleChange}
              required
              fullWidth
              disabled={loading}
              autoFocus
              error={!!errors.cityName}
              helperText={errors.cityName}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading} ref={closeButtonRef}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {cityId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CityModal;
