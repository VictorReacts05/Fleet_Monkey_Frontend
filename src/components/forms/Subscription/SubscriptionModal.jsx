import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import SubscriptionForm from './SubscriptionForm';

const SubscriptionModal = ({ open, onClose, subscriptionId, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <SubscriptionForm
          subscriptionId={subscriptionId}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;