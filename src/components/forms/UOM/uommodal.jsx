import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Box,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
// import { getUOMById, createUOM, updateUOM } from './UOMAPI';
import { getUOMById, createUOM, updateUOM, deleteUOM } from "./UOMAPI";

const UOMModal = ({ open, onClose, uomId, onSave }) => {
  const [formData, setFormData] = useState({
    UOM: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (uomId && open) {
      loadUOM();
    } else {
      resetForm();
    }
  }, [uomId, open]);

  const loadUOM = async () => {
    try {
      setLoading(true);
      const response = await getUOMById(uomId);
      console.log("UOM data received:", response);
      
      // Extract the UOM data from the nested structure
      let uomData = null;
      
      if (response.data && response.data.data) {
        // If data is nested in response.data.data
        uomData = response.data.data;
      } else if (response.data) {
        // If data is in response.data
        uomData = response.data;
      } else if (response.success && response.data) {
        // If data is in response.data with success flag
        uomData = response.data;
      } else {
        // Fallback to the whole response
        uomData = response;
      }
      
      console.log("Extracted UOM data:", uomData);
      
      setFormData({
        UOM: uomData.UOM || '',
      });
    } catch (error) {
      console.error('Error loading UOM:', error);
      toast.error('Failed to load UOM: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      UOM: '',
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.UOM.trim()) {
      newErrors.UOM = 'Unit of Measurement is required';
    } else if (formData.UOM.length > 20) {
      newErrors.UOM = 'Unit of Measurement must be 20 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (uomId) {
        // Update existing UOM
        await updateUOM(uomId, formData);
        toast.success('UOM updated successfully');
      } else {
        // Create new UOM
        await createUOM(formData);
        toast.success('UOM created successfully');
      }
      
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error("Error saving UOM:", error);
      
      // Check for our custom unique constraint error
      if (error.isUniqueConstraintError) {
        toast.error(error.message);
      } else {
        // Generic error message for other errors
        toast.error(`Failed to save UOM: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {uomId ? 'Edit Unit of Measurement' : 'Add Unit of Measurement'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Unit of Measurement"
            name="UOM"
            value={formData.UOM}
            onChange={handleChange}
            error={!!errors.UOM}
            helperText={errors.UOM}
            disabled={loading}
            margin="normal"
            inputProps={{ maxLength: 20 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UOMModal;