import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { createSupplier, updateSupplier, getSupplierById } from './SupplierAPI';
import { toast } from 'react-toastify';

const SupplierForm = ({ supplierId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    supplierName: '',  // Changed from SupplierName
    supplierEmail: ''  // Changed from SupplierEmail
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplierId) {
      loadSupplier();
    }
  }, [supplierId]);

  const loadSupplier = async () => {
    try {
      setLoading(true);
      const data = await getSupplierById(supplierId);
      setFormData({
        supplierName: data.data?.supplierName || '',  // Changed case
        supplierEmail: data.data?.supplierEmail || ''  // Changed case
      });
    } catch (error) {
      toast.error('Failed to load supplier: ' + error.message);
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
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.supplierName?.trim()) {  // Changed case
      newErrors.supplierName = 'Supplier name is required';
    }
    
    if (!formData.supplierEmail?.trim()) {  // Changed case
      newErrors.supplierEmail = 'Supplier email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.supplierEmail)) {
      newErrors.supplierEmail = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (supplierId) {
        await updateSupplier(supplierId, formData);
        toast.success('Supplier updated successfully');
      } else {
        await createSupplier(formData);
        toast.success('Supplier created successfully');
      }
      
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      toast.error(`Failed to ${supplierId ? 'update' : 'create'} supplier: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" mb={3}>
        {supplierId ? 'Edit Supplier' : 'Create New Supplier'}
      </Typography>
      
      <TextField
        fullWidth
        margin="normal"
        label="Supplier Name"
        name="supplierName"  // Changed case
        value={formData.supplierName}  // Changed case
        onChange={handleChange}
        error={!!errors.supplierName}  // Changed case
        helperText={errors.supplierName}  // Changed case
        required
      />
      
      <TextField
        fullWidth
        margin="normal"
        label="Supplier Email"
        name="supplierEmail"  // Changed case
        value={formData.supplierEmail}  // Changed case
        onChange={handleChange}
        error={!!errors.supplierEmail}  // Changed case
        helperText={errors.supplierEmail}  // Changed case
        required
      />
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {supplierId ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Box>
  );
};

export default SupplierForm;