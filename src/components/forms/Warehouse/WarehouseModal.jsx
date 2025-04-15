import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import WarehouseForm from './WarehouseForm';

const WarehouseModal = ({ open, onClose, warehouseId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <WarehouseForm
          warehouseId={warehouseId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WarehouseModal;