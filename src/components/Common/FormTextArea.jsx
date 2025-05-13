import React from 'react';
import { TextField, styled } from '@mui/material';

// Add styled TextField to remove margin from helper text
const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiFormHelperText-root": {
    marginTop: 0,
  },
}));

const FormTextArea = ({ label, value, onChange, error, helperText, rows = 4, ...props }) => {
  return (
    <CustomTextField
      fullWidth
      multiline
      rows={rows}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      variant="outlined"
      margin="dense"
      sx={{ my: 0.5, ...props.sx }}
      {...props}
    />
  );
};

export default FormTextArea;