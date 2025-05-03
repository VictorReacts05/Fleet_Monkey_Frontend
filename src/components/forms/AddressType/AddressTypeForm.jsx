import React, { useState, useEffect } from 'react';
import FormInput from '../../Common/FormInput';
import FormPage from '../../Common/FormPage';
import { createAddressType, updateAddressType, getAddressTypeById } from './AddressTypeAPI';
import { toast } from 'react-toastify';
import { showToast } from '../../toastNotification';

const AddressTypeForm = ({ addressTypeId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    addressType: ''
  });

  const [errors, setErrors] = useState({
    addressType: ''
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (addressTypeId) {
      loadAddressType();
    }
  }, [addressTypeId]);

  const loadAddressType = async () => {
    try {
      setLoading(true);
      const response = await getAddressTypeById(addressTypeId);
      setFormData({
        addressType: response.AddressType || ''
      });
    } catch (error) {
      console.error('Error loading address type:', error);
      toast.error('Failed to load address type details');
    } finally {
      setLoading(false);
    }
  };

  const getValidationError = (field, value) => {
    switch (field) {
      case 'addressType':
        if (!value.trim()) {
          return 'Address type name is required';
        } else if (value.length < 2) {
          return 'Address type name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s-]+$/.test(value)) {
          return 'Address type name can only contain letters, spaces, and hyphens';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {
      addressType: getValidationError('addressType', formData.addressType)
    };

    setErrors(newErrors);
    return !newErrors.addressType;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitted(true);

    if (validateForm()) {
      try {
        setLoading(true);

        const addressTypeData = {
          AddressType: formData.addressType
        };

        if (addressTypeId) {
          await updateAddressType(addressTypeId, addressTypeData);
          showToast("Address type updated successfully", "success");
        } else {
          await createAddressType(addressTypeData);
          showToast("Address type created successfully", "success");
        }

        if (onSave) onSave();
        if (onClose) onClose();
      } catch (error) {
        showToast(error.message, "error");
        console.error('Error saving address type:', error);
        toast.error(`Failed to save address type: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (isSubmitted) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: getValidationError(name, value)
      }));
    }
  };

  return (
    <FormPage
      title={''} 
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <FormInput
        label="Address Type Name"
        name="addressType"
        value={formData.addressType}
        onChange={handleChange}
        error={errors.addressType}
        required
      />
    </FormPage>
  );
};

export default AddressTypeForm;
