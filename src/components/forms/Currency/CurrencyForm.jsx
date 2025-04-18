import React, { useState, useEffect } from 'react';
import FormInput from '../../Common/FormInput';
import FormPage from '../../Common/FormPage';
import { createCurrency, updateCurrency, getCurrencyById } from './CurrencyAPI';
import { toast } from 'react-toastify';

const CurrencyForm = ({ currencyId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    currencyName: ''
  });

  const [errors, setErrors] = useState({
    currencyName: ''
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (currencyId) {
      loadCurrency();
    }
  }, [currencyId]);

  const loadCurrency = async () => {
    try {
      setLoading(true);
      const response = await getCurrencyById(currencyId);
      setFormData({
        currencyName: response.CurrencyName || ''
      });
    } catch (error) {
      console.error('Error loading currency:', error);
      toast.error('Failed to load currency details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { currencyName: '' };

    if (!formData.currencyName.trim()) {
      newErrors.currencyName = 'Currency name is required';
      isValid = false;
    } else if (formData.currencyName.length < 2) {
      newErrors.currencyName = 'Currency name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.currencyName)) {
      newErrors.currencyName = 'Currency name can only contain letters, spaces, and hyphens';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (validateForm()) {
      try {
        setLoading(true);
        
        const currencyData = {
          CurrencyName: formData.currencyName
        };
        
        if (currencyId) {
          // Update existing currency
          await updateCurrency(currencyId, currencyData);
          toast.success('Currency updated successfully');
        } else {
          // Create new currency
          await createCurrency(currencyData);
          toast.success('Currency created successfully');
        }
        
        if (onSave) onSave();
        if (onClose) onClose();
      } catch (error) {
        console.error('Error saving currency:', error);
        toast.error(`Failed to save currency: ${error.message || 'Unknown error'}`);
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
      title={currencyId ? 'Edit Currency' : 'Add Currency'}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <FormInput
        label="Currency Name"
        name="currencyName"
        value={formData.currencyName}
        onChange={handleChange}
        error={errors.currencyName}
        required
      />
    </FormPage>
  );
};

export default CurrencyForm;
