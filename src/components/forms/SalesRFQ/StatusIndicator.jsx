import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Menu, 
  MenuItem, 
  CircularProgress 
} from '@mui/material';
import { CheckCircle, PendingActions, Cancel } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const StatusIndicator = ({ status, salesRFQId, onStatusChange, readOnly }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleClick = (event) => {
    if (readOnly) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);
      
      // Get auth token from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const headers = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
      
      console.log(`Sending PUT request to update status to ${newStatus} for SalesRFQ ID: ${salesRFQId}`);
      
      // Send PUT request directly to update the status
      const response = await axios.put(
        `http://localhost:7000/api/sales-rfq/${salesRFQId}`,
        { 
          Status: newStatus,
          // Include only the necessary fields to update the status
          SalesRFQID: salesRFQId
        },
        { headers }
      );
      
      console.log('Status update response:', response.data);
      
      if (response.data.success) {
        toast.success(`SalesRFQ ${newStatus.toLowerCase()} successfully`);
        onStatusChange(newStatus);
      } else {
        toast.error(`Failed to update status: ${response.data.message}`);
      }
    } catch (error) {
      console.error(`Error updating SalesRFQ status to ${newStatus}:`, error);
      toast.error(`Error updating status: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleApprove = () => {
    console.log('Approve button clicked');
    updateStatus('Approved');
  };
  
  const handleDisapprove = () => {
    console.log('Disapprove button clicked');
    updateStatus('Pending');
  };

  // Determine chip color based on status
  const getChipProps = () => {
    switch (status) {
      case 'Approved':
        return { 
          color: 'success', 
          icon: <CheckCircle />,
          clickable: !readOnly
        };
      case 'Pending':
        return { 
          color: 'warning', 
          icon: <PendingActions />,
          clickable: !readOnly
        };
      default:
        return { 
          color: 'default', 
          icon: null,
          clickable: !readOnly
        };
    }
  };

  const chipProps = getChipProps();

  return (
    <Box>
      <Chip
        label={
          <Typography variant="body2">
            {loading ? 'Processing...' : status || 'Unknown'}
          </Typography>
        }
        color={chipProps.color}
        icon={loading ? <CircularProgress size={16} color="inherit" /> : chipProps.icon}
        onClick={chipProps.clickable ? handleClick : undefined}
        sx={{
          cursor: chipProps.clickable ? 'pointer' : 'default',
          '& .MuiChip-label': {
            display: 'flex',
            alignItems: 'center',
          }
        }}
      />
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {status !== 'Approved' && (
          <MenuItem onClick={handleApprove} disabled={loading}>
            {loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : <CheckCircle sx={{ mr: 1 }} color="success" />}
            Approve
          </MenuItem>
        )}
        {status === 'Approved' && (
          <MenuItem onClick={handleDisapprove} disabled={loading}>
            {loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : <Cancel sx={{ mr: 1 }} color="error" />}
            Disapprove
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default StatusIndicator;