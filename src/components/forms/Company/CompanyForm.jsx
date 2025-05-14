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
import { showToast } from "../../toastNotification";

const CompanyForm = ({ companyId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    CompanyName: "",
    BillingCurrencyID: "",
    VAT_Account: "",
    Website: "",
    CompanyNotes: "",
    CreatedByID: "",
    CreatedDateTime: null,
    IsDeleted: false,
    DeletedDateTime: null,
    DeletedByID: "",
  });

  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

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
        CompanyName: data.CompanyName || "",
        BillingCurrencyID: data.BillingCurrencyID || "",
        VAT_Account: data.VAT_Account || "",
        Website: data.Website || "",
        CompanyNotes: data.CompanyNotes || "",
        CreatedByID: data.CreatedByID || "",
        CreatedDateTime: data.CreatedDateTime ? data.CreatedDateTime : null,
        IsDeleted: data.IsDeleted || false,
        DeletedDateTime: data.DeletedDateTime ? data.DeletedDateTime : null,
        DeletedByID: data.DeletedByID || "",
      });
    } catch (error) {
      toast.error("Failed to load company: " + error.message);
    }
  };

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.CompanyName.trim()) {
      newErrors.CompanyName = "Company Name is required";
    }

    // Fix for BillingCurrencyID - check if it exists instead of using trim()
    if (!formData.BillingCurrencyID) {
      newErrors.BillingCurrencyID = "Billing Currency ID is required";
    }

    if (!formData.VAT_Account.trim()) {
      newErrors.VAT_Account = "VAT Account is required";
    }

    if (!formData.Website.trim()) {
      newErrors.Website = "Website is required";
    }

    if (!formData.CompanyNotes.trim()) {
      newErrors.CompanyNotes = "Company Notes are required";
    }

    // Specific field validations
    if (formData.CompanyName && formData.CompanyName.length > 100) {
      newErrors.CompanyName = "Company Name cannot exceed 100 characters";
    } else if (
      formData.CompanyName &&
      !/^[a-zA-Z0-9\s&.,'-]+$/.test(formData.CompanyName)
    ) {
      newErrors.CompanyName =
        "Company Name can only contain letters, numbers, spaces, and &.,'-";
    }

    if (
      formData.BillingCurrencyID &&
      !currencies.some(
        (currency) => currency.value === formData.BillingCurrencyID
      )
    ) {
      newErrors.BillingCurrencyID = "Invalid currency selected";
    }

    if (formData.VAT_Account && formData.VAT_Account.length > 50) {
      newErrors.VAT_Account = "VAT Account cannot exceed 50 characters";
    } else if (
      formData.VAT_Account &&
      !/^[a-zA-Z0-9\s-]+$/.test(formData.VAT_Account)
    ) {
      newErrors.VAT_Account =
        "VAT Account can only contain letters, numbers, spaces, and hyphens";
    }

    if (formData.Website) {
      const urlPattern =
        /^(https?:\/\/)?([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]{2,}(\/.*)?$/i;
      if (!urlPattern.test(formData.Website)) {
        newErrors.Website =
          "Invalid website format (e.g., https://example.com)";
      } else if (formData.Website.length > 200) {
        newErrors.Website = "Website cannot exceed 200 characters";
      }
    }

    if (formData.CompanyNotes && formData.CompanyNotes.length > 255) {
      newErrors.CompanyNotes = "Company Notes cannot exceed 255 characters";
    } else if (formData.CompanyNotes && /[<>{}]/g.test(formData.CompanyNotes)) {
      newErrors.CompanyNotes = "Company Notes cannot contain <, >, {, or }";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Inside the handleSubmit function
  const handleSubmit = async (e) => {
    // Add null check for the event parameter
    if (e) {
      e.preventDefault();
    }
  
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }
  
    try {
      setLoading(true);
      
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem("user")) || {};
  
      // Update the field names to match what the API expects
      const submitData = {
        // Use capital letters for field names to match backend expectations
        CompanyName: formData.CompanyName,
        BillingCurrencyID: Number(formData.BillingCurrencyID), // Ensure this is a number
        VAT_Account: formData.VAT_Account,
        Website: formData.Website,
        CompanyNotes: formData.CompanyNotes,
        CreatedByID: user.personId || 1, // Use user's personId or default to 1
      };
  
      // If updating, include the RowVersionColumn if it exists
      if (companyId && formData.RowVersionColumn) {
        submitData.RowVersionColumn = formData.RowVersionColumn;
      }
  
      console.log("Submitting data:", submitData);
  
      if (companyId) {
        // For update, explicitly include the CompanyID
        submitData.CompanyID = Number(companyId);
        await updateCompany(companyId, submitData);
        toast.success("Company updated successfully");
        showToast("Company updated successfully", "success");
      } else {
        await createCompany(submitData);
        toast.success("Company created successfully");
        showToast("Company created successfully", "success");
      }
      
      // Call both onSave and onClose to ensure the popup closes
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("API Error:", error);
      toast.error(
        `Failed to ${companyId ? "update" : "create"} company: ` + 
        (error.error || error.message || "Server returned 400 Bad Request")
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <FormPage
      title={companyId ? "Edit Company" : "Create Company"}
      onSubmit={handleSubmit}
      onCancel={onClose}
    >
      <Grid
        container
        spacing={2}
        sx={{
          maxHeight: "calc(100vh - 200px)",
          width: "100%",
          margin: 0,
          overflow: "hidden"
        }}
      >
        <Grid item xs={12} sx={{ width: '47%' }}>
          <FormInput
            name="CompanyName"
            label="Company Name"
            value={formData.CompanyName}
            onChange={handleChange}
            error={!!errors.CompanyName}
            helperText={errors.CompanyName}
          />
        </Grid>

        <Grid item xs={12} sx={{  width: "47%" }}>
          <FormSelect
            name="BillingCurrencyID"
            label="Billing Currency"
            value={formData.BillingCurrencyID}
            onChange={handleChange}
            options={currencies}
            error={!!errors.BillingCurrencyID}
            helperText={errors.BillingCurrencyID}
          />
        </Grid>

        <Grid item xs={12} sx={{  width: "47%" }}>
          <FormInput
            name="VAT_Account"
            label="VAT Account"
            value={formData.VAT_Account}
            onChange={handleChange}
            error={!!errors.VAT_Account}
            helperText={errors.VAT_Account}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            name="Website"
            label="Website"
            value={formData.Website}
            onChange={handleChange}
            error={!!errors.Website}
            helperText={errors.Website}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "100%" }}>
          <FormTextArea
            name="CompanyNotes"
            label="Company Notes"
            value={formData.CompanyNotes}
            onChange={handleChange}
            error={!!errors.CompanyNotes}
            helperText={errors.CompanyNotes}
            rows={4}
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default CompanyForm;
