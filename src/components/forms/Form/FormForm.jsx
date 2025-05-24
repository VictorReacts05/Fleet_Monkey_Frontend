import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import { 
  createForm, 
  updateForm, 
  getFormById
} from "./FormAPI";
import { toast } from "react-toastify";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";

const FormForm = ({ formID, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    FormName: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formID) {
      loadForm();
    }
  }, [formID]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const data = await getFormById(formID);
      
      setFormData({
        FormName: data.FormName || "",
        RowVersionColumn: data.RowVersionColumn
      });
    } catch (error) {
      toast.error("Failed to load form details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.FormName) {
      newErrors.FormName = "Form Name is required";
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
      
      if (formID) {
        await updateForm(formID, formData);
        toast.success("Form updated successfully");
      } else {
        await createForm(formData);
        toast.success("Form created successfully");
      }
      
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("API Error:", error);
      toast.error(
        `Failed to ${formID ? "update" : "create"} form: ` + 
        (error.error || error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <FormPage
      title={formID ? "Edit Form" : "Create Form"}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormInput
            name="FormName"
            label="Form Name"
            value={formData.FormName}
            onChange={handleChange}
            error={!!errors.FormName}
            helperText={errors.FormName}
            required
            fullWidth
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default FormForm;