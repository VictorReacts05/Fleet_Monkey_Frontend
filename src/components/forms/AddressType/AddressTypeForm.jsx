import React, { useState, useEffect } from 'react';
import FormInput from '../../Common/FormInput';
import FormPage from '../../Common/FormPage';
import { getAddressTypeById } from './addressTypeStorage';

const AddressTypeForm = ({ addressTypeId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: ''
  });

  const [errors, setErrors] = useState({
    name: ''
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (addressTypeId) {
      const addressType = getAddressTypeById(addressTypeId);
      if (addressType) {
        setFormData(addressType);
      }
    }
  }, [addressTypeId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Address type name is required';
      setMessage('Address type name is required');
      isValid = false;
    } else if (formData.name.length < 2) {
      newErrors.name = 'Address type name must be at least 2 characters';
      setMessage('Address type name must be at least 2 characters');
      isValid = false;
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.name)) {
      newErrors.name = 'Address type name can only contain letters, spaces, and hyphens';
      setMessage('Address type name can only contain letters, spaces, and hyphens');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const addressTypes = JSON.parse(localStorage.getItem('addressTypes') || '[]');
    
    if (addressTypeId) {
      const updatedAddressTypes = addressTypes.map(addressType =>
        addressType.id === addressTypeId ? { ...formData, id: addressTypeId } : addressType
      );
      localStorage.setItem('addressTypes', JSON.stringify(updatedAddressTypes));
      setMessage('Address type updated successfully');
    } else {
      const newAddressType = {
        ...formData,
        id: Date.now()
      };
      localStorage.setItem('addressTypes', JSON.stringify([...addressTypes, newAddressType]));
      setMessage('Address type created successfully');
    }
    
    onSave();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear messages when user types
    setMessage('');
    if (errors[name]) {
      const newErrors = { ...errors };
      if (value.trim()) {
        newErrors[name] = '';
      }
      setErrors(newErrors);
    }
  };

  return (
    <FormPage
      title={addressTypeId ? 'Edit Address Type' : 'Add Address Type'}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormInput
        label="Address Type Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
      />
      {message && (
        <div style={{ 
          marginTop: '10px',
          color: errors.name ? '#d32f2f' : '#2e7d32',
          fontSize: '0.875rem'
        }}>
          {message}
        </div>
      )}
    </FormPage>
  );
};

export default AddressTypeForm;