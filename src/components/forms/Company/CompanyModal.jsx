import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CompanyForm from './CompanyForm';

const CompanyModal = ({ open, onClose, companyId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <CompanyForm
          companyId={companyId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CompanyModal;