import React from "react";
import { TextField, styled, InputAdornment, Tooltip, IconButton, Box, Typography } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Create a styled TextField to override autofill styles
const CustomTextField = styled(TextField)(({ theme }) => ({
  // Override autofill background
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 1000px transparent inset", // Prevent blue background
    backgroundColor: "transparent",
    transition: "background-color 5000s ease-in-out 0s", // Smooth transition
  },
  "& input:-webkit-autofill:hover": {
    WebkitBoxShadow: "0 0 0 1000px transparent inset",
    backgroundColor: "transparent",
  },
  "& input:-webkit-autofill:focus": {
    WebkitBoxShadow: "0 0 0 1000px transparent inset",
    backgroundColor: "transparent",
  },
  "& input:-webkit-autofill:active": {
    WebkitBoxShadow: "0 0 0 1000px transparent inset",
    backgroundColor: "transparent",
  },
  // Enhanced styling
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.light,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  "& .MuiInputLabel-root": {
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
}));

const FormInput = ({ 
  label, 
  value, 
  onChange, 
  error, 
  helperText, 
  tooltip,
  startIcon,
  endIcon,
  ...props 
}) => {
  return (
    <Box>
      {tooltip && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {label}
          </Typography>
          <Tooltip title={tooltip} arrow placement="top">
            <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
              <InfoOutlinedIcon fontSize="small" color="action" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      <CustomTextField
        fullWidth
        label={tooltip ? "" : label}
        value={value}
        onChange={onChange}
        error={error}
        helperText={helperText}
        variant="outlined"
        margin="normal"
        InputProps={{
          startAdornment: startIcon ? (
            <InputAdornment position="start">
              {startIcon}
            </InputAdornment>
          ) : null,
          endAdornment: endIcon ? (
            <InputAdornment position="end">
              {endIcon}
            </InputAdornment>
          ) : null,
        }}
        {...props}
      />
    </Box>
  );
};

export default FormInput;
