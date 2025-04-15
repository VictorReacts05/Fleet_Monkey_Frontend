import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";
import { getCertificationById } from "./certificationStorage";

const CertificationForm = ({ certificationId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    certificationName: "",
  });

  const [errors, setErrors] = useState({
    certificationName: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (certificationId) {
      const certification = getCertificationById(Number(certificationId)); // Ensure ID is a number
      if (certification) {
        setFormData({
          certificationName: certification.certificationName || "",
        });
      } else {
        console.warn(`Certification with ID ${certificationId} not found`);
      }
    }
  }, [certificationId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { certificationName: "" };

    if (!formData.certificationName.trim()) {
      newErrors.certificationName = "Certification name is required";
      isValid = false;
    } else if (formData.certificationName.length < 2) {
      newErrors.certificationName =
        "Certification name must be at least 2 characters";
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(formData.certificationName)) {
      newErrors.certificationName =
        "Only letters, numbers, spaces and hyphens are allowed";
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

    const certifications = JSON.parse(
      localStorage.getItem("certifications") || "[]"
    );

    if (certificationId) {
      const updatedCertifications = certifications.map((cert) =>
        cert.id === Number(certificationId)
          ? { ...formData, id: Number(certificationId) }
          : cert
      );
      localStorage.setItem(
        "certifications",
        JSON.stringify(updatedCertifications)
      );
    } else {
      const newCertification = {
        ...formData,
        id: Date.now(),
      };
      localStorage.setItem(
        "certifications",
        JSON.stringify([...certifications, newCertification])
      );
    }

    setMessage(
      certificationId
        ? "Certification updated successfully"
        : "Certification created successfully"
    );
    onSave();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (isSubmitted) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  return (
    <FormPage
      title={certificationId ? "Edit Certification" : "Add Certification"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormInput
        label="Certification Name *"
        name="certificationName"
        value={formData.certificationName}
        onChange={handleChange}
        error={isSubmitted && errors.certificationName}
        helperText={isSubmitted && errors.certificationName}
      />
      {isSubmitted &&
        !Object.values(errors).some((error) => error) &&
        message && (
          <div
            style={{
              marginTop: "10px",
              color: "#2e7d32",
              fontSize: "0.875rem",
            }}
          >
            {message}
          </div>
        )}
    </FormPage>
  );
};

export default CertificationForm;
