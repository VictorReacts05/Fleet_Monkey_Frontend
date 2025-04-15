import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CurrencyForm from './CurrencyForm';

const CurrencyModal = ({ open, onClose, currencyId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <CurrencyForm
          currencyId={currencyId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CurrencyModal;