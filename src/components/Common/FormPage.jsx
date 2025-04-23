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

const FormPage = ({ 
  title, 
  subtitle,
  children, 
  onSubmit, 
  onCancel,
  loading = false,
  maxWidth = "md",
  actionButtons,
  showBackButton = true
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <Container maxWidth={maxWidth} sx={{ mt: 2, mb: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {showBackButton && (
            <Tooltip title="Back">
              <IconButton 
                onClick={handleCancel} 
                sx={{ mr: 2, color: theme.palette.text.secondary }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={3}>
            {children}
          </Stack>
          
          <Box sx={{ 
            mt: 4, 
            pt: 3, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2,
            borderTop: `1px solid ${theme.palette.divider}`
          }}>
            {actionButtons || (
              <>
                <Button 
                  onClick={handleCancel} 
                  variant="outlined" 
                  color="inherit"
                  disabled={loading}
                  startIcon={<CloseIcon />}
                  sx={{ 
                    borderRadius: 2,
                    px: 3
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                  startIcon={<SaveIcon />}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  Save
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default FormPage;