import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { styled, TextField, Box } from '@mui/material';

// Add styled TextField to match the height and styling of other form components
const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: 38,
    padding: 0,
    borderRadius: theme.shape.borderRadius * 1.5,
    boxSizing: "border-box",
    // Dynamic background color based on theme mode
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.background.paper // Light mode: white or paper background
        : theme.palette.grey[800], // Dark mode: dark gray (similar to #595959)
    "& input": {
      padding: "0 14px",
      height: "100%",
      boxSizing: "border-box",
      // Dynamic text color
      color:
        theme.palette.mode === "light"
          ? theme.palette.text.primary // Light mode: dark text
          : theme.palette.common.white, // Dark mode: white text
    },
    "& fieldset": {
      // Dynamic border color
      borderColor:
        theme.palette.mode === "light"
          ? theme.palette.grey[400] // Light mode: lighter border
          : "#8a8a8a", // Dark mode: keep as is
    },
    "&:hover fieldset": {
      borderColor:
        theme.palette.mode === "light"
          ? theme.palette.grey[600] // Light mode: darker on hover
          : "#a0a0a0", // Dark mode: keep as is
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main, // Same for both modes
    },
    // Autofill override
    "& input:-webkit-autofill": {
      boxShadow: `0 0 0 1000px ${
        theme.palette.mode === "light"
          ? theme.palette.background.paper
          : theme.palette.grey[800]
      } inset !important`,
      WebkitTextFillColor:
        theme.palette.mode === "light"
          ? theme.palette.text.primary
          : "white !important",
      transition: "background-color 9999s ease-out 0s",
    },
  },
  "& .MuiInputBase-input": {
    height: "100%",
    padding: "0 14px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputAdornment-root": {
    marginRight: 8, // Adjust icon spacing
  },
  "& .MuiSvgIcon-root": {
    fontSize: "20px",
    // Dynamic icon color
    color:
      theme.palette.mode === "light"
        ? theme.palette.text.secondary // Light mode: grey icon
        : theme.palette.common.white, // Dark mode: white icon
  },
  "& .MuiInputLabel-root": {
    top: "-6px",
    // Dynamic label color
    color:
      theme.palette.mode === "light"
        ? theme.palette.text.secondary // Light mode: grey label
        : "#dcdcdc", // Dark mode: light grey
    "&.MuiInputLabel-shrink": {
      top: 0,
    },
  },
  "& .MuiFormHelperText-root": {
    marginTop: 0,
    marginBottom: 0,
    height: 0,
    // Dynamic helper text color (for errors)
    color: theme.palette.error.main,
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