import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  styled,
} from "@mui/material";

const CustomSelect = styled(Select)(({ theme }) => ({
  height: 38,
  display: "flex",
  alignItems: "center",

  "& .MuiSelect-select": {
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    height: "100%",
    boxSizing: "border-box",
    lineHeight: "38px",
    backgroundColor: theme.palette.mode === "dark" ? "#595959" : "#fff", // <-- updated to be mode-aware
  },
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
  "& .MuiOutlinedInput-root": {
    height: 38,
    padding: 0,
    display: "flex",
    alignItems: "center",
    borderRadius: theme.shape.borderRadius * 1.5,
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
  },
  "& .MuiInputBase-input": {
    paddingLeft: "14px",
  },
  "& .MuiSelect-icon": {
    // Dynamic icon color (dropdown arrow)
    color:
      theme.palette.mode === "light"
        ? theme.palette.text.secondary // Light mode: gray icon
        : theme.palette.common.white, // Dark mode: white icon
  },
}));

const CustomInputLabel = styled(InputLabel)(({ theme }) => ({
  top: "19px", // Adjusted to center vertically within 38px height
  transform: "translate(14px, -50%)",
  fontSize: "0.875rem",
  // Dynamic label color
  color:
    theme.palette.mode === "light"
      ? theme.palette.text.secondary // Light mode: gray label
      : "#dcdcdc", // Dark mode: light grey
  "&.MuiInputLabel-shrink": {
    top: 0,
    transform: "translate(14px, -8px) scale(0.75)",
  },
  "&.Mui-focused": {
    color: theme.palette.primary.main, // Same for both modes
  },
  "&.Mui-error": {
    color: theme.palette.error.main, // Same for both modes
  },
}));

const CustomFormHelperText = styled(FormHelperText)(({ theme }) => ({
  marginTop: 0,
  // Dynamic helper text color (for errors)
  color: theme.palette.error.main,
}));

const FormSelect = ({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  ...props
}) => {
  return (
    <FormControl fullWidth margin="dense" error={error} sx={{ my: 0.5, ...props.sx }}>
      <CustomInputLabel>{label}</CustomInputLabel>
      <CustomSelect value={value} label={label} onChange={onChange} {...props}>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.value === ""}
          >
            {option.label}
          </MenuItem>
        ))}
      </CustomSelect>
      {helperText && <CustomFormHelperText>{helperText}</CustomFormHelperText>}
    </FormControl>
  );
};

export default FormSelect;