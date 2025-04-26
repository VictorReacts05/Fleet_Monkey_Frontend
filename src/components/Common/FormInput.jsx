import React from "react";
import { TextField, styled, InputAdornment, Tooltip, IconButton, Box, Typography } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Create a styled TextField to override autofill styles
const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: 38,
    padding: 0,
    "& input": {
      padding: "0 14px",
      height: "100%",
      boxSizing: "border-box",
    },
  },
  "& .MuiInputLabel-root": {
    top: "-6px", // Adjust label position
    "&.MuiInputLabel-shrink": {
      top: 0,
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
