import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CompanyForm from './CompanyForm';

const CompanyModal = ({ open, onClose, companyId, onSave }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          width: '80%',
          maxWidth: '800px',
          minHeight: '400px'
        }
      }}
    >
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