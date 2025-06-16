import React, { useState, useEffect } from "react";
import { Grid, Box, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { createUOM, updateUOM, getUOMById } from "./uomapi";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";

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
    UOM: "",
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
      setLoading(true);
      const response = await getUOMById(uomId);
      console.log("Load UOM response:", response);

      // Handle different response structures
      const data =
        response.data && response.data.uom ? response.data : response;

      setFormData({
        UOM: data.uom || "",
      });
    } catch (error) {
      console.error("Failed to load UOM:", error);
      toast.error(
        "Failed to load UOM: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.UOM || !formData.UOM.trim()) {
      newErrors.UOM = "UOM is required";
    } else if (formData.UOM.length > 20) {
      newErrors.UOM = "UOM must be 20 characters or less";
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
        UOM: formData.UOM,
      };

      console.log("Submitting UOM data:", apiData);

      if (uomId) {
        await updateUOM(uomId, apiData);
        toast.success("UOM updated successfully");
      } else {
        await createUOM(apiData);
        toast.success("UOM created successfully");
      }

      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving UOM:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message &&
        error.response.data.message.includes("UNIQUE KEY constraint")
      ) {
        toast.error(
          "This Unit of Measurement already exists. Please use a different name."
        );
      } else {
        toast.error(
          `Failed to ${uomId ? "update" : "create"} UOM: ${
            error.response?.data?.message || error.message
          }`
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
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
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
                name="UOM"
                label="Unit of Measurement"
                value={formData.UOM || ""}
                onChange={handleChange}
                error={!!errors.UOM}
                helperText={errors.UOM}
                disabled={!isEditing}
                fullWidth
              />
            ) : (
              <ReadOnlyField label="Unit of Measurement" value={formData.UOM} />
            )}
          </Grid>
        </Grid>
      )}
    </FormPage>
  );
};

export default UOMForm;
