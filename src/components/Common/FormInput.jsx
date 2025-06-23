import React from "react";
import {
  TextField,
  styled,
  InputAdornment,
  Tooltip,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
 
// Styled component for input field
const CustomTextField = styled(TextField)(({ theme, isDropdown }) => ({
  "& .MuiOutlinedInput-root": {
    height: 38,
    padding: 0,
    fontSize: "0.875rem",
    backgroundColor: isDropdown
      ? theme.palette.mode === "light"
        ? "#fff"
        : theme.palette.grey[800]
      : theme.palette.mode === "light"
      ? theme.palette.background.paper
      : theme.palette.grey[800],
    "& input": {
      padding: "0 14px",
      height: "100%",
      boxSizing: "border-box",
      color:
        theme.palette.mode === "light"
          ? theme.palette.text.primary
          : theme.palette.common.white,
    },
    "& fieldset": {
      borderColor:
        theme.palette.mode === "light" ? theme.palette.grey[400] : "#8a8a8a",
    },
    "&:hover fieldset": {
      borderColor:
        theme.palette.mode === "light" ? theme.palette.grey[600] : "#a0a0a0",
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
    // Autofill handling
    "& input:-webkit-autofill": {
      boxShadow: `0 0 0 1000px ${
        isDropdown
          ? theme.palette.mode === "light"
            ? "#fff"
            : theme.palette.grey[800]
          : theme.palette.mode === "light"
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
    color:
      theme.palette.mode === "light"
        ? theme.palette.text.secondary
        : "#dcdcdc",
    "&.MuiInputLabel-shrink": {
      top: 0,
    },
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
    "&.Mui-error": {
      color: theme.palette.error.main,
    },
  },
  "& .MuiFormHelperText-root": {
    marginTop: 0,
    marginBottom: 0,
    height: "auto",
    color: theme.palette.error.main,
  },
}));

const FormInput = ({
  label,
  value,
  onChange,
  error,
  tooltip,
  startIcon,
  endIcon,
  required = false,
  isDropdown = false,
  ...props
}) => {
  const hasError = Boolean(error);

  return (
    <Box sx={{ marginTop: "4px", marginBottom: "4px", ...(props.sx || {}) }}>
      {tooltip ? (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {label}
          </Typography>
          <Tooltip title={tooltip} arrow placement="top">
            <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
              <InfoOutlinedIcon fontSize="small" color="action" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}

      <CustomTextField
        fullWidth
        label={tooltip ? "" : label}
        value={value}
        onChange={onChange}
        error={hasError}
        helperText={hasError ? error : undefined}
        variant="outlined"
        margin="none"
        required={required}
        isDropdown={isDropdown}
        InputProps={{
          startAdornment: startIcon ? (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ) : null,
          endAdornment: endIcon ? (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ) : null,
        }}
        {...props}
      />
    </Box>
  );
};

export default FormInput;
