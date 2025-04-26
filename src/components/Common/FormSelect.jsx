import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  styled,
} from "@mui/material";

// Styled Select component for 38px height and centered label
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
  },
  "& .MuiOutlinedInput-root": {
    height: 38,
    padding: 0,
    display: "flex",
    alignItems: "center",
    borderRadius: theme.shape.borderRadius * 1.5,
  },
  "& .MuiInputBase-input": {
    paddingLeft: "14px",
  },
}));

const CustomInputLabel = styled(InputLabel)(() => ({
  top: "50%",
  transform: "translate(14px, -50%)",
  fontSize: "0.875rem",
  "&.MuiInputLabel-shrink": {
    top: 0,
    transform: "translate(14px, -8px) scale(0.75)",
  },
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
    <FormControl fullWidth margin="normal" error={error}>
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
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default FormSelect;
