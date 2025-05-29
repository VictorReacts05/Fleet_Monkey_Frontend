import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import {
  createCompany,
  updateCompany,
  getCompanyById,
  fetchAllCurrencies,
} from "./CompanyAPI";
import { toast } from "react-toastify";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormTextArea from "../../Common/FormTextArea";
import FormPage from "../../Common/FormPage";

const CompanyForm = ({ companyId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    billingCurrencyId: "",
    vatAccount: "",
    website: "",
    companyNotes: "",
  });
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencyData = await fetchAllCurrencies();
        const formattedCurrencies = currencyData.map((currency) => ({
          value: currency.CurrencyID || currency.currencyID,
          label: currency.CurrencyName || currency.currencyName,
        }));
        setCurrencies(formattedCurrencies);
      } catch (error) {
        toast.error("Failed to load currencies: " + error.message);
      }
    };

    loadCurrencies();

    if (companyId) {
      loadCompany();
    }
  }, [companyId]);

  const loadCompany = async () => {
    try {
      const data = await getCompanyById(companyId);
      setFormData({
        companyName: data.CompanyName || data.companyName || "",
        billingCurrencyId:
          data.BillingCurrencyID || data.billingCurrencyId || "",
        vatAccount: data.VAT_Account || data.vatAccount || "",
        website: data.Website || data.website || "",
        companyNotes: data.CompanyNotes || data.companyNotes || "",
      });
    } catch (error) {
      toast.error("Failed to load company: " + error.message);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company Name is required";
    } else if (formData.companyName.length > 100) {
      newErrors.companyName = "Company Name cannot exceed 100 characters";
    } else if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(formData.companyName)) {
      newErrors.companyName =
        "Company Name can only contain letters, numbers, spaces, and &.,'-";
    }

    if (!formData.billingCurrencyId) {
      newErrors.billingCurrencyId = "Billing Currency is required";
    } else if (
      !currencies.some(
        (currency) => currency.value === formData.billingCurrencyId
      )
    ) {
      newErrors.billingCurrencyId = "Invalid currency selected";
    }

    if (!formData.vatAccount.trim()) {
      newErrors.vatAccount = "VAT Account is required";
    } else if (formData.vatAccount.length > 50) {
      newErrors.vatAccount = "VAT Account cannot exceed 50 characters";
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(formData.vatAccount)) {
      newErrors.vatAccount =
        "VAT Account can only contain letters, numbers, spaces, and hyphens";
    }

    if (!formData.website.trim()) {
      newErrors.website = "Website is required";
    } else if (
      !/^(https?:\/\/)?([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]{2,}(\/.*)?$/i.test(
        formData.website
      )
    ) {
      newErrors.website = "Invalid website format (e.g., https://example.com)";
    } else if (formData.website.length > 200) {
      newErrors.website = "Website cannot exceed 200 characters";
    }

    if (!formData.companyNotes.trim()) {
      newErrors.companyNotes = "Company Notes are required";
    } else if (formData.companyNotes.length > 255) {
      newErrors.companyNotes = "Company Notes cannot exceed 255 characters";
    } else if (/[<>{}]/g.test(formData.companyNotes)) {
      newErrors.companyNotes = "Company Notes cannot contain <, >, {, or }";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const submitData = {
        companyName: formData.companyName,
        billingCurrencyId: Number(formData.billingCurrencyId),
        vatAccount: formData.vatAccount,
        website: formData.website,
        companyNotes: formData.companyNotes,
        createdById: user.personId || 1,
      };

      console.log("Submitting data:", submitData);

      if (companyId) {
        submitData.CompanyID = Number(companyId);
        await updateCompany(companyId, submitData);
        toast.success("Company updated successfully");
      } else {
        await createCompany(submitData); // Fixed typo: subData -> submitData
        toast.success("Company created successfully");
      }

      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("API Error:", error);
      toast.error(
        `Failed to ${companyId ? "update" : "create"} company: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <FormPage
      title={companyId ? "Edit Company" : "Create Company"}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <Grid
        container
        spacing={2}
        sx={{ maxHeight: "calc(100vh - 200px)", width: "100%", margin: 0 }}
      >
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            name="companyName"
            label="Company Name"
            value={formData.companyName}
            onChange={handleChange}
            error={!!errors.companyName}
            helperText={errors.companyName}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormSelect
            name="billingCurrencyId"
            label="Billing Currency"
            value={formData.billingCurrencyId}
            onChange={handleChange}
            options={currencies}
            error={!!errors.billingCurrencyId}
            helperText={errors.billingCurrencyId}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            name="vatAccount"
            label="VAT Account"
            value={formData.vatAccount}
            onChange={handleChange}
            error={!!errors.vatAccount}
            helperText={errors.vatAccount}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            name="website"
            label="Website"
            value={formData.website}
            onChange={handleChange}
            error={!!errors.website}
            helperText={errors.website}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "100%" }}>
          <FormTextArea
            name="companyNotes"
            label="Company Notes"
            value={formData.companyNotes}
            onChange={handleChange}
            error={!!errors.companyNotes}
            helperText={errors.companyNotes}
            rows={4}
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default CompanyForm;
