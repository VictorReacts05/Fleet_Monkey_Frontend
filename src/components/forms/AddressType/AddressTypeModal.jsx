import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress
} from '@mui/material';
import AddressTypeForm from './AddressTypeForm';
import { getAddressTypeById } from './AddressTypeAPI';

const AddressTypeModal = ({ open, onClose, addressTypeId, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [addressTypeData, setAddressTypeData] = useState(null);

  useEffect(() => {
    // Define the loadAddressType function inside the useEffect
    const loadAddressType = async () => {
      if (addressTypeId) {
        try {
          setLoading(true);
          const data = await getAddressTypeById(addressTypeId);
          setAddressTypeData(data);
        } catch (error) {
          console.error('Error loading address type:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setAddressTypeData(null);
      }
    };

    // Call the function
    loadAddressType();
  }, [addressTypeId]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {addressTypeId ? 'Edit Address Type' : 'Add New Address Type'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        ) : (
          <AddressTypeForm 
            addressTypeId={addressTypeId}
            initialData={addressTypeData}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddressTypeModal;