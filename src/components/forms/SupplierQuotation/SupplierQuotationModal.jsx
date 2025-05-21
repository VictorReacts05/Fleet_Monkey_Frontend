import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import SupplierQuotationForm from './SupplierQuotationForm';

const SupplierQuotationModal = ({ open, onClose, supplierQuotationId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <SupplierQuotationForm
          supplierQuotationId={supplierQuotationId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SupplierQuotationModal;