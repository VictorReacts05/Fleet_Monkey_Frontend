import React, { useState, useEffect } from 'react';
import FormInput from '../../Common/FormInput';
import FormSelect from '../../Common/FormSelect';
import FormPage from '../../Common/FormPage';
import FormDatePicker from '../../Common/FormDatePicker';
import FormCheckbox from '../../Common/FormCheckbox';
import dayjs from 'dayjs';

const SalesRFQForm = ({ rfqId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    salesRFQID: '',
    series: '',
    companyId: '',
    customerId: '',
    supplierId: '',
    externalRefNo: '',
    externalSupplierId: '',
    deliveryDate: null,
    postingDate: null,
    requiredByDate: null,
    dateReceived: null,
    serviceTypeId: '',
    originAddressId: '',
    collectionAddressId: '',
    status: '',
    destinationAddressId: '',
    billingAddressId: '',
    shippingPriorityId: '',
    terms: '',
    currencyId: '',
    collectFromSupplierYN: false,
    packagingRequiredYN: false,
    formCompletedYN: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load data if editing
  useEffect(() => {
    if (rfqId) {
      // TODO: Implement getRFQById
      const rfq = getRFQById(rfqId);
      if (rfq) {
        setFormData({
          ...rfq,
          deliveryDate: rfq.deliveryDate ? dayjs(rfq.deliveryDate) : null,
          postingDate: rfq.postingDate ? dayjs(rfq.postingDate) : null,
          requiredByDate: rfq.requiredByDate ? dayjs(rfq.requiredByDate) : null,
          dateReceived: rfq.dateReceived ? dayjs(rfq.dateReceived) : null,
        });
      }
    }
  }, [rfqId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date ? dayjs(date) : null
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Required field validations
    const requiredFields = [
      'companyId',
      'customerId',
      'supplierId',
      'deliveryDate',
      'requiredByDate',
      'serviceTypeId',
      'originAddressId',
      'collectionAddressId',
      'status',
      'destinationAddressId',
      'billingAddressId',
      'shippingPriorityId',
      'currencyId'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    });

    // Date validations
    if (formData.deliveryDate && formData.requiredByDate &&
        dayjs(formData.deliveryDate).isAfter(formData.requiredByDate)) {
      newErrors.deliveryDate = 'Delivery date cannot be after required by date';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) {
      return;
    }

    const formDataToSave = {
      ...formData,
      deliveryDate: formData.deliveryDate ? dayjs(formData.deliveryDate).format('YYYY-MM-DD') : null,
      postingDate: formData.postingDate ? dayjs(formData.postingDate).format('YYYY-MM-DD') : null,
      requiredByDate: formData.requiredByDate ? dayjs(formData.requiredByDate).format('YYYY-MM-DD') : null,
      dateReceived: formData.dateReceived ? dayjs(formData.dateReceived).format('YYYY-MM-DD') : null,
    };

    try {
      // TODO: Implement saveRFQ function
      // saveRFQ(formDataToSave);
      onSave();
    } catch (error) {
      console.error('Error saving RFQ:', error);
    }
  };

  return (
    <FormPage
      title={rfqId ? "Edit Sales RFQ" : "Create Sales RFQ"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      {rfqId && (
        <>
          <FormInput
            label="Sales RFQ ID"
            name="salesRFQID"
            value={formData.salesRFQID}
            disabled={true}
          />
          <FormInput
            label="Series"
            name="series"
            value={formData.series}
            disabled={true}
          />
        </>
      )}
      
      <FormSelect
        label="Company *"
        name="companyId"
        value={formData.companyId}
        onChange={handleChange}
        options={[]} // TODO: Add company options
        error={isSubmitted && errors.companyId}
        helperText={isSubmitted && errors.companyId}
      />

      <FormSelect
        label="Customer *"
        name="customerId"
        value={formData.customerId}
        onChange={handleChange}
        options={[]} // TODO: Add customer options
        error={isSubmitted && errors.customerId}
        helperText={isSubmitted && errors.customerId}
      />

      <FormSelect
        label="Supplier *"
        name="supplierId"
        value={formData.supplierId}
        onChange={handleChange}
        options={[]} // TODO: Add supplier options
        error={isSubmitted && errors.supplierId}
        helperText={isSubmitted && errors.supplierId}
      />

      <FormInput
        label="External Reference No"
        name="externalRefNo"
        value={formData.externalRefNo}
        onChange={handleChange}
      />

      <FormInput
        label="External Supplier ID"
        name="externalSupplierId"
        value={formData.externalSupplierId}
        onChange={handleChange}
      />

      <FormDatePicker
        label="Delivery Date *"
        name="deliveryDate"
        value={formData.deliveryDate}
        onChange={(date) => handleDateChange("deliveryDate", date)}
        error={isSubmitted && errors.deliveryDate}
        helperText={isSubmitted && errors.deliveryDate}
      />

      <FormDatePicker
        label="Posting Date"
        name="postingDate"
        value={formData.postingDate}
        onChange={(date) => handleDateChange("postingDate", date)}
      />

      <FormDatePicker
        label="Required By Date *"
        name="requiredByDate"
        value={formData.requiredByDate}
        onChange={(date) => handleDateChange("requiredByDate", date)}
        error={isSubmitted && errors.requiredByDate}
        helperText={isSubmitted && errors.requiredByDate}
      />

      <FormDatePicker
        label="Date Received"
        name="dateReceived"
        value={formData.dateReceived}
        onChange={(date) => handleDateChange("dateReceived", date)}
      />

      <FormSelect
        label="Service Type *"
        name="serviceTypeId"
        value={formData.serviceTypeId}
        onChange={handleChange}
        options={[]} // TODO: Add service type options
        error={isSubmitted && errors.serviceTypeId}
        helperText={isSubmitted && errors.serviceTypeId}
      />

      <FormSelect
        label="Origin Address *"
        name="originAddressId"
        value={formData.originAddressId}
        onChange={handleChange}
        options={[]} // TODO: Add address options
        error={isSubmitted && errors.originAddressId}
        helperText={isSubmitted && errors.originAddressId}
      />

      <FormSelect
        label="Collection Address *"
        name="collectionAddressId"
        value={formData.collectionAddressId}
        onChange={handleChange}
        options={[]} // TODO: Add address options
        error={isSubmitted && errors.collectionAddressId}
        helperText={isSubmitted && errors.collectionAddressId}
      />

      <FormSelect
        label="Status *"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={[]} // TODO: Add status options
        error={isSubmitted && errors.status}
        helperText={isSubmitted && errors.status}
      />

      <FormSelect
        label="Destination Address *"
        name="destinationAddressId"
        value={formData.destinationAddressId}
        onChange={handleChange}
        options={[]} // TODO: Add address options
        error={isSubmitted && errors.destinationAddressId}
        helperText={isSubmitted && errors.destinationAddressId}
      />

      <FormSelect
        label="Billing Address *"
        name="billingAddressId"
        value={formData.billingAddressId}
        onChange={handleChange}
        options={[]} // TODO: Add address options
        error={isSubmitted && errors.billingAddressId}
        helperText={isSubmitted && errors.billingAddressId}
      />

      <FormSelect
        label="Shipping Priority *"
        name="shippingPriorityId"
        value={formData.shippingPriorityId}
        onChange={handleChange}
        options={[]} // TODO: Add shipping priority options
        error={isSubmitted && errors.shippingPriorityId}
        helperText={isSubmitted && errors.shippingPriorityId}
      />

      <FormInput
        label="Terms"
        name="terms"
        value={formData.terms}
        onChange={handleChange}
        multiline
        rows={4}
      />

      <FormSelect
        label="Currency *"
        name="currencyId"
        value={formData.currencyId}
        onChange={handleChange}
        options={[]} // TODO: Add currency options
        error={isSubmitted && errors.currencyId}
        helperText={isSubmitted && errors.currencyId}
      />

      <FormCheckbox
        label="Collect From Supplier"
        name="collectFromSupplierYN"
        checked={formData.collectFromSupplierYN}
        onChange={handleCheckboxChange}
      />

      <FormCheckbox
        label="Packaging Required"
        name="packagingRequiredYN"
        checked={formData.packagingRequiredYN}
        onChange={handleCheckboxChange}
      />

      <FormCheckbox
        label="Form Completed"
        name="formCompletedYN"
        checked={formData.formCompletedYN}
        onChange={handleCheckboxChange}
      />
    </FormPage>
  );
};

export default SalesRFQForm;