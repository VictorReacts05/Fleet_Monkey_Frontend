import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import SalesInvoiceForm from './SalesInvoiceForm';

const SalesInvoiceModal = ({ open, onClose, salesInvoiceId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <SalesInvoiceForm
          salesInvoiceId={salesInvoiceId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SalesInvoiceModal;