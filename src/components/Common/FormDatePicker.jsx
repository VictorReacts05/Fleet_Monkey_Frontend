import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { styled, TextField, Box } from '@mui/material';

// Add styled TextField to match the height and styling of other form components
const CustomTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#595959 !important" : "#fff !important",
  borderRadius: theme.shape.borderRadius * 1.5,
  "& .MuiOutlinedInput-root": {
    height: 38,
    padding: 0,
    borderRadius: theme.shape.borderRadius * 1.5,
    boxSizing: "border-box",
    backgroundColor: theme.palette.mode === "dark" ? "#595959" : "#fff",
    "& input": {
      padding: "0 14px",
      height: "100%",
      boxSizing: "border-box",
      color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.text.primary,
    },
    // Add this block for placeholder color
    "& input::placeholder": {
      color: theme.palette.mode === "dark" ? "#fff" : "#757575",
      opacity: 1,
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
    "& input:-webkit-autofill": {
      boxShadow: `0 0 0 1000px ${theme.palette.mode === "dark" ? "#595959" : "#fff"} inset !important`,
      WebkitTextFillColor: theme.palette.mode === "dark" ? "white" : theme.palette.text.primary,
      transition: "background-color 9999s ease-out 0s",
    },
  },
  "& .MuiInputBase-input": {
    height: "100%",
    padding: "0 14px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.text.primary,
  },
  "& .MuiInputAdornment-root": {
    marginRight: 8,
  },
  "& .MuiSvgIcon-root": {
    fontSize: "20px",
    color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.text.primary,
  },
  "& .MuiInputLabel-root": {
    top: "-6px",
    color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.text.primary,
    "&.MuiInputLabel-shrink": {
      top: 0,
    },
  },
  "& .MuiFormHelperText-root": {
    marginTop: 0,
    marginBottom: 0,
    height: "auto",
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
    <Box
      sx={{
        marginTop: "4px",
        marginBottom: "4px",
        backgroundColor: theme => theme.palette.mode === "dark" ? "#595959" : "#fff",
        borderRadius: 2,
        ...(props.sx || {})
      }}
    >
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
            // Inline style for the input root
            InputProps: {
              sx: {
                height: 38,
                backgroundColor: theme => theme.palette.mode === "dark" ? "#595959" : "#fff", // <-- mode-aware background
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