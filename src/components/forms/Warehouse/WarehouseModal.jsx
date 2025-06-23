import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import FormInput from '../../Common/FormInput';
import { createWarehouse, updateWarehouse, fetchWarehouses } from './WarehouseAPI';
import { toast } from 'react-toastify';

// Remove this line
// import { getAuthHeader } from './WarehouseAPI';

const WarehouseModal = ({ open, onClose, warehouseId, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    warehouseName: '',
    warehouseAddressId: 1, // <-- Add this line (default value for testing)
  });
  const [errors, setErrors] = useState({
    warehouseName: '',
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const loadWarehouse = async () => {
      if (!warehouseId) {
        setFormData({ warehouseName: '', warehouseAddressId: 1 }); // Ensure both fields are set
        setErrors({ warehouseName: '' });
        return;
      }

      try {
        setLoading(true);
        if (initialData) {
          setFormData({
            warehouseName: initialData.warehouseName || '',
            warehouseAddressId: initialData.warehouseAddressId || 1, // Ensure this is set from initialData if available
          });
        } else {
          const response = await fetchWarehouses(1, 100);
          const warehouses = response.data || [];
          const warehouse = warehouses.find(w => w.WarehouseID === warehouseId);

          if (warehouse) {
            setFormData({
              warehouseName: warehouse.WarehouseName || '',
              warehouseAddressId: warehouse.WarehouseAddressID || 1, // Ensure this is set from warehouse data
            });
          } else {
            console.log('Warehouse not found');
          }
        }
      } catch (error) {
        console.error('Error loading warehouse:', error);
        console.log('Failed to load warehouse details');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadWarehouse();
    }
  }, [warehouseId, open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === "warehouseAddressId" ? Number(value) : value, // Always store as number
    }));

    if (errors[name]) {
      setErrors(prevState => ({
        ...prevState,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.warehouseName.trim()) {
      newErrors.warehouseName = 'Warehouse Name is required';
    } else if (formData.warehouseName.length < 3) {
      newErrors.warehouseName = 'Warehouse Name must be at least 3 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    console.log('Form data on submit:', formData);

    if (!validateForm()) {
      console.log('Validation failed, errors:', errors);
      console.log('Please fix the form errors');
      return;
    }

    // Check for user authentication
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const personId = user?.personId || user?.id || user?.userId;
    
    if (!personId) {
      console.log('You must be logged in to save a warehouse');
      return;
    }

    // TODO: Replace 1 with the actual selected address ID from your form
    // const warehouseAddressId = 1; // <-- REMOVE this line, use formData.warehouseAddressId instead

    console.log('Validation passed, proceeding with API call');

    try {
      setLoading(true);
      if (warehouseId) {
        const updateData = {
          warehouseName: formData.warehouseName,
          warehouseAddressId: formData.warehouseAddressId,
          createdById: Number(personId)
        };
        console.log('Updating warehouse with data:', updateData);
        await updateWarehouse(warehouseId, updateData);
        toast.success('Warehouse updated successfully');
      } else {
        const createData = {
          warehouseName: formData.warehouseName,
          warehouseAddressId: formData.warehouseAddressId,
          createdById: Number(personId)
        };
        console.log('Creating warehouse with data:', createData);
        await createWarehouse(createData);
        toast.success('Warehouse created successfully');
      }

      setLoading(false);
      onClose();
      setTimeout(() => onSave(), 300);
    } catch (error) {
      console.error('Error saving warehouse:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      if (errorMessage.toLowerCase().includes('warehouse name')) {
        setErrors({ warehouseName: errorMessage });
      } else {
        console.log('Failed to save warehouse: ' + errorMessage);
      }
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{warehouseId ? 'Edit Warehouse' : 'Add Warehouse'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormInput
              label="Warehouse Name"
              name="warehouseName"
              value={formData.warehouseName}
              onChange={handleChange}
              fullWidth
              disabled={loading}
              error={isSubmitted && !!errors.warehouseName}
              helperText={isSubmitted && errors.warehouseName}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {warehouseId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default WarehouseModal;