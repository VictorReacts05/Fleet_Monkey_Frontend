import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import PurchaseRFQForm from './PurchaseRFQForm';

const PurchaseRFQModal = ({ open, onClose, purchaseRFQId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <PurchaseRFQForm
          purchaseRFQId={purchaseRFQId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseRFQModal;