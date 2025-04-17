import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { createAddressType, updateAddressType, getAddressTypeById } from './AddressTypeAPI';
import { toast } from 'react-toastify';

const AddressTypeModal = ({ open, onClose, addressTypeId, onSave }) => {
  const [formData, setFormData] = useState({
    addressType: '',
  });

  useEffect(() => {
    if (addressTypeId) {
      loadAddressType();
    } else {
      setFormData({ addressType: '' });
    }
  }, [addressTypeId]);

  const loadAddressType = async () => {
    try {
      const response = await getAddressTypeById(addressTypeId);
      setFormData({
        addressType: response.data.AddressType || '',
      });
    } catch (error) {
      toast.error('Failed to load address type: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addressTypeId) {
        await updateAddressType(addressTypeId, formData);
        toast.success('Address type updated successfully');
      } else {
        await createAddressType(formData);
        toast.success('Address type created successfully');
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save address type: ' + error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{addressTypeId ? 'Edit Address Type' : 'Create Address Type'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Address Type"
            value={formData.addressType}
            onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddressTypeModal;