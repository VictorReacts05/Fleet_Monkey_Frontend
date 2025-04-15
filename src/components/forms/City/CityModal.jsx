import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CityForm from './CityForm';

const CityModal = ({ open, onClose, cityId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <CityForm
          cityId={cityId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CityModal;