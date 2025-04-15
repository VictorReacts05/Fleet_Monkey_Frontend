import React, { useState, useEffect } from 'react';
import FormInput from '../../Common/FormInput';
import FormSelect from '../../Common/FormSelect';
import FormPage from '../../Common/FormPage';
import { getBankById } from './bankStorage';

const BankForm = ({ bankId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    accountType: '',
    bankName: '',
    branchCode: '',
    ibanNo: '',
    ifscCode: '',
    micraCode: ''
  });

  const [errors, setErrors] = useState({
    accountName: '',
    accountType: '',
    bankName: '',
    branchCode: '',
    ibanNo: '',
    ifscCode: '',
    micraCode: ''
  });

  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const accountTypes = [
    { value: 'savings', label: 'Savings' },
    { value: 'current', label: 'Current' }
  ];

  useEffect(() => {
    if (bankId) {
      const bank = getBankById(bankId);
      if (bank) {
        setFormData(bank);
      }
    }
  }, [bankId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      accountName: '',
      accountType: '',
      bankName: '',
      branchCode: '',
      ibanNo: '',
      ifscCode: '',
      micraCode: ''
    };

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account holder name is required';
      isValid = false;
    } else if (formData.accountName.length < 3) {
      newErrors.accountName = 'Account name must be at least 3 characters';
      isValid = false;
    }

    if (!formData.accountType) {
      newErrors.accountType = 'Please select an account type';
      isValid = false;
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
      isValid = false;
    } else if (formData.bankName.length < 2) {
      newErrors.bankName = 'Bank name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.branchCode.trim()) {
      newErrors.branchCode = 'Branch code is required';
      isValid = false;
    } else if (!/^\d{4,6}$/.test(formData.branchCode)) {
      newErrors.branchCode = 'Branch code must be 4-6 digits';
      isValid = false;
    }

    if (formData.ibanNo && !/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/.test(formData.ibanNo)) {
      newErrors.ibanNo = 'Invalid IBAN format (e.g., GB29NWBK60161331926819)';
      isValid = false;
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
      isValid = false;
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC format (e.g., HDFC0123456)';
      isValid = false;
    }

    if (formData.micraCode && !/^\d{9}$/.test(formData.micraCode)) {
      newErrors.micraCode = 'MICR code must be exactly 9 digits';
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

    const banks = JSON.parse(localStorage.getItem('banks') || '[]');
    
    if (bankId) {
      const updatedBanks = banks.map(bank =>
        bank.id === bankId ? { ...formData, id: bankId } : bank
      );
      localStorage.setItem('banks', JSON.stringify(updatedBanks));
      setMessage('Bank updated successfully');
    } else {
      const newBank = {
        ...formData,
        id: Date.now()
      };
      localStorage.setItem('banks', JSON.stringify([...banks, newBank]));
      setMessage('Bank created successfully');
    }
    
    onSave();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (isSubmitted) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Helper function to get display value
  const getDisplayValue = (value) => {
    return value.trim() === '' ? '-' : value;
  };

  return (
    <FormPage
      title={bankId ? 'Edit Bank' : 'Add Bank'}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormInput
        label="Account Name *"
        name="accountName"
        value={formData.accountName}
        onChange={handleChange}
        error={isSubmitted && errors.accountName}
        helperText={isSubmitted && errors.accountName}
      />
      <FormSelect
        label="Account Type *"
        name="accountType"
        value={formData.accountType}
        onChange={handleChange}
        options={accountTypes}
        error={isSubmitted && errors.accountType}
        helperText={isSubmitted && errors.accountType}
      />
      <FormInput
        label="Bank Name *"
        name="bankName"
        value={formData.bankName}
        onChange={handleChange}
        error={isSubmitted && errors.bankName}
        helperText={isSubmitted && errors.bankName}
      />
      <FormInput
        label="Branch Code *"
        name="branchCode"
        value={formData.branchCode}
        onChange={handleChange}
        error={isSubmitted && errors.branchCode}
        helperText={isSubmitted && errors.branchCode}
      />
      <FormInput
        label="IBAN No"        name="ibanNo"
        value={getDisplayValue(formData.ibanNo)}
        onChange={handleChange}
        error={isSubmitted && errors.ibanNo}
        helperText={isSubmitted && errors.ibanNo}
      />
      <FormInput
        label="IFSC Code *"
        name="ifscCode"
        value={formData.ifscCode}
        onChange={handleChange}
        error={isSubmitted && errors.ifscCode}
        helperText={isSubmitted && errors.ifscCode}
      />
      <FormInput
        label="MICRA Code"
        name="micraCode"
        value={getDisplayValue(formData.micraCode)}
        onChange={handleChange}
        error={isSubmitted && errors.micraCode}
        helperText={isSubmitted && errors.micraCode}
      />
      {isSubmitted && !Object.values(errors).some(error => error) && message && (
        <div style={{ 
          marginTop: '10px',
          color: '#2e7d32',
          fontSize: '0.875rem'
        }}>
          {message}
        </div>
      )}
    </FormPage>
  );
};

export default BankForm;