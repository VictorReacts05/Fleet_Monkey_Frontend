import React from 'react';
import { TextField, styled } from '@mui/material';

// Custom styling for FormTextArea
const CustomTextArea = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: 120, // Adjust the height as needed
    padding: 0,
    backgroundColor: "#595959", // Your custom background
    "& textarea": {
      padding: "14px", // Adjust padding for text area content
      height: "100%",
      boxSizing: "border-box",
      color: theme.palette.common.white, // white text for contrast
    },
    "& fieldset": {
      borderColor: "#8a8a8a", // optional: adjust border color
    },
    "&:hover fieldset": {
      borderColor: "#a0a0a0",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
    // Autofill override
    "& textarea:-webkit-autofill": {
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
}));

const FormTextArea = ({ label, value, onChange, error, helperText, rows = 4, ...props }) => {
  return (
    <CustomTextArea
      fullWidth
      multiline
      rows={rows}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      variant="outlined"
      margin="normal"
      {...props}
    />
  );
};

export default FormTextArea;
