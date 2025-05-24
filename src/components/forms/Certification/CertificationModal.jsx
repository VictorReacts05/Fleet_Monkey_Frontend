import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import CertificationForm from './CertificationForm';

const CertificationModal = ({ open, onClose, certificationId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <CertificationForm
          certificationId={certificationId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CertificationModal;