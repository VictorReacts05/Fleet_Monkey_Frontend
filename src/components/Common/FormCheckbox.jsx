import React from "react";
import { FormControlLabel, Checkbox, styled, Box } from "@mui/material";

// Styled FormControlLabel for consistent height
const CustomFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  height: 38,
  alignItems: "center",
  ".MuiCheckbox-root": {
    padding: "4px", // reduce padding for better vertical alignment
  },
  ".MuiTypography-root": {
    fontSize: "0.875rem", // match with typical form text size
  },
}));

const FormCheckbox = ({ label, name, checked, onChange, disabled = false, sx, ...props }) => {
  return (
    <Box sx={{ my: 0.5, ...sx }}>
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
        {...props}
      />
    </Box>
  );
};

export default FormCheckbox;
