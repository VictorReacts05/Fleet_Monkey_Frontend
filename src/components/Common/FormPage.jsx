import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

const FormPage = ({
  title,
  children,
  onSubmit,
  onCancel,
  loading,
  readOnly,
  onEdit,
  isApproved,
}) => {
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const responsiveDirection = () => ({
  display: 'flex', 
  marginRight:"0px",
  flexDirection: {
    xs: 'column',   // vertical stack on mobile
    sm: 'row',      // horizontal on tablet and up
  },
  })

  return (
    <Box sx={{ p: 2, maxWidth: "100%" }}>
      {/* Render header only if title is provided */}
      {title && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, ...responsiveDirection(), }}>
          <Typography variant="h5" sx={{width: "100%"}}>{title}</Typography>
          <Box>
            
            {onEdit && (
              <Button
                variant="contained"
                color="primary"
                onClick={onEdit}
                sx={{ 
                  marginLeft: "16px",
                  sm:{width:"11.55rem"}
                   }}
              >
                Edit
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Content */}
      <Box sx={{ mb: 2 }}>{children}</Box>

      {/* Footer actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{ mr: 1 }}
          disabled={loading}
        >
          Cancel
        </Button>

        {!readOnly && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FormPage;
