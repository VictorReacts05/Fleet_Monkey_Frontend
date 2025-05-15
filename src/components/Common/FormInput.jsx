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

const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: 38,
    padding: 0,
    backgroundColor: "#595959",
    "& input": {
      padding: "0 14px",
      height: "100%",
      boxSizing: "border-box",
      color: theme.palette.common.white,
    },
    "& fieldset": {
      borderColor: "#8a8a8a",
    },
    "&:hover fieldset": {
      borderColor: "#a0a0a0",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "& input:-webkit-autofill": {
      boxShadow: "0 0 0 1000px #595959 inset !important",
      WebkitTextFillColor: "white !important",
      transition: "background-color 9999s ease-out 0s",
    },
  },
  "& .MuiInputLabel-root": {
    top: "-6px",
    color: "#dcdcdc",
    "&.MuiInputLabel-shrink": {
      top: 0,
    },
  },
  "& .MuiFormHelperText-root": {
    marginTop: 0,
    marginBottom: 0,
    height: "auto", // Ensure error text is visible
    color: theme.palette.error.main, // Red for errors
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
  required = false, // Explicitly handle required prop
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
        helperText={hasError ? error : " "} // Ensure spacing for layout
        variant="outlined"
        margin="none"
        required={required} // Controlled by prop
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