import React from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';

const FormCheckbox = ({ label, name, checked, onChange, disabled = false }) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={onChange}
          name={name}
          disabled={disabled}
          color="primary"
        />
      }
      label={label}
    />
  );
};

export default FormCheckbox;