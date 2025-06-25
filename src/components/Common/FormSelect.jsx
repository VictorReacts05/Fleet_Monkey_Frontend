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
    fontSize: "0.875rem",
    color:
      theme.palette.mode === "light"
        ? theme.palette.text.primary
        : theme.palette.common.white,
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.background.paper
        : theme.palette.grey[800],
  },
  "& .MuiOutlinedInput-root": {
    height: 38,
    padding: 0,
    display: "flex",
    alignItems: "center",
    borderRadius: theme.shape.borderRadius,
    "& fieldset": {
      borderColor:
        theme.palette.mode === "light"
          ? theme.palette.grey[400]
          : "#8a8a8a",
    },
    "&:hover fieldset": {
      borderColor:
        theme.palette.mode === "light"
          ? theme.palette.grey[600]
          : "#a0a0a0",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-disabled": {
      backgroundColor:
        theme.palette.mode === "light"
          ? theme.palette.grey[200]
          : theme.palette.grey[900],
      opacity: 0.5,
    },
  },
  "& .MuiInputBase-input": {
    paddingLeft: "14px",
  },
  "& .MuiSelect-icon": {
    color:
      theme.palette.mode === "light"
        ? theme.palette.text.secondary
        : theme.palette.common.white,
  },
  // Autofill handling (though less common for selects, included for consistency)
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
}));

const CustomInputLabel = styled(InputLabel)(({ theme }) => ({
  top: "-6px",
  fontSize: "0.875rem",
  color:
    theme.palette.mode === "light"
      ? theme.palette.text.secondary
      : "#dcdcdc",
  "&.MuiInputLabel-shrink": {
    top: 0,
    transform: "translate(14px, -8px) scale(0.75)",
  },
  "&.Mui-focused": {
    color: theme.palette.primary.main,
  },
  "&.Mui-error": {
    color: theme.palette.error.main,
  },
}));

const CustomFormHelperText = styled(FormHelperText)(({ theme }) => ({
  marginTop: 0,
  marginBottom: 0,
  height: "auto",
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
    <FormControl fullWidth margin="none" error={Boolean(error)} sx={{ my: 0.5, ...props.sx }}>
      <CustomInputLabel>{label}</CustomInputLabel>
      <CustomSelect value={value} label={label} onChange={onChange} {...props}>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.value === ""}
            sx={{
              fontSize: "0.875rem",
              color: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.text.primary
                  : theme.palette.common.white,
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.background.paper
                  : theme.palette.grey[800],
              "&.Mui-selected": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "light"
                    ? theme.palette.action.selected
                    : theme.palette.grey[700],
              },
              "&:hover": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "light"
                    ? theme.palette.action.hover
                    : theme.palette.grey[600],
              },
            }}
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