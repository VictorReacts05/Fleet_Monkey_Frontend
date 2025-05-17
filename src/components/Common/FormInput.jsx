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
    // Dynamic background color based on theme mode
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.background.paper // Light mode: white or paper background
        : theme.palette.grey[800], // Dark mode: dark gray (similar to #595959)
    "& input": {
      padding: "0 14px",
      height: "100%",
      boxSizing: "border-box",
      // Dynamic text color
      color:
        theme.palette.mode === "light"
          ? theme.palette.text.primary // Light mode: dark text
          : theme.palette.common.white, // Dark mode: white text
    },
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
    "& input:-webkit-autofill": {
      // Dynamic autofill background and text color
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
  },
  "& .MuiInputLabel-root": {
    top: "-6px",
    // Dynamic label color
    color:
      theme.palette.mode === "light"
        ? theme.palette.text.secondary // Light mode: grey label
        : "#dcdcdc", // Dark mode: light grey
    "&.MuiInputLabel-shrink": {
      top: 0,
    },
  },
  "& .MuiFormHelperText-root": {
    marginTop: 0,
    marginBottom: 0,
    height: "auto",
    color: theme.palette.error.main, // Error color remains the same
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
  ...props
}) => {
  const hasError = Boolean(error);

  return (
    <Box sx={{ marginTop: "4px", marginBottom: "4px", ...(props.sx || {}) }}>
      {tooltip ? (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight="medium"
          >
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
        helperText={hasError ? error : " "}
        variant="outlined"
        margin="none"
        required={required}
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