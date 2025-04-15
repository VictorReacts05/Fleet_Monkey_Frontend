import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CountryForm from './CountryForm';

const CountryModal = ({ open, onClose, countryId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <CountryForm
          countryId={countryId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CountryModal;