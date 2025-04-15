import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import BankForm from './BankForm';

const BankModal = ({ open, onClose, bankId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <BankForm
          bankId={bankId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BankModal;