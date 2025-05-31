import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, CircularProgress } from '@mui/material';
import AddressForm from './AddressForm';
import { getAddressById } from './AddressAPI';
import { toast } from 'react-toastify';

const AddressModal = ({ open, addressId, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [addressData, setAddressData] = useState(null);

  useEffect(() => {
    const loadAddress = async () => {
      if (addressId) {
        try {
          setLoading(true);
          const data = await getAddressById(addressId);
          setAddressData(data);
        } catch (error) {
          console.error('Error loading address:', error);
          toast.error(`Failed to load address: ${error.message}${error.status ? ` (Status: ${error.status})` : ''}`);
        } finally {
          setLoading(false);
        }
      } else {
        setAddressData(null);
      }
    };

    loadAddress();
  }, [addressId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{addressId ? 'Edit Address' : 'New Address'}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <AddressForm
            addressId={addressId}
            initialData={addressData}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddressModal;