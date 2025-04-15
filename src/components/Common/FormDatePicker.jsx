import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { FormControl, FormHelperText } from '@mui/material';

const FormDatePicker = ({ label, value, onChange, error, helperText, ...props }) => {
  return (
    <FormControl fullWidth margin="normal" error={error}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        slotProps={{
          textField: {
            fullWidth: true,
            error: error,
            helperText: helperText
          }
        }}
        {...props}
      />
    </FormControl>
  );
};

export default FormDatePicker;