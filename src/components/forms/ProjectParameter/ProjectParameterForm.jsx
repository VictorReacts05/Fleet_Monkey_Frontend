import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import { getParameterById } from "./projectParameterStorage";

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
    let isValid = true;
    const newErrors = { ...errors };

    // User validation
    if (!formData.userId) {
      newErrors.userId = "User selection is required";
      isValid = false;
    }

    // Parameter Name validation
    if (!formData.parameterName.trim()) {
      newErrors.parameterName = "Parameter name is required";
      isValid = false;
    } else if (!/^[A-Za-z0-9\s-]{2,}$/.test(formData.parameterName)) {
      newErrors.parameterName =
        "Parameter name must be at least 2 characters (alphanumeric)";
      isValid = false;
    } else if (formData.parameterName.length > 50) {
      newErrors.parameterName = "Parameter name cannot exceed 50 characters";
      isValid = false;
    }

    // Parameter Value validation
    if (!formData.parameterValue.trim()) {
      newErrors.parameterValue = "Parameter value is required";
      isValid = false;
    } else if (formData.parameterValue.length > 100) {
      newErrors.parameterValue = "Parameter value cannot exceed 100 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) {
      return;
    }

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
    } else {
      const newParameter = {
        ...formData,
        id: Date.now(),
      };
      localStorage.setItem(
        "projectParameters",
        JSON.stringify([...parameters, newParameter])
      );
    }

    onSave();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <FormPage
      title={parameterId ? "Edit Project Parameter" : "Add Project Parameter"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormSelect
        label="Select User"
        name="userId"
        value={formData.userId}
        onChange={handleChange}
        options={users}
        error={isSubmitted && errors.userId}
        helperText={isSubmitted && errors.userId}
      />
      <FormInput
        label="Parameter Name"
        name="parameterName"
        value={formData.parameterName}
        onChange={handleChange}
        error={isSubmitted && errors.parameterName}
        helperText={isSubmitted && errors.parameterName}
      />
      <FormInput
        label="Parameter Value"
        name="parameterValue"
        value={formData.parameterValue}
        onChange={handleChange}
        error={isSubmitted && errors.parameterValue}
        helperText={isSubmitted && errors.parameterValue}
      />
    </FormPage>
  );
};

export default ProjectParameterForm;
