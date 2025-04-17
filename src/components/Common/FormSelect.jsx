import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const FormSelect = ({ label, value, onChange, options, error, helperText, ...props }) => {
  return (
    <FormControl fullWidth margin="normal" error={error}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={onChange} {...props}>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.value === ""}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default FormSelect;