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
    boxShadow: "0 0 0 1000px #595959 inset !important",
    WebkitTextFillColor: "white !important",
    transition: "background-color 9999s ease-out 0s",
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
  top: "20px",
  transform: "translate(14px, -50%)",
  fontSize: "0.875rem",
  
  "&.MuiInputLabel-shrink": {
    top: 0,
    transform: "translate(14px, -8px) scale(0.75)",
  },
}));

// Add styled FormHelperText to remove margin
const CustomFormHelperText = styled(FormHelperText)(() => ({
  marginTop: 0,
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
