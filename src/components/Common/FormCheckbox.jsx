import React from "react";
import { FormControlLabel, Checkbox, styled } from "@mui/material";

// Styled FormControlLabel for consistent height
const CustomFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  height: 38,
  alignItems: "center",
  
  ".MuiCheckbox-root": {
    padding: "4px", // reduce padding for better vertical alignment
    backgroundColor: "#595959", // Your custom background

  },
  ".MuiTypography-root": {
    fontSize: "0.875rem", // match with typical form text size
  },
}));

const FormCheckbox = ({ label, name, checked, onChange, disabled = false }) => {
  return (
    <CustomFormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={onChange}
          name={name}
          disabled={disabled}
          color="primary"
        />
      }
      label={label}
    />
  );
};

export default FormCheckbox;
