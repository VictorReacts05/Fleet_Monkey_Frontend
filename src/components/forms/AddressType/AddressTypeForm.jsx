import React, { useState, useEffect } from 'react';
import FormInput from '../../Common/FormInput';
import FormPage from '../../Common/FormPage';
import { createAddressType, updateAddressType, getAddressTypeById } from './AddressTypeAPI';
import { toast } from 'react-toastify';

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

  const validateForm = () => {
    let isValid = true;
    const newErrors = { addressType: '' };

    if (!formData.addressType.trim()) {
      newErrors.addressType = 'Address type name is required';
      isValid = false;
    } else if (formData.addressType.length < 2) {
      newErrors.addressType = 'Address type name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.addressType)) {
      newErrors.addressType = 'Address type name can only contain letters, spaces, and hyphens';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    if(e){
    e.preventDefault();
    }
    setIsSubmitted(true);

    if (validateForm()) {
      try {
        setLoading(true);
        
        const addressTypeData = {
          AddressType: formData.addressType
        };
        
        if (addressTypeId) {
          // Update existing address type
          await updateAddressType(addressTypeId, addressTypeData);
          toast.success('Address type updated successfully');
        } else {
          // Create new address type
          await createAddressType(addressTypeData);
          toast.success('Address type created successfully');
        }
        
        if (onSave) onSave();
        if (onClose) onClose();
      } catch (error) {
        console.error('Error saving address type:', error);
        toast.error(`Failed to save address type: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (isSubmitted) {
      validateForm();
    }
  };

  return (
    <FormPage
      title={addressTypeId ? 'Edit Address Type' : 'Add Address Type'}
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