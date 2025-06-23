import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import FormInput from '../../Common/FormInput';
import { createCountry, updateCountry, fetchCountries } from './CountryAPI';
import { toast } from 'react-toastify';

const CountryModal = ({ open, onClose, countryId, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    countryName: '',
  });
  const [errors, setErrors] = useState({
    countryName: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const loadCountry = async () => {
      if (!countryId) {
        setFormData({ countryName: '' });
        setErrors({ countryName: '' });
        return;
      }

      try {
        setLoading(true);

        if (initialData) {
          setFormData({
            countryName: initialData.countryName || '',
          });
        } else {
          const response = await fetchCountries(1, 100);
          const countries = response.data || [];
          const country = countries.find(c => c.CountryOfOriginID === countryId);

          if (country) {
            setFormData({
              countryName: country.CountryOfOrigin || '',
            });
          } else {
            console.log('Country not found');
          }
        }
      } catch (error) {
        console.error('Error loading country:', error);
        console.log(error.message || 'Failed to load country details');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadCountry();
    }
  }, [countryId, open, initialData]);

  const getValidationError = (field, value) => {
    switch (field) {
      case 'countryName':
        if (!value.trim()) {
          return 'Country name is required';
        } else if (!/^[A-Za-z\s-]{2,}$/.test(value)) {
          return 'Country name must be at least 2 characters and contain only letters, spaces, and hyphens';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {
      countryName: getValidationError('countryName', formData.countryName),
    };

    setErrors(newErrors);
    console.log('[DEBUG] Validation errors:', newErrors);
    return !newErrors.countryName;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));

    if (isSubmitted) {
      setErrors(prevState => ({
        ...prevState,
        [name]: getValidationError(name, value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) {
      console.log('[DEBUG] Form submission blocked due to validation errors');
      return;
    }

    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem('user')) || {};
      const countryData = {
        CountryOfOrigin: formData.countryName,
        CreatedByID: user.personId || 1, // Fallback for testing; adjust as needed
      };

      if (countryId) {
        countryData.CountryOfOriginID = countryId;
        await updateCountry(countryId, countryData);
        toast.success('Country updated successfully');
      } else {
        await createCountry(countryData);
        toast.success('Country created successfully');
      }

      setLoading(false);
      onClose();
      setTimeout(() => onSave(), 300);
    } catch (error) {
      console.error('Error saving country:', error);
      console.log(error.response?.data?.message || error.message || 'Failed to save country');
      setLoading(false);
    }
  };

  const handleDialogClose = (event, reason) => {
    if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="country-dialog-title"
      disableEscapeKeyDown={loading}
      keepMounted={false}
    >
      <DialogTitle id="country-dialog-title">{countryId ? 'Edit Country' : 'Add Country'}</DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormInput
              label="Country Name"
              name="countryName"
              value={formData.countryName}
              onChange={handleChange}
              error={errors.countryName}
              required={false} // Explicitly disable native validation
              fullWidth
              disabled={loading}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            disabled={loading}
            ref={closeButtonRef}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {countryId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CountryModal;