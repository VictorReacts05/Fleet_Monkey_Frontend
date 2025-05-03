import { useState } from "react";
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
  onSave,
  onCancel,
  isLoading,
  readOnly = false,
  onEdit,
  isEditing = true,
  additionalButtons = null,
}) => {
  
  const [loading, setloading] = useState("");
  const [checkApprovalStatus , setCheckApprovalStatus ] = useState([]);

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
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {additionalButtons}
          {readOnly && onEdit && (
            <Button variant="contained" color="primary" onClick={onEdit}>
              Edit
            </Button>
          )}
          {!readOnly && (
            <>
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
              {isEditing && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onSave}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : "Save"}
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>
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
