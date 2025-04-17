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
    if (open) {
      if (addressTypeId) {
        loadAddressType();
      } else {
        // Reset form when opening for create
        setFormData({ addressType: '' });
      }
    }
  }, [open, addressTypeId]);

  const handleClose = () => {
    // Reset form when closing
    setFormData({ addressType: '' });
    onClose();
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
      // Reset form after successful submission
      setFormData({ addressType: '' });
      onSave();
    } catch (error) {
      toast.error('Failed to save address type: ' + error.message);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddressTypeModal;