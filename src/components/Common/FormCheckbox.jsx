import React from "react";
import { FormControlLabel, Checkbox, styled, Box } from "@mui/material";

// Styled FormControlLabel for consistent height
const CustomFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  height: 38,
  alignItems: "center",
  
  ".MuiCheckbox-root": {
    padding: "4px", // Reduce padding for better vertical alignment
    // Dynamic background color based on theme mode
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.background.paper // Light mode: white or paper background
        : theme.palette.grey[800], // Dark mode: dark gray (similar to #595959)
    // Optional: Add border to make checkbox visible in light mode
    border:
      theme.palette.mode === "light"
        ? `1px solid ${theme.palette.grey[400]}`
        : `1px solid ${theme.palette.grey[700]}`,
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "light"
          ? theme.palette.grey[100] // Light mode: light gray on hover
          : theme.palette.grey[700], // Dark mode: slightly lighter gray on hover
    },
    "&.Mui-checked": {
      // Optional: Background when checked
      backgroundColor:
        theme.palette.mode === "light"
          ? theme.palette.grey[200] // Light mode: light gray when checked
          : theme.palette.grey[900], // Dark mode: darker gray when checked
    },
    "&.Mui-disabled": {
      backgroundColor:
        theme.palette.mode === "light"
          ? theme.palette.grey[200] // Light mode: disabled background
          : theme.palette.grey[900], // Dark mode: disabled background
      opacity: 0.5,
    },
  },
  ".MuiSvgIcon-root": {
    // Dynamic checkmark/icon color
    color:
      theme.palette.mode === "light"
        ? theme.palette.text.secondary // Light mode: gray icon
        : theme.palette.common.white, // Dark mode: white icon
  },
  ".MuiTypography-root": {
    fontSize: "0.875rem", // Match with typical form text size
    // Dynamic label color
    color:
      theme.palette.mode === "light"
        ? theme.palette.text.primary // Light mode: dark text
        : theme.palette.common.white, // Dark mode: white text
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
            // Use theme-aware color for the checkmark
            sx={{
              color:
                disabled
                  ? "default" // Let MUI handle disabled color
                  : undefined,
              "&.Mui-checked": {
                color: "primary.main", // Checkmark color when checked
              },
            }}
          />
        }
        label={label}
        {...props}
      />
    </Box>
  );
};

export default FormCheckbox;