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
  onCreatePurchaseRFQ,
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

  return (
    <Box sx={{ p: 2, maxWidth: "100%" }}>
      {/* Render header only if title is provided */}
      {title && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5">{title}</Typography>
          <Box>
            {onEdit && (
              <Button
                variant="contained"
                color="secondary"
                onClick={onCreatePurchaseRFQ}
                sx={{ mr: 1 }}
                disabled={!isApproved}
              >
                Create Purchase RFQ
              </Button>
            )}
            {onEdit && (
              <Button
                variant="contained"
                color="primary"
                onClick={onEdit}
                sx={{ mr: 1 }}
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
