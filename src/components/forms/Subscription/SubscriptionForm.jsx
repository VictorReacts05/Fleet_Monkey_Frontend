import React, { useState, useEffect } from 'react';
import FormInput from '../../Common/FormInput';
import FormSelect from '../../Common/FormSelect';
import FormPage from '../../Common/FormPage';
import { getSubscriptionById } from './subscriptionStorage';
import { showToast } from '../../toastNotification';

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
    if (subscriptionId) {
      const subscription = getSubscriptionById(subscriptionId);
      if (subscription) {
        setFormData(subscription);
      }
    }
  }, [subscriptionId]); // Corrected dependency array

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Plan Name validation
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

    // Description validation
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

    // Fees validation
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

    // Billing Type validation
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

    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');

    if (subscriptionId) {
      const updatedSubscriptions = subscriptions.map(sub =>
        sub.id === subscriptionId ? { ...formData, id: subscriptionId } : sub
      );
      localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));
      showToast('Subscription updated successfully', 'success');
    } else {
      const newSubscription = {
        ...formData,
        id: Date.now(),
      };
      localStorage.setItem('subscriptions', JSON.stringify([...subscriptions, newSubscription]));
      showToast('Subscription added successfully', 'success');
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
      title={subscriptionId ? 'Edit Subscription' : 'Add Subscription'}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormInput
        label="Subscription Plan Name"
        name="planName"
        value={formData.planName}
        onChange={handleChange}
        error={isSubmitted && errors.planName}
        helperText={isSubmitted && errors.planName}
      />
      <FormInput
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={isSubmitted && errors.description}
        helperText={isSubmitted && errors.description}
      />
      <FormInput
        label="Fees"
        name="fees"
        type="number"
        value={formData.fees}
        onChange={handleChange}
        error={isSubmitted && errors.fees}
        helperText={isSubmitted && errors.fees}
      />
      <FormSelect
        label="Select Billing"
        name="billingType"
        value={formData.billingType}
        onChange={handleChange}
        options={billingTypes}
        error={isSubmitted && errors.billingType}
        helperText={isSubmitted && errors.billingType}
      />
    </FormPage>
  );
};

export default SubscriptionForm;