import React from 'react';
import { TextField, styled } from '@mui/material';

// Custom styling for FormTextArea
const CustomTextArea = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: 120, // Adjust the height as needed
    padding: 0,
    // Dynamic background color
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.background.paper // Light mode: white or paper background
        : theme.palette.grey[800], // Dark mode: dark gray (similar to #595959)
    "& textarea": {
      padding: "14px", // Adjust padding for text area content
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
    "&.Mui-disabled": {
      backgroundColor:
        theme.palette.mode === "light"
          ? theme.palette.grey[200] // Light mode: disabled background
          : theme.palette.grey[900], // Dark mode: disabled background
      opacity: 0.5,
    },
    // Autofill override
    "& textarea:-webkit-autofill": {
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
  "& .MuiInputLabel-root": {
    top: "-6px",
    // Dynamic label color
    color:
      theme.palette.mode === "light"
        ? theme.palette.text.secondary // Light mode: gray label
        : "#dcdcdc", // Dark mode: light grey
    "&.MuiInputLabel-shrink": {
      top: 0,
    },
    "&.Mui-focused": {
      color: theme.palette.primary.main, // Same for both modes
    },
    "&.Mui-error": {
      color: theme.palette.error.main, // Same for both modes
    },
  },
  "& .MuiFormHelperText-root": {
    marginTop: 0,
    // Dynamic helper text color (for errors)
    color: theme.palette.error.main,
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
      margin="dense"
      sx={{ my: 0.5, ...props.sx }}
      {...props}
    />
  );
};

export default FormTextArea;