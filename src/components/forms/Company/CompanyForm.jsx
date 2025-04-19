import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormTextArea from "../../Common/FormTextArea";
import FormPage from "../../Common/FormPage";
import {
  createCompany,
  updateCompany,
  getCompanyById,
  fetchAllCurrencies,
} from "./CompanyAPI";
import { toast } from "react-toastify";

const CompanyForm = ({ companyId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    CompanyName: "",
    BillingCurrencyID: "",
    VAT_Account: "",
    Website: "",
    CompanyNotes: "",
    RowVersionColumn: null,
  });

  const [errors, setErrors] = useState({
    CompanyName: "",
    BillingCurrencyID: "",
    VAT_Account: "",
    Website: "",
    CompanyNotes: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);

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
        console.error("Error loading currencies:", error);
        toast.error("Failed to load currencies");
      }
    };

    loadCurrencies();

    if (companyId) {
      loadCompany();
    }
  }, [companyId]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const data = await getCompanyById(companyId);
      setFormData({
        CompanyName: data.CompanyName || "",
        BillingCurrencyID: data.BillingCurrencyID || "",
        VAT_Account: data.VAT_Account || "",
        Website: data.Website || "",
        CompanyNotes: data.CompanyNotes || "",
        RowVersionColumn: data.RowVersionColumn,
      });
    } catch (error) {
      console.error("Error loading company:", error);
      toast.error(
        `Failed to load company details: ${error.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "CompanyName":
        if (!value) {
          error = "Company Name is required";
        } else if (value.length < 3) {
          error = "Company Name must be at least 3 characters";
        } else if (value.length > 100) {
          error = "Company Name must be 100 characters or less";
        } else if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(value)) {
          error =
            "Company Name can only contain letters, numbers, spaces, and &.,'-";
        }
        break;

      case "BillingCurrencyID":
        if (!value) {
          error = "Currency selection is required";
        } else if (!currencies.some((currency) => currency.value === value)) {
          error = "Invalid currency selected";
        }
        break;

      case "VAT_Account":
        if (!value) {
          error = "VAT Account is required";
        } else if (value.length < 3) {
          error = "VAT Account must be at least 3 characters";
        } else if (value.length > 50) {
          error = "VAT Account must be 50 characters or less";
        } else if (!/^[a-zA-Z0-9\s-]+$/.test(value)) {
          error =
            "VAT Account can only contain letters, numbers, spaces, and hyphens";
        }
        break;

      case "Website":
        if (!value) {
          error = "Website is required";
        } else {
          const urlPattern =
            /^(https?:\/\/)?([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]{2,}(\/.*)?$/i;
          if (!urlPattern.test(value)) {
            error = "Invalid website format (e.g., https://example.com)";
          } else if (value.length > 200) {
            error = "Website must be 200 characters or less";
          } else if (value.length < 4) {
            error = "Website must be at least 4 characters";
          }
        }
        break;

      case "CompanyNotes":
        if (!value) {
          error = "Company Notes are required";
        } else if (value.length > 255) {
          error = "Notes must be 255 characters or less";
        } else if (/[<>{}]/g.test(value)) {
          error = "Notes cannot contain <, >, {, or }";
        } else if (value.length < 3) {
          error = "Notes must be at least 3 characters";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    const validationErrors = {};

    validationErrors.CompanyName = validateField(
      "CompanyName",
      formData.CompanyName
    )
      ? ""
      : errors.CompanyName || "Company Name is required";
    validationErrors.BillingCurrencyID = validateField(
      "BillingCurrencyID",
      formData.BillingCurrencyID
    )
      ? ""
      : errors.BillingCurrencyID || "Currency selection is required";
    validationErrors.VAT_Account = validateField(
      "VAT_Account",
      formData.VAT_Account
    )
      ? ""
      : errors.VAT_Account || "VAT Account is required";
    validationErrors.Website = validateField("Website", formData.Website)
      ? ""
      : errors.Website || "Website is required";
    validationErrors.CompanyNotes = validateField(
      "CompanyNotes",
      formData.CompanyNotes
    )
      ? ""
      : errors.CompanyNotes || "Company Notes are required";

    const hasErrors = Object.values(validationErrors).some(
      (error) => error !== ""
    );

    if (hasErrors) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setLoading(true);
      if (companyId) {
        await updateCompany(companyId, formData);
        toast.success("Company updated successfully");
      } else {
        await createCompany(formData);
        toast.success("Company created successfully");
      }
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error(error.message || "Failed to save company");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (isSubmitted) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  return (
    <FormPage
      title={companyId ? "Edit Company" : "Create Company"}
      onCancel={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <FormInput
        label="Company Name *"
        name="CompanyName"
        value={formData.CompanyName}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!errors.CompanyName}
        helperText={errors.CompanyName}
        placeholder="Enter company name"
      />

      <FormSelect
        label="Currency *"
        name="BillingCurrencyID"
        value={formData.BillingCurrencyID}
        onChange={handleChange}
        onBlur={handleBlur}
        options={currencies}
        error={!!errors.BillingCurrencyID}
        helperText={errors.BillingCurrencyID}
        placeholder="Select currency"
      />

      <FormInput
        label="VAT Account *"
        name="VAT_Account"
        value={formData.VAT_Account}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!errors.VAT_Account}
        helperText={errors.VAT_Account}
        placeholder="Enter VAT account number"
      />

      <FormInput
        label="Website *"
        name="Website"
        value={formData.Website}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!errors.Website}
        helperText={errors.Website}
        placeholder="https://example.com"
      />

      <FormTextArea
        label="Company Notes *"
        name="CompanyNotes"
        value={formData.CompanyNotes}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!errors.CompanyNotes}
        helperText={errors.CompanyNotes}
        placeholder="Enter any additional notes"
        rows={4}
      />
    </FormPage>
  );
};

export default CompanyForm;
