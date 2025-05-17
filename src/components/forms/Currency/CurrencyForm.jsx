import React, { useState, useEffect } from 'react';
import FormInput from '../../Common/FormInput';
import FormPage from '../../Common/FormPage';
import {
  createCurrency,
  updateCurrency,
  getCurrencyById,
  fetchCurrencies,
} from "./CurrencyAPI";
import { toast } from 'react-toastify';
import { showToast } from '../../toastNotification';

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
        const response = await getCurrencyById(currencyId);
        console.log('Currency response:', response);
        // Handle potential casing differences
        const currency = response.data; // get nested data
        setFormData({
        CurrencyName: currency.CurrencyName || '',
        RowVersionColumn: currency.RowVersionColumn || ''
        });
      } catch (error) {
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

  // Fix: Make sure handleSubmit properly receives the event parameter
  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }
    
    // Set submitted state to trigger validation on future changes
    setIsSubmitted(true);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem("user")) || {};
      
      // Transform data to match backend expectations - use capital letters for field names
      const transformedData = {
        CurrencyName: formData.CurrencyName,
        CreatedByID: user.personId || 1, // Use user's personId or default to 1
      };
      
      if (formData.RowVersionColumn) {
        transformedData.RowVersionColumn = formData.RowVersionColumn;
      }
      
      if (currencyId) {
        transformedData.CurrencyID = currencyId;
        await updateCurrency(currencyId, transformedData);
        toast.success('Currency updated successfully');
      } else {
        await createCurrency(transformedData);
        toast.success('Currency created successfully');

      }
      
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving currency:', error);
      toast.error(`Error saving currency: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
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
