import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormTextArea from "../../Common/FormTextArea";
import FormPage from "../../Common/FormPage";
// import { getCurrencies } from "../Currency/currencyStorage";
import { getCompanyById } from "../Company/companyStorage";

const CompanyForm = ({ companyId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    registrationNo: "",
    taxId: "",
    email: "",
    phone: "",
    websiteLink: "", // Changed from 'website' to match form field
    companyType: "",
    currencyId: "",
    companyNotes: "",
    addressType: "",
  });

  const [errors, setErrors] = useState({
    companyName: "",
    registrationNo: "",
    taxId: "",
    email: "",
    phone: "",
    websiteLink: "",
    companyType: "",
    currencyId: "",
    companyNotes: "",
    addressType: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  const companyTypes = [
    { value: "private", label: "Private" },
    { value: "public", label: "Public" },
    { value: "government", label: "Government" },
  ];

  const addressTypes = [
    { value: "billing", label: "Billing" },
    { value: "shipping", label: "Shipping" },
    { value: "both", label: "Both" },
  ];

  useEffect(() => {
    // Load currencies
    const currencyList = getCurrencies();
    setCurrencies(
      currencyList.map((currency) => ({
        value: currency.id,
        label: currency.currencyName,
      }))
    );

    // Load company data for editing
    if (companyId) {
      const company = getCompanyById(Number(companyId)); // Ensure companyId is a number
      if (company) {
        setFormData({
          companyName: company.companyName || "",
          registrationNo: company.registrationNo || "",
          taxId: company.taxId || "",
          email: company.email || "",
          phone: company.phone || "",
          websiteLink: company.websiteLink || "", // Use websiteLink
          companyType: company.companyType || "",
          currencyId: company.currencyId || "",
          companyNotes: company.companyNotes || "",
          addressType: company.addressType || "",
        });
      } else {
        console.warn(`Company with ID ${companyId} not found`);
      }
    }
  }, [companyId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      companyName: "",
      registrationNo: "",
      taxId: "",
      email: "",
      phone: "",
      websiteLink: "",
      companyType: "",
      currencyId: "",
      companyNotes: "",
      addressType: "",
    };

    // Company Name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
      isValid = false;
    } else if (formData.companyName.length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters";
      isValid = false;
    }

    // Company Type validation
    if (!formData.companyType) {
      newErrors.companyType = "Company type is required";
      isValid = false;
    }

    // Currency validation
    if (!formData.currencyId) {
      newErrors.currencyId = "Currency is required";
      isValid = false;
    }

    // Website Link validation (optional field)
    if (
      formData.websiteLink &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
        formData.websiteLink
      )
    ) {
      newErrors.websiteLink = "Please enter a valid URL";
      isValid = false;
    }

    // Company Notes validation (optional field)
    if (formData.companyNotes && formData.companyNotes.length > 500) {
      newErrors.companyNotes = "Company notes cannot exceed 500 characters";
      isValid = false;
    }

    // Address Type validation
    if (!formData.addressType) {
      newErrors.addressType = "Address type is required";
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

    const companies = JSON.parse(localStorage.getItem("companies") || "[]");

    if (companyId) {
      const updatedCompanies = companies.map((company) =>
        company.id === Number(companyId)
          ? { ...formData, id: Number(companyId) }
          : company
      );
      localStorage.setItem("companies", JSON.stringify(updatedCompanies));
    } else {
      const newCompany = {
        ...formData,
        id: Date.now(),
      };
      localStorage.setItem(
        "companies",
        JSON.stringify([...companies, newCompany])
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
        [name]: "",
      });
    }
  };

  return (
    <FormPage
      title={companyId ? "Edit Company" : "Add Company"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormInput
        label="Company Name *"
        name="companyName"
        value={formData.companyName}
        onChange={handleChange}
        error={isSubmitted && errors.companyName}
        helperText={isSubmitted && errors.companyName}
      />
      <FormSelect
        label="Company Type *"
        name="companyType"
        value={formData.companyType}
        onChange={handleChange}
        options={companyTypes}
        error={isSubmitted && errors.companyType}
        helperText={isSubmitted && errors.companyType}
      />
      <FormSelect
        label="Currency *"
        name="currencyId"
        value={formData.currencyId}
        onChange={handleChange}
        options={currencies}
        error={isSubmitted && errors.currencyId}
        helperText={isSubmitted && errors.currencyId}
      />
      <FormInput
        label="Website Link"
        name="websiteLink"
        value={formData.websiteLink}
        onChange={handleChange}
        error={isSubmitted && errors.websiteLink}
        helperText={isSubmitted && errors.websiteLink}
      />
      <FormTextArea
        label="Company Notes"
        name="companyNotes"
        value={formData.companyNotes}
        onChange={handleChange}
        error={isSubmitted && errors.companyNotes}
        helperText={isSubmitted && errors.companyNotes}
      />
      <FormSelect
        label="Address Type *"
        name="addressType"
        value={formData.addressType}
        onChange={handleChange}
        options={addressTypes}
        error={isSubmitted && errors.addressType}
        helperText={isSubmitted && errors.addressType}
      />
    </FormPage>
  );
};

export default CompanyForm;
