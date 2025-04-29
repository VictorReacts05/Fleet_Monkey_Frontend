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
      const data = response.data;
      
      setFormData({
        UOM: data.UOM || '',
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
      
      const apiData = {
        UOM: formData.UOM,
        // Include these fields for API consistency
        CreatedByID: null,
        IsDeleted: false,
        DeletedDateTime: null,
        DeletedByID: null,
      };
      
      if (uomId) {
        await updateUOM(uomId, apiData);
        toast.success('UOM updated successfully');
      } else {
        await createUOM(apiData);
        toast.success('UOM created successfully');
      }
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving UOM:', error);
      toast.error('Failed to save UOM: ' + (error.message || 'Unknown error'));
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