import React from 'react';
import { 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormHelperText 
} from '@mui/material';

const FormRadioGroup = ({ label, value, onChange, options, error, helperText, ...props }) => {
  return (
    <FormControl error={error} margin="normal">
      <FormLabel>{label}</FormLabel>
      <RadioGroup value={value} onChange={onChange} {...props}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default FormRadioGroup;