import React from "react";
import { TextField, styled } from "@mui/material";

// Create a styled TextField to override autofill styles
const CustomTextField = styled(TextField)({
  // Override autofill background
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 1000px transparent inset", // Prevent blue background
    backgroundColor: "transparent",
    transition: "background-color 5000s ease-in-out 0s", // Smooth transition
  },
  "& input:-webkit-autofill:hover": {
    WebkitBoxShadow: "0 0 0 1000px transparent inset",
    backgroundColor: "transparent",
  },
  "& input:-webkit-autofill:focus": {
    WebkitBoxShadow: "0 0 0 1000px transparent inset",
    backgroundColor: "transparent",
  },
  "& input:-webkit-autofill:active": {
    WebkitBoxShadow: "0 0 0 1000px transparent inset",
    backgroundColor: "transparent",
  },
});

const FormInput = ({ label, value, onChange, error, helperText, ...props }) => {
  return (
    <CustomTextField
      fullWidth
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

export default FormInput;
