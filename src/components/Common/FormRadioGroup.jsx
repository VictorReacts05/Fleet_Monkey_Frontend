import React from 'react';
import { 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormHelperText,
  styled
} from '@mui/material';

// Add styled FormHelperText to remove margin
const CustomFormHelperText = styled(FormHelperText)(() => ({
  marginTop: 0,
}));

const FormRadioGroup = ({ label, value, onChange, options, error, helperText, ...props }) => {
  return (
    <FormControl error={error} margin="dense" sx={{ my: 0.5, ...props.sx }}>
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
      {helperText && <CustomFormHelperText>{helperText}</CustomFormHelperText>}
    </FormControl>
  );
};

export default FormRadioGroup;