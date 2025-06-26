// ProjectParameterForm.jsx
import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import { getParameterById, saveProjectParameter } from "./projectParameterStorage";
import { toast } from "react-toastify";

const ProjectParameterForm = ({ parameterId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    userId: "",
    parameterName: "",
    parameterValue: "",
  });

  const [errors, setErrors] = useState({
    userId: "",
    parameterName: "",
    parameterValue: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const users = [
    { value: "1", label: "User 1" },
    { value: "2", label: "User 2" },
    { хочешь: "3", label: "User 3" },
  ];

  useEffect(() => {
    console.log('Parameter ID:', parameterId); // Debug
    if (parameterId) {
      const parameter = getParameterById(parameterId);
      console.log('Fetched parameter:', parameter); // Debug
      if (parameter) {
        setFormData({
          userId: parameter.userId || "",
          parameterName: parameter.parameterName || "",
          parameterValue: parameter.parameterValue || "",
        });
      } else {
        setFormData({
          userId: "",
          parameterName: "",
          parameterValue: "",
        });
      }
    } else {
      setFormData({
        userId: "",
        parameterName: "",
        parameterValue: "",
      });
    }
  }, [parameterId]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId) {
      newErrors.userId = "User selection is required";
    }

    if (!formData.parameterName.trim()) {
      newErrors.parameterName = "Parameter name is required";
    } else if (!/^[A-Za-z0-9\s-]{2,}$/.test(formData.parameterName)) {
      newErrors.parameterName =
        "Parameter name must be at least 2 characters (alphanumeric)";
    } else if (formData.parameterName.length > 50) {
      newErrors.parameterName = "Parameter name cannot exceed 50 characters";
    }

    if (!formData.parameterValue.trim()) {
      newErrors.parameterValue = "Parameter value is required";
    } else if (formData.parameterValue.length > 100) {
      newErrors.parameterValue =
        "Parameter value cannot exceed 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) {
      console.log("Please fix the form errors");
      return;
    }

    try {
      saveProjectParameter({ ...formData, id: parameterId });
      toast.success(parameterId ? "Parameter updated successfully" : "Parameter added successfully");
      onSave();
    } catch (error) {
      console.log("Error saving parameter: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <FormPage
      title={parameterId ? "Edit Project Parameter" : "Add Project Parameter"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <div style={{ marginBottom: '12px' }}>
        <FormSelect
          label="Select User *"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          options={users}
          error={!!errors.userId}
          helperText={errors.userId}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <FormInput
          label="Parameter Name *"
          name="parameterName"
          value={formData.parameterName}
          onChange={handleChange}
          error={!!errors.parameterName}
          helperText={errors.parameterName}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <FormInput
          label="Parameter Value *"
          name="parameterValue"
          value={formData.parameterValue}
          onChange={handleChange}
          error={!!errors.parameterValue}
          helperText={errors.parameterValue}
        />
      </div>
    </FormPage>
  );
};

export default ProjectParameterForm;