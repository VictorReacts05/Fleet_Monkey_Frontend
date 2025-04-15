import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormTextArea from "../../Common/FormTextArea";
import FormPage from "../../Common/FormPage";
import { getCustomerById } from "./customerStorage";
import { getCompanies } from "../Company/companyStorage";
import { getCurrencies } from "../Currency/currencyStorage";

const CustomerForm = ({ customerId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    companyId: "",
    importCode: "",
    currencyId: "",
    websiteUrl: "",
    customerNotes: "",
    addressType: "",
  });

  const [companies, setCompanies] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  
  // Add these state declarations
  const [errors, setErrors] = useState({
    customerName: '',
    companyId: '',
    importCode: '',
    currencyId: '',
    websiteUrl: '',
    customerNotes: '',
    addressType: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const addressTypes = [
    { value: "billing", label: "Billing" },
    { value: "shipping", label: "Shipping" },
    { value: "both", label: "Both" },
  ];

  useEffect(() => {
    setCompanies(
      getCompanies().map((company) => ({
        value: company.id,
        label: company.companyName,
      }))
    );

    setCurrencies(
      getCurrencies().map((currency) => ({
        value: currency.id,
        label: currency.currencyName,
      }))
    );

    if (customerId) {
      const customer = getCustomerById(customerId);
      if (customer) {
        setFormData(customer);
      }
    }
  }, [customerId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      customerName: '',
      companyId: '',
      importCode: '',
      currencyId: '',
      websiteUrl: '',
      customerNotes: '',
      addressType: ''
    };

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
      isValid = false;
    } else if (formData.customerName.length < 2) {
      newErrors.customerName = 'Customer name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Company is required';
      isValid = false;
    }

    if (!formData.currencyId) {
      newErrors.currencyId = 'Currency is required';
      isValid = false;
    }

    // Update import code validation
    if (formData.importCode) {
      if (!/^[A-Z0-9-]{3,15}$/.test(formData.importCode)) {
        newErrors.importCode = 'Import code must be 3-15 characters (uppercase letters, numbers, hyphens)';
        isValid = false;
      }
    } else {
      newErrors.importCode = 'Import code is required';
      isValid = false;
    }

    if (formData.websiteUrl && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Please enter a valid URL';
      isValid = false;
    }

    if (!formData.addressType) {
      newErrors.addressType = 'Address type is required';
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

    const customers = JSON.parse(localStorage.getItem("customers") || "[]");

    if (customerId) {
      const updatedCustomers = customers.map((customer) =>
        customer.id === customerId ? { ...formData, id: customerId } : customer
      );
      localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    } else {
      const newCustomer = {
        ...formData,
        id: Date.now(),
      };
      localStorage.setItem(
        "customers",
        JSON.stringify([...customers, newCustomer])
      );
    }

    onSave();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (isSubmitted) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  return (
    <FormPage
      title={customerId ? "Edit Customer" : "Add Customer"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormInput
        label="Customer Name *"
        name="customerName"
        value={formData.customerName}
        onChange={handleChange}
        error={isSubmitted && errors.customerName}
        helperText={isSubmitted && errors.customerName}
      />
      <FormSelect
        label="Select Company *"
        name="companyId"
        value={formData.companyId}
        onChange={handleChange}
        options={companies}
        error={isSubmitted && errors.companyId}
        helperText={isSubmitted && errors.companyId}
      />
      <FormSelect
        label="Select Currency *"
        name="currencyId"
        value={formData.currencyId}
        onChange={handleChange}
        options={currencies}
        error={isSubmitted && errors.currencyId}
        helperText={isSubmitted && errors.currencyId}
      />
      <FormInput
        label="Website URL"
        name="websiteUrl"
        value={formData.websiteUrl}
        onChange={handleChange}
        error={isSubmitted && errors.websiteUrl}
        helperText={isSubmitted && errors.websiteUrl}
      />
      <FormTextArea
        label="Customer Notes"
        name="customerNotes"
        value={formData.customerNotes}
        onChange={handleChange}
        error={isSubmitted && errors.customerNotes}
        helperText={isSubmitted && errors.customerNotes}
      />
      <FormSelect
        label="Select Address *"
        name="addressType"
        value={formData.addressType}
        onChange={handleChange}
        options={addressTypes}
        error={isSubmitted && errors.addressType}
        helperText={isSubmitted && errors.addressType}
      />
      <FormInput
        label="Import Code *"
        name="importCode"
        value={formData.importCode}
        onChange={handleChange}
        error={isSubmitted && errors.importCode}
        helperText={isSubmitted && errors.importCode}
      />
    </FormPage>
  );
};

export default CustomerForm;
