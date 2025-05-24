import React, { useState, useEffect } from "react";
import { Grid, FormControlLabel, Checkbox } from "@mui/material";
import { 
  createFormRole, 
  updateFormRole, 
  getFormRoleById,
  fetchForms,
  fetchRoles
} from "./FormRoleAPI";
import { toast } from "react-toastify";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";
import FormSelect from "../../Common/FormSelect";

const FormRoleForm = ({ formRoleID, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    FormID: "",
    RoleID: "",
    ReadOnly: false,
    Write: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [forms, setForms] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    loadDropdownData();
    if (formRoleID) {
      loadFormRole();
    }
  }, [formRoleID]);

  const loadDropdownData = async () => {
    try {
      setLoading(true);
      
      // Load forms for dropdown
      const formsResponse = await fetchForms();
      const formsData = formsResponse.data || [];
      setForms(formsData.map(form => ({
        value: form.FormID,
        label: form.FormName
      })));
      
      // Load roles for dropdown
      const rolesResponse = await fetchRoles();
      const rolesData = rolesResponse.data || [];
      setRoles(rolesData.map(role => ({
        value: role.RoleID,
        label: role.RoleName
      })));
    } catch (error) {
      toast.error("Failed to load dropdown data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFormRole = async () => {
    try {
      setLoading(true);
      const data = await getFormRoleById(formRoleID);
      
      setFormData({
        FormID: data.FormID || "",
        RoleID: data.RoleID || "",
        ReadOnly: data.ReadOnly || false,
        Write: data.Write || false
      });
    } catch (error) {
      toast.error("Failed to load form role details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.FormID) {
      newErrors.FormID = "Form is required";
    }
    
    if (!formData.RoleID) {
      newErrors.RoleID = "Role is required";
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
      
      if (formRoleID) {
        await updateFormRole(formRoleID, formData);
        toast.success("Form Role updated successfully");
      } else {
        await createFormRole(formData);
        toast.success("Form Role created successfully");
      }
      
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("API Error:", error);
      toast.error(
        `Failed to ${formRoleID ? "update" : "create"} form role: ` + 
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
      title={formRoleID ? "Edit Form Role" : "Create Form Role"}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormSelect
            name="FormID"
            label="Form"
            value={formData.FormID}
            onChange={handleChange}
            options={forms}
            error={!!errors.FormID}
            helperText={errors.FormID}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormSelect
            name="RoleID"
            label="Role"
            value={formData.RoleID}
            onChange={handleChange}
            options={roles}
            error={!!errors.RoleID}
            helperText={errors.RoleID}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                name="ReadOnly"
                checked={formData.ReadOnly}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Read Only"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                name="Write"
                checked={formData.Write}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Write"
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default FormRoleForm;