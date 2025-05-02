import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import FormInput from '../../Common/FormInput';
import { createCountry, updateCountry, fetchCountries } from './CountryAPI';
import { toast } from 'react-toastify';

const CountryModal = ({ open, onClose, countryId, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    countryName: '',
  });
  const [loading, setLoading] = useState(false);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const loadCountry = async () => {
      if (!countryId) {
        setFormData({ countryName: '' });
        return;
      }

      try {
        setLoading(true);
        
        // If we already have the data from the list, use it
        if (initialData) {
          setFormData({
            countryName: initialData.countryName || '',
          });
        } else {
          // Use fetchCountries to get all countries and filter for the one we need
          const response = await fetchCountries(1, 100);
          const countries = response.data || [];
          const country = countries.find(c => c.CountryOfOriginID === countryId);
          
          if (country) {
            setFormData({
              countryName: country.CountryOfOrigin || '',
            });
          } else {
            toast.error('Country not found');
          }
        }
      } catch (error) {
        console.error('Error loading country:', error);
        toast.error('Failed to load country details');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadCountry();
    }
  }, [countryId, open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem("user")) || {};
      
      // Inside the handleSubmit function (around line 70-85)
      if (countryId) {
        // Make sure we're sending the data in the format the API expects
        const updateData = {
          CountryOfOriginID: countryId,
          CountryOfOrigin: formData.countryName, // Changed from countryOfOrigin to CountryOfOrigin
          CreatedByID: user.personId || 1  // Changed from createdById to CreatedByID
        };
        
        await updateCountry(countryId, updateData);
        toast.success('Country updated successfully');
      } else {
        await createCountry({
          CountryOfOrigin: formData.countryName,  // Changed from countryOfOrigin to CountryOfOrigin
          CreatedByID: user.personId || 1  // Changed from createdById to CreatedByID
        });
        toast.success('Country created successfully');
      }
      
      // Close modal and refresh list
      setLoading(false);
      onClose();
      setTimeout(() => onSave(), 300);
      
    } catch (error) {
      console.error('Error saving country:', error);
      toast.error('Failed to save country: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  // Handle closing with proper focus management
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
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormInput
              label="Country Name"
              name="countryName"
              value={formData.countryName}
              onChange={handleChange}
              required
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