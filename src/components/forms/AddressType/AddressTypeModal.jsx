import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import AddressTypeForm from './AddressTypeForm';

const AddressTypeModal = ({ open, onClose, addressTypeId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <AddressTypeForm
          addressTypeId={addressTypeId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddressTypeModal;