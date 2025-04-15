import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import PersonForm from './PersonForm';

const PersonModal = ({ open, onClose, personId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <PersonForm
          personId={personId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PersonModal;