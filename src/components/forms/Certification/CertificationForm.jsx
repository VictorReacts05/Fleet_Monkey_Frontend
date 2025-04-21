import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";
import { createCertification, updateCertification, getCertificationById } from "./CertificationAPI";
import { toast } from "react-toastify";

const CertificationForm = ({ certificationId, onSave, onClose }) => {
  const [formData, setFormData] = useState({ 
    certificationName: "",
    rowVersionColumn: null 
  });

  useEffect(() => {
    const loadCertification = async () => {
      if (certificationId) {
        try {
          setLoading(true);
          const response = await getCertificationById(certificationId);
          
          // Access nested data property from response
          const certificationData = response.data || {};
          
          setFormData({
            certificationName: certificationData.CertificationName || '',
            rowVersionColumn: certificationData.RowVersionColumn || null
          });
        } catch (error) {
          console.error('Error loading certification:', error);
          toast.error('Failed to load certification');
        } finally {
          setLoading(false);
        }
      }
    };
    loadCertification();
  }, [certificationId]);
  const [errors, setErrors] = useState({ certificationName: "" });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.certificationName.trim()) {
      newErrors.certificationName = "Certification name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user')) || {};

      if (certificationId) {
        await updateCertification(certificationId, {
          CertificationName: formData.certificationName,
          RowVersionColumn: formData.rowVersionColumn
        });
        toast.success('Certification updated successfully');
      } else {
        await createCertification({
          CertificationName: formData.certificationName,
          CreatedByID: user.personId || 1 // Fallback to 1 if user not available
        });
        toast.success('Certification created successfully');
      }
      
      onSave();
      onClose();
    } catch (error) {
      toast.error(`Failed to ${certificationId ? 'update' : 'create'} certification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (isSubmitted) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <FormPage
      title={certificationId ? "Edit Certification" : "Add Certification"}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <FormInput
        label="Certification Name *"
        name="certificationName"
        value={formData.certificationName}
        onChange={handleChange}
        error={errors.certificationName}
        helperText={errors.certificationName}
      />
    </FormPage>
  );
};

export default CertificationForm;
