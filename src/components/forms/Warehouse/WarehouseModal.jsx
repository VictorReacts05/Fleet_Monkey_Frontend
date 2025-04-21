import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import FormInput from '../../Common/FormInput';
import { createWarehouse, updateWarehouse, fetchWarehouses } from './WarehouseAPI';
import { toast } from 'react-toastify';

const WarehouseModal = ({ open, onClose, warehouseId, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    warehouseName: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadWarehouse = async () => {
      if (!warehouseId) {
        setFormData({ warehouseName: '' });
        return;
      }

      try {
        setLoading(true);
        
        // If we already have the data from the list, use it
        if (initialData) {
          setFormData({
            warehouseName: initialData.warehouseName || '',
          });
        } else {
          // Since fetchWarehouseById is not available, use fetchWarehouses to get all warehouses
          // and filter for the one we need
          const response = await fetchWarehouses(1, 100);
          const warehouses = response.data || [];
          const warehouse = warehouses.find(w => w.WarehouseID === warehouseId);
          
          if (warehouse) {
            setFormData({
              warehouseName: warehouse.WarehouseName || '',
            });
          } else {
            toast.error('Warehouse not found');
          }
        }
      } catch (error) {
        console.error('Error loading warehouse:', error);
        toast.error('Failed to load warehouse details');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadWarehouse();
    }
  }, [warehouseId, open, initialData]);

  // Debugging to check if handleChange is being called
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => {
      const newState = { ...prevState, [name]: value };
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (warehouseId) {
        // Make sure we're sending the data in the format the API expects
        const updateData = {
          WarehouseID: warehouseId,
          WarehouseName: formData.warehouseName // This matches the backend expectation
        };
        
        await updateWarehouse(warehouseId, updateData);
        toast.success('Warehouse updated successfully');
      } else {
        // For creation
        await createWarehouse({
          WarehouseName: formData.warehouseName // This matches the backend expectation
        });
        toast.success('Warehouse created successfully');
      }
      
      // Close modal and refresh list - moved outside the if/else for both cases
      setLoading(false); // Ensure loading is set to false before closing
      onClose(); // First close the modal
      setTimeout(() => onSave(), 300); // Then refresh with a delay
      
    } catch (error) {
      console.error('Error saving warehouse:', error);
      toast.error('Failed to save warehouse: ' + (error.response?.data?.message || error.message));
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
              required
              fullWidth
              disabled={loading}
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