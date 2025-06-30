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
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.background.paper
        : theme.palette.grey[800],
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
}));

const CustomInputLabel = styled(InputLabel)(({ theme }) => ({
  top: "19px",
  transform: "translate(14px, -50%)",
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
    <FormControl
      fullWidth
      margin="dense"
      error={error}
      sx={{ my: 0.5, ...props.sx }}
    >
      <CustomInputLabel>{label}</CustomInputLabel>
      <CustomSelect
        value={value}
        label={label}
        onChange={onChange}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 364, // 48px * 8 items = 384px
            },
          },
        }}
        {...props}
      >
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