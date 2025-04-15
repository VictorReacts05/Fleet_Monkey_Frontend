import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import SalesRFQForm from './SalesRFQForm';

const SalesRFQModal = ({ open, onClose, salesRFQId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <SalesRFQForm
          salesRFQId={salesRFQId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SalesRFQModal;