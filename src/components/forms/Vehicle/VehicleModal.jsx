import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import VehicleForm from './VehicleForm';

const VehicleModal = ({ open, onClose, vehicleId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <VehicleForm
          vehicleId={vehicleId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VehicleModal;