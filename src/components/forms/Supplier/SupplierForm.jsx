import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import { getSupplierById } from "./supplierStorage";
import { getCompanies } from "../Company/companyStorage";
import { getCurrencies } from "../Currency/currencyStorage";
import { getAddressTypes } from "../../forms/AddressType/addressTypeStorage";

const SupplierForm = ({ supplierId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierType: "",
    addressTypeId: "",
    companyId: "",
    exportCode: "",
    currencyId: "",
  });

  const [errors, setErrors] = useState({
    supplierName: "",
    supplierType: "",
    addressTypeId: "",
    companyId: "",
    exportCode: "",
    currencyId: "",
  });

  const [companies, setCompanies] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [addressTypes, setAddressTypes] = useState([]);
  const [supplierTypes] = useState([
    { value: "local", label: "Local" },
    { value: "international", label: "International" },
  ]);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    const addressTypeData = getAddressTypes();
    setAddressTypes(
      addressTypeData.map((type) => ({
        value: type.id,
        label: type.name || type.addressTypeName,
      }))
    );

    if (supplierId) {
      const supplier = getSupplierById(supplierId);
      if (supplier) {
        setFormData(supplier);
      }
    }
  }, [supplierId]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Supplier Name validation
    if (!formData.supplierName.trim()) {
      newErrors.supplierName = "Supplier name is required";
      isValid = false;
    } else if (!/^[A-Za-z\s-]{2,}$/.test(formData.supplierName)) {
      newErrors.supplierName =
        "Supplier name must be at least 2 characters (letters only)";
      isValid = false;
    }

    // Supplier Type validation
    if (!formData.supplierType) {
      newErrors.supplierType = "Supplier type is required";
      isValid = false;
    }

    // Address Type validation
    if (!formData.addressTypeId) {
      newErrors.addressTypeId = "Address type is required";
      isValid = false;
    }

    // Company validation
    if (!formData.companyId) {
      newErrors.companyId = "Company is required";
      isValid = false;
    }

    // Export Code validation
    if (!formData.exportCode.trim()) {
      newErrors.exportCode = "Export code is required";
      isValid = false;
    } else if (!/^[A-Z0-9]{3,10}$/.test(formData.exportCode)) {
      newErrors.exportCode = "Export code must be 3-10 alphanumeric characters";
      isValid = false;
    }

    // Currency validation
    if (!formData.currencyId) {
      newErrors.currencyId = "Currency is required";
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

    const suppliers = JSON.parse(localStorage.getItem("suppliers") || "[]");

    if (supplierId) {
      const updatedSuppliers = suppliers.map((supplier) =>
        supplier.id === supplierId ? { ...formData, id: supplierId } : supplier
      );
      localStorage.setItem("suppliers", JSON.stringify(updatedSuppliers));
    } else {
      const newSupplier = {
        ...formData,
        id: Date.now(),
      };
      localStorage.setItem(
        "suppliers",
        JSON.stringify([...suppliers, newSupplier])
      );
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
      title={supplierId ? "Edit Supplier" : "Add Supplier"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <FormInput
        label="Supplier Name"
        name="supplierName"
        value={formData.supplierName}
        onChange={handleChange}
        error={isSubmitted && errors.supplierName}
        helperText={isSubmitted && errors.supplierName}
      />
      <FormSelect
        label="Supplier Type"
        name="supplierType"
        value={formData.supplierType}
        onChange={handleChange}
        options={supplierTypes}
        error={isSubmitted && errors.supplierType}
        helperText={isSubmitted && errors.supplierType}
      />
      <FormSelect
        label="Address Type"
        name="addressTypeId"
        value={formData.addressTypeId}
        onChange={handleChange}
        options={addressTypes}
        error={isSubmitted && errors.addressTypeId}
        helperText={isSubmitted && errors.addressTypeId}
      />
      <FormSelect
        label="Company Name"
        name="companyId"
        value={formData.companyId}
        onChange={handleChange}
        options={companies}
        error={isSubmitted && errors.companyId}
        helperText={isSubmitted && errors.companyId}
      />
      <FormInput
        label="Export Code"
        name="exportCode"
        value={formData.exportCode}
        onChange={handleChange}
        error={isSubmitted && errors.exportCode}
        helperText={isSubmitted && errors.exportCode}
      />
      <FormSelect
        label="Currency Name"
        name="currencyId"
        value={formData.currencyId}
        onChange={handleChange}
        options={currencies}
        error={isSubmitted && errors.currencyId}
        helperText={isSubmitted && errors.currencyId}
      />
    </FormPage>
  );
};

export default SupplierForm;
