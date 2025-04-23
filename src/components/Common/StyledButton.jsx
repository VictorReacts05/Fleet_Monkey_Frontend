import React from 'react';
import { Button } from '@mui/material';

const StyledButton = ({ 
  onClick, 
  startIcon,
  children, 
  variant = "contained", 
  color = "primary",
  ...props 
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      startIcon={startIcon}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        padding: '8px 16px',
        minWidth: '120px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default StyledButton;