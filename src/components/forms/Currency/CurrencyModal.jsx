import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CurrencyForm from './CurrencyForm';

const CurrencyModal = ({ open, onClose, currencyId, onSave, initialData }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="currency-dialog-title"
    >
      <DialogContent>
        <CurrencyForm
          currencyId={currencyId}
          onClose={onClose}
          onSave={onSave}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CurrencyModal;