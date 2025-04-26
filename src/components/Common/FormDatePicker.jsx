import React from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { FormControl, FormHelperText, styled } from "@mui/material";

// Styled DatePicker's TextField to match 38px height
const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  "& .MuiInputBase-root": {
    height: 38,
    padding: 0,
    borderRadius: theme.shape.borderRadius * 1.5,
    boxSizing: "border-box",
  },
  "& .MuiInputBase-input": {
    height: "100%",
    padding: "0 14px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputAdornment-root": {
    marginRight: 8, // adjust icon spacing
  },
  "& .MuiSvgIcon-root": {
    fontSize: "20px", // optional: scale down the calendar icon
  },
  "& .MuiInputLabel-root": {
    top: "-6px",
    "&.MuiInputLabel-shrink": {
      top: 0,
    },
  },
}));

const FormDatePicker = ({
  label,
  value,
  onChange,
  error,
  helperText,
  ...props
}) => {
  return (
    <FormControl fullWidth margin="normal" error={error}>
      <StyledDatePicker
        label={label}
        value={value}
        onChange={onChange}
        slotProps={{
          textField: {
            fullWidth: true,
            error: error,
            helperText: helperText,
            InputProps: {
              sx: {
                height: 38,
                boxSizing: "border-box",
              },
            },
          },
        }}
        {...props}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default FormDatePicker;
