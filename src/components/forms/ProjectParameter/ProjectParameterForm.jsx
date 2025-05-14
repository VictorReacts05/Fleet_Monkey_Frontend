import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import { getParameterById } from "./projectParameterStorage";
import { toast } from "react-toastify";
import { showToast } from "../../toastNotification";

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
    { value: "3", label: "User 3" },
  ];

  useEffect(() => {
    if (parameterId) {
      const parameter = getParameterById(parameterId);
      if (parameter) {
        setFormData(parameter);
      }
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
    console.log("Form submitted with data:", formData);
    setIsSubmitted(true);

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      const parameters = JSON.parse(
        localStorage.getItem("projectParameters") || "[]"
      );

      if (parameterId) {
        const updatedParameters = parameters.map((param) =>
          param.id === parameterId ? { ...formData, id: parameterId } : param
        );
        localStorage.setItem(
          "projectParameters",
          JSON.stringify(updatedParameters)
        );
        // toast.success("Parameter updated successfully");
        showToast("Parameter updated successfully", "success");
      } else {
        const newParameter = {
          ...formData,
          id: Date.now(),
        };
        localStorage.setItem(
          "projectParameters",
          JSON.stringify([...parameters, newParameter])
        );
        // toast.success("Parameter added successfully");
        showToast("Parameter added successfully", "success");
      }

      onSave();
    } catch (error) {
      toast.error("Error saving parameter: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user edits
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
      <FormSelect
        label="Select User *"
        name="userId"
        value={formData.userId}
        onChange={handleChange}
        options={users}
        error={!!errors.userId}
        helperText={errors.userId}
      />
      <FormInput
        label="Parameter Name *"
        name="parameterName"
        value={formData.parameterName}
        onChange={handleChange}
        error={!!errors.parameterName}
        helperText={errors.parameterName}
      />
      <FormInput
        label="Parameter Value *"
        name="parameterValue"
        value={formData.parameterValue}
        onChange={handleChange}
        error={!!errors.parameterValue}
        helperText={errors.parameterValue}
      />
    </FormPage>
  );
};

export default ProjectParameterForm;
