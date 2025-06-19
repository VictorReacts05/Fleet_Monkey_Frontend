import React, { useState, useEffect } from "react";
import { Grid, FormControlLabel, Checkbox } from "@mui/material";
import { createRole, updateRole, getRoleById } from "./RolesAPI";
import { toast } from "react-toastify";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";
import { WidthFull } from "@mui/icons-material";

const RolesForm = ({ roleId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    RoleName: "",
    ReadAccess: false,
    WriteAccess: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (roleId) {
      loadRole();
    }
  }, [roleId]);

  const loadRole = async () => {
    try {
      setLoading(true);
      const data = await getRoleById(roleId);
      
      setFormData({
        RoleName: data.RoleName || "",
        ReadAccess: data.ReadAccess || false,
        WriteAccess: data.WriteAccess || false,
        RowVersionColumn: data.RowVersionColumn
      });
    } catch (error) {
      toast.error("Failed to load role details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.RoleName) {
      newErrors.RoleName = "Role Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setLoading(true);
      
      if (roleId) {
        await updateRole(roleId, formData);
        toast.success("Role updated successfully");
      } else {
        await createRole(formData);
        toast.success("Role created successfully");
      }
      
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("API Error:", error);
      toast.error(
        `Failed to ${roleId ? "update" : "create"} role: ` + 
        (error.error || error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <FormPage
      // title={roleId ? "Edit Role" : "Create Role"}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sx={{ width: "100%" }}>
          <FormInput
            name="RoleName"
            label="Role Name"
            value={formData.RoleName}
            onChange={handleChange}
            error={!!errors.RoleName}
            helperText={errors.RoleName}
            required
            fullWidth
          />
        </Grid>
        {/* <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                name="ReadAccess"
                checked={formData.ReadAccess}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Read Access"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                name="WriteAccess"
                checked={formData.WriteAccess}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Write Access"
          />
        </Grid>*/}
      </Grid>
    </FormPage>
  );
};

export default RolesForm;