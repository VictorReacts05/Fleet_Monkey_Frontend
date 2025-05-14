import React, { useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { createSupplier, updateSupplier, getSupplierById } from "./SupplierAPI";
import { toast } from "react-toastify";
import FormInput from "../../Common/FormInput";
import FormCheckbox from "../../Common/FormCheckbox";
import FormSelect from "../../Common/FormSelect";
import FormDatePicker from "../../Common/FormDatePicker";
import FormPage from "../../Common/FormPage";
import dayjs from "dayjs";
import { showToast } from "../../toastNotification";

const SupplierForm = ({ supplierId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    SupplierName: "",
    SupplierGroupID: "",
    SupplierTypeID: "",
    SupplierAddressID: "",
    SupplierExportCode: "",
    SAPartner: "",
    SAPartnerExportCode: "",
    BillingCurrencyID: "",
    CompanyID: "",
    ExternalSupplierYN: "",
  });

  const [errors, setErrors] = useState({
    SupplierName: "",
    SupplierGroupID: "",
    SupplierTypeID: "",
    SupplierAddressID: "",
    SupplierExportCode: "",
    SAPartner: "",
    SAPartnerExportCode: "",
    BillingCurrencyID: "",
    CompanyID: "",
    ExternalSupplierYN: "",
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (supplierId) {
      loadSupplier();
    }
  }, [supplierId]);

  const loadSupplier = async () => {
    try {
      setLoading(true);
      const data = await getSupplierById(supplierId);
      setFormData({
        SupplierName: data?.SupplierName || "",
        SupplierGroupID: data?.SupplierGroupID?.toString() || "",
        SupplierTypeID: data?.SupplierTypeID?.toString() || "",
        SupplierAddressID: data?.SupplierAddressID?.toString() || "",
        SupplierExportCode: data?.SupplierExportCode || "",
        SAPartner: data?.SAPartner?.toString() || "",
        SAPartnerExportCode: data?.SAPartnerExportCode || "",
        BillingCurrencyID: data?.BillingCurrencyID?.toString() || "",
        CompanyID: data?.CompanyID?.toString() || "",
        ExternalSupplierYN: data?.ExternalSupplierYN ? "1" : "0",
      });
      
    } catch (error) {
      toast.error("Failed to load supplier: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.SupplierName.trim()) {
      newErrors.SupplierName = "Supplier Name is required";
    }

    if (!formData.SupplierGroupID) {
      newErrors.SupplierGroupID = "Supplier Group ID is required";
    }

    if (!formData.SupplierAddressID) {
      newErrors.SupplierAddressID = "Supplier Address ID is required";
    }

    if (!formData.SupplierTypeID) {
      newErrors.SupplierTypeID = "Supplier Type ID is required";
    }
    const exportCodeRegex = /^[A-Z0-9-_]+$/;
    if (!exportCodeRegex.test(formData.SupplierExportCode)) {
      newErrors.SupplierExportCode = "Invalid Export Code format";
    }

    if (!formData.SAPartner) {
      newErrors.SAPartner = "South Africa Partner is required";
    }

    if (!formData.SAPartnerExportCode.trim()) {
      newErrors.SAPartnerExportCode = "SA Partner Export Code is required";
    }

    if (!formData.BillingCurrencyID) {
      newErrors.BillingCurrencyID = "Billing Currency ID is required";
    }

    if (!formData.CompanyID) {
      newErrors.CompanyID = "Company ID is required";
    }

    if (!formData.ExternalSupplierYN) {
      newErrors.ExternalSupplierYN = "External Supplier selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitted(true);
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        supplierName: formData.SupplierName,
        supplierGroupID: parseInt(formData.SupplierGroupID),
        supplierTypeID: parseInt(formData.SupplierTypeID),
        supplierAddressID: parseInt(formData.SupplierAddressID),
        supplierExportCode: formData.SupplierExportCode,
        saPartner: parseInt(formData.SAPartner),
        saPartnerExportCode: formData.SAPartnerExportCode,
        billingCurrencyID: parseInt(formData.BillingCurrencyID),
        companyID: parseInt(formData.CompanyID),
        externalSupplierYN: formData.ExternalSupplierYN === "1",
        userID: 1
      };

      if (supplierId) {
        await updateSupplier(supplierId, submitData);
        // toast.success("Supplier updated successfully");
        showToast("Supplier updated successfully", "success");
      } else {
        await createSupplier(submitData);
        // toast.success("Supplier created successfully");
        showToast("Supplier created successfully", "success");
      }
      onSave();
    } catch (error) {
      toast.error(
        `Failed to ${supplierId ? "update" : "create"} supplier: ` +
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <FormPage
      title={supplierId ? "Edit Supplier" : "Create Supplier"}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormInput
            name="SupplierName"
            label="Supplier Name *"
            value={formData.SupplierName}
            onChange={handleChange}
            error={!!errors.SupplierName}
            helperText={errors.SupplierName}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            name="SupplierGroupID"
            label="Supplier Group ID *"
            type="number"
            value={formData.SupplierGroupID}
            onChange={handleChange}
            error={!!errors.SupplierGroupID}
            helperText={errors.SupplierGroupID}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            name="SupplierTypeID"
            label="Supplier Type ID *"
            type="number"
            value={formData.SupplierTypeID}
            onChange={handleChange}
            error={!!errors.SupplierTypeID}
            helperText={errors.SupplierTypeID}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            name="SupplierAddressID"
            label="Supplier Address ID *"
            type="number"
            value={formData.SupplierAddressID}
            onChange={handleChange}
            error={!!errors.SupplierAddressID}
            helperText={errors.SupplierAddressID}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            name="SupplierExportCode"
            label="Supplier Export Code *"
            value={formData.SupplierExportCode}
            onChange={handleChange}
            error={!!errors.SupplierExportCode}
            helperText={errors.SupplierExportCode}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            name="SAPartner"
            label="SA Partner *"
            type="number"
            value={formData.SAPartner}
            onChange={handleChange}
            error={!!errors.SAPartner}
            helperText={errors.SAPartner}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            name="SAPartnerExportCode"
            label="SA Partner Export Code *"
            value={formData.SAPartnerExportCode}
            onChange={handleChange}
            error={!!errors.SAPartnerExportCode}
            helperText={errors.SAPartnerExportCode}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            name="BillingCurrencyID"
            label="Billing Currency ID *"
            type="number"
            value={formData.BillingCurrencyID}
            onChange={handleChange}
            error={!!errors.BillingCurrencyID}
            helperText={errors.BillingCurrencyID}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormInput
            name="CompanyID"
            label="Company ID *"
            type="number"
            value={formData.CompanyID}
            onChange={handleChange}
            error={!!errors.CompanyID}
            helperText={errors.CompanyID}
          />
        </Grid>

        <Grid item xs={12} md={6} >
          <FormSelect sx={{ width: "222px" }}
            name="ExternalSupplierYN"
            label="External Supplier *"
            value={formData.ExternalSupplierYN}
            onChange={handleChange}
            options={[
              { value: "1", label: "Yes" },
              { value: "0", label: "No" },
            ]}
            error={!!errors.ExternalSupplierYN}
            helperText={errors.ExternalSupplierYN}
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default SupplierForm;