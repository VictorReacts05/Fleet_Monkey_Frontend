import React from 'react';
import { TextField } from '@mui/material';

const FormTextArea = ({ label, value, onChange, error, helperText, rows = 4, ...props }) => {
  return (
    <TextField
      fullWidth
      multiline
      rows={rows}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      variant="outlined"
      margin="normal"
      {...props}
    />
  );
};

export default FormTextArea;