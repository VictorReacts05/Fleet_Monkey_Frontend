import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { styled, TextField, Box } from '@mui/material';

// Add styled TextField to match the height and styling of other form components
const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: 38,
    padding: 0,
    backgroundColor: "#595959",
    "& input": {
      padding: "0 14px",
      height: "100%",
      boxSizing: "border-box",
      color: theme.palette.common.white,
    },
    "& fieldset": {
      borderColor: "#8a8a8a",
    },
    "&:hover fieldset": {
      borderColor: "#a0a0a0",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
    // Autofill override
    "& input:-webkit-autofill": {
      boxShadow: "0 0 0 1000px #595959 inset !important",
      WebkitTextFillColor: "white !important",
      transition: "background-color 9999s ease-out 0s",
    },
  },
  "& .MuiInputLabel-root": {
    top: "-6px",
    color: "#dcdcdc",
    "&.MuiInputLabel-shrink": {
      top: 0,
    },
  },
  "& .MuiFormHelperText-root": {
    marginTop: 0,
    marginBottom: 0,
    height: 0,
  },
}));

const FormDatePicker = ({ name, label, value, onChange, error, helperText, disabled = false, ...props }) => {
  // Convert the value to a dayjs object if it's not already
  const dayjsValue = value ? (dayjs.isDayjs(value) ? value : dayjs(value)) : null;
  
  const handleChange = (newValue) => {
    onChange(newValue);
  };

  return (
    <Box sx={{ 
      marginTop: "4px", 
      marginBottom: "4px",
      ...(props.sx || {})
    }}>
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
            margin: "none",
            InputLabelProps: {
              shrink: true,
            },
            // Use the custom styled component
            InputProps: {
              sx: {
                height: 38,
              }
            },
            sx: {
              "& .MuiInputBase-root": {
                height: 38,
              }
            }
          },
          // Style the calendar popup button to match height
          openPickerButton: {
            sx: {
              height: 38,
              padding: 0,
            }
          }
        }}
        components={{
          TextField: CustomTextField
        }}
        {...props}
      />
    </Box>
  );
};

export default FormDatePicker;
