import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Container,
  Divider,
  useTheme,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { CircularProgress } from '@mui/material';

const FormPage = ({ 
  title, 
  children, 
  onSubmit, 
  onCancel, 
  loading, 
  readOnly, 
  onEdit 
}) => {
  
  const handleSubmit = (e) => {
    // Prevent default form submission
    if (e) e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">{title}</Typography>
        <Box>
          {onEdit && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onEdit}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Use div instead of form to completely avoid form submission behavior */}
      <div>
        <Box sx={{ mb: 2 }}>
          {children}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleCancel} 
            sx={{ mr: 1 }}
            disabled={loading}
          >
            Cancel
          </Button>
          
          {!readOnly && (
            <Button 
              onClick={handleSubmit}
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          )}
        </Box>
      </div>
    </Box>
  );
};

export default FormPage;