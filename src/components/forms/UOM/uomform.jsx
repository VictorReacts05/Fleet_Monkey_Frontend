import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Box, 
  Typography 
} from '@mui/material';
import { toast } from 'react-toastify';
import { createUOM, updateUOM, getUOMById } from './uomapi';
import FormInput from '../../Common/FormInput';
import FormPage from '../../Common/FormPage';

const ReadOnlyField = ({ label, value }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="textSecondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5 }}>
        {value || "-"}
      </Typography>
    </Box>
  );
};

const UOMForm = ({ uomId, onClose, onSave, readOnly = false }) => {
  const [formData, setFormData] = useState({
    uom: '',
    createdByID: '',
    CreatedDateTime: null,
    IsDeleted: false,
    DeletedDateTime: null,
    DeletedByID: '',
    RowVersionColumn: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!readOnly);

  useEffect(() => {
    if (uomId) {
      loadUOM();
    }
  }, [uomId]);

  const loadUOM = async () => {
    try {
      const response = await getUOMById(uomId);
      const data = response.data;

      const displayValue = (value) =>
        value === null || value === undefined ? "-" : value;

      const formattedData = {
        ...formData,
        uom: displayValue(data.uom),
        createdByID: displayValue(data.createdByID),
        CreatedDateTime: data.CreatedDateTime
          ? new Date(data.CreatedDateTime)
          : null,
        IsDeleted: data.IsDeleted || false,
        DeletedDateTime: data.DeletedDateTime
          ? new Date(data.DeletedDateTime)
          : null,
        DeletedByID: displayValue(data.DeletedByID),
        RowVersionColumn: displayValue(data.RowVersionColumn),
      };

      setFormData(formattedData);
    } catch (error) {
      console.error("Failed to load UOM:", error);
      toast.error("Failed to load UOM: " + error.message);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.uom || !formData.uom.trim()) {
      newErrors.uom = "UOM is required";
    } else if (formData.uom.length > 20) {
      newErrors.uom = "UOM must be 20 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setLoading(true);
      const apiData = {
        UOM: formData.uom === "-" ? null : formData.uom,
        CreatedByID: formData.createdByID === "-" ? null : formData.createdByID,
        DeletedByID: formData.DeletedByID === "-" ? null : formData.DeletedByID,
        RowVersionColumn:
          formData.RowVersionColumn === "-" ? null : formData.RowVersionColumn,
        CreatedDateTime: formData.CreatedDateTime
          ? formData.CreatedDateTime.toISOString()
          : null,
        DeletedDateTime: formData.DeletedDateTime
          ? formData.DeletedDateTime.toISOString()
          : null,
      };

      if (uomId) {
        // Update existing UOM
        await updateUOM(uomId, apiData);
        toast.success("UOM updated successfully");
      } else {
        // Create new UOM
        await createUOM(apiData);
        toast.success("UOM created successfully");
      }

      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      
      // Check for duplicate key error
      if (error.response && error.response.data && error.response.data.message && 
          error.response.data.message.includes("UNIQUE KEY constraint")) {
        toast.error(`This Unit of Measurement already exists. Please use a different name.`);
      } else {
        toast.error(
          `Failed to ${uomId ? "update" : "create"} UOM: ` +
            (error.message || "Unknown error")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <FormPage
      title={
        uomId
          ? isEditing
            ? "Edit Unit of Measurement"
            : "View Unit of Measurement"
          : "Create Unit of Measurement"
      }
      onCancel={onClose}
      onSubmit={isEditing ? handleSubmit : null}
      loading={loading}
      readOnly={!isEditing}
      onEdit={uomId && !isEditing ? toggleEdit : null}
    >
      <Grid
        container
        spacing={1}
        sx={{
          width: "100%",
          margin: 0,
          overflow: "hidden",
        }}
      >
        <Grid item xs={12} md={6} sx={{ width: "100%" }}>
          {isEditing ? (
            <FormInput
              name="uom"
              label="Unit of Measurement"
              value={formData.uom || ""}
              onChange={handleChange}
              error={!!errors.uom}
              helperText={errors.uom}
              disabled={!isEditing}
              fullWidth
            />
          ) : (
            <ReadOnlyField label="Unit of Measurement" value={formData.uom} />
          )}
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default UOMForm;