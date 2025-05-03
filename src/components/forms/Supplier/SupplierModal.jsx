import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import SupplierForm from './SupplierForm';

const SupplierModal = ({ open, onClose, supplierId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <SupplierForm
          supplierId={supplierId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SupplierModal;