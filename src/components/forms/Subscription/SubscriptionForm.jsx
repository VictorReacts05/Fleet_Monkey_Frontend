import React, { useState, useEffect } from 'react';
import FormInput from '../../Common/FormInput';
import FormSelect from '../../Common/FormSelect';
import FormPage from '../../Common/FormPage';
import { getSubscriptionById, saveSubscription } from './subscriptionStorage';
import { showToast } from '../../toastNotification';
import { toast } from 'react-toastify';

const SubscriptionForm = ({ subscriptionId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    fees: '',
    billingType: '',
  });

  const [errors, setErrors] = useState({
    planName: '',
    description: '',
    fees: '',
    billingType: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const billingTypes = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  useEffect(() => {
    console.log('Subscription ID:', subscriptionId);
    if (subscriptionId) {
      const subscription = getSubscriptionById(subscriptionId);
      console.log('Fetched subscription:', subscription);
      if (subscription) {
        setFormData({
          planName: subscription.planName || '',
          description: subscription.description || '',
          fees: subscription.fees.toString() || '',
          billingType: subscription.billingType || '',
        });
      } else {
        console.error('Subscription not found for ID:', subscriptionId);
        setFormData({
          planName: '',
          description: '',
          fees: '',
          billingType: '',
        });
      }
    } else {
      setFormData({
        planName: '',
        description: '',
        fees: '',
        billingType: '',
      });
    }
  }, [subscriptionId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.planName.trim()) {
      newErrors.planName = 'Plan name is required';
      isValid = false;
    } else if (!/^[A-Za-z0-9\s-]{2,}$/.test(formData.planName)) {
      newErrors.planName = 'Plan name must be at least 2 characters (alphanumeric)';
      isValid = false;
    } else if (formData.planName.length > 50) {
      newErrors.planName = 'Plan name cannot exceed 50 characters';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
      isValid = false;
    } else if (formData.description.length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
      isValid = false;
    }

    if (!formData.fees) {
      newErrors.fees = 'Fees are required';
      isValid = false;
    } else {
      const feesNum = parseFloat(formData.fees);
      if (isNaN(feesNum)) {
        newErrors.fees = 'Fees must be a valid number';
        isValid = false;
      } else if (feesNum <= 0) {
        newErrors.fees = 'Fees must be greater than 0';
        isValid = false;
      } else if (feesNum > 1000000) {
        newErrors.fees = 'Fees cannot exceed 1,000,000';
        isValid = false;
      }
    }

    if (!formData.billingType) {
      newErrors.billingType = 'Billing type is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) {
      return;
    }

    try {
      const subscriptionToSave = {
        ...formData,
        id: subscriptionId,
        fees: parseFloat(formData.fees),
      };
      saveSubscription(subscriptionToSave);
      toast.success('Subscription saved successfully');
      onSave();
    } catch (error) {
      toast.error('Error saving subscription: ' + error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <FormPage
      title={subscriptionId ? 'Edit Subscription' : 'Add Subscription'}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <div style={{ marginBottom: '16px' }}>
        <FormInput
          label="Subscription Plan Name"
          name="planName"
          value={formData.planName}
          onChange={handleChange}
          error={isSubmitted && errors.planName}
          helperText={isSubmitted && errors.planName}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <FormInput
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={isSubmitted && errors.description}
          helperText={isSubmitted && errors.description}
        />
      </div>
      <div style={{ marginBottom: '14px' }}>
        <FormInput
          label="Fees"
          name="fees"
          type="number"
          value={formData.fees}
          onChange={handleChange}
          error={isSubmitted && errors.fees}
          helperText={isSubmitted && errors.fees}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <FormSelect
          label="Select Billing"
          name="billingType"
          value={formData.billingType}
          onChange={handleChange}
          options={billingTypes}
          error={isSubmitted && errors.billingType}
          helperText={isSubmitted && errors.billingType}
        />
      </div>
    </FormPage>
  );
};

export default SubscriptionForm;