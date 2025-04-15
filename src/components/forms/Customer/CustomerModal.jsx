import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CustomerForm from './CustomerForm';

const CustomerModal = ({ open, onClose, customerId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <CustomerForm
          customerId={customerId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CustomerModal;