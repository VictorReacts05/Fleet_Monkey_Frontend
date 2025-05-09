import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const FormDatePicker = ({ name, label, value, onChange, error, helperText, disabled = false, ...props }) => {
  // Convert the value to a dayjs object if it's not already
  const dayjsValue = value ? (dayjs.isDayjs(value) ? value : dayjs(value)) : null;
  
  const handleChange = (newValue) => {
    onChange(newValue);
  };

  return (
    <DatePicker
      label={label}
      value={dayjsValue}
      onChange={handleChange}
      disabled={disabled}
      slotProps={{
        textField: {
          name,
          fullWidth: true,
          error,
          helperText,
          variant: "outlined",
          size: "small",
          ...props
        }
      }}
    />
  );
};

export default FormDatePicker;
