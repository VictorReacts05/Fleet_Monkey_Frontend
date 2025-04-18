import React, { useState, useEffect } from 'react';
import FormInput from '../../Common/FormInput';
import FormPage from '../../Common/FormPage';
import { createCurrency, updateCurrency, getCurrencyById } from './CurrencyAPI';
import { toast } from 'react-toastify';

const CurrencyForm = ({ currencyId, onSave, onClose }) => {
  // Initialize with empty strings to maintain controlled inputs
  const [formData, setFormData] = useState({
    CurrencyName: '',
    RowVersionColumn: ''
  });

  // Match error state key casing
  const [errors, setErrors] = useState({
    CurrencyName: ''
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const loadCurrencyData = async () => {
      try {
        setLoading(true);
        // console.log('Fetching currency with ID:', currencyId);
        const response = await getCurrencyById(currencyId);
        // console.log('Raw API response:', response);
        // console.log('Response type:', typeof response);
        
        // Handle potential casing differences
        setFormData({
          CurrencyName: response?.CurrencyName || response?.currencyName || '',
          RowVersionColumn: response?.RowVersionColumn || response?.rowVersionColumn || ''
        });
      } catch (error) {
        console.error('Error loading currency:', error);
        toast.error('Failed to load currency details');
      } finally {
        setLoading(false);
      }
    };

    if (currencyId) {
      loadCurrencyData();
    }
  }, [currencyId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { CurrencyName: '' }; // Fixed casing

    if (!formData.CurrencyName.trim()) { // Use correct casing
      newErrors.CurrencyName = 'Currency name is required';
      isValid = false;
    } else if (formData.CurrencyName.length < 2) {
      newErrors.CurrencyName = 'Currency name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.CurrencyName)) {
      newErrors.CurrencyName = 'Currency name can only contain letters, spaces, and hyphens';
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
          CurrencyName: formData.CurrencyName, // Fix casing here
          RowVersionColumn: formData.RowVersionColumn
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
        name="CurrencyName" // Match state key casing
        value={formData.CurrencyName}
        onChange={handleChange}
        error={errors.CurrencyName}
        required
      />
    </FormPage>
  );
};

export default CurrencyForm;
