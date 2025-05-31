import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Typography, 
  Box,
  Divider,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SubscriptionForm from './SubscriptionForm';

const SubscriptionModal = ({ open, onClose, subscriptionId, onSave }) => {
  const theme = useTheme();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            {subscriptionId ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
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