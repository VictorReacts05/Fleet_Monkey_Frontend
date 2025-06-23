import React, { useState, useEffect } from "react";
import FormPage from "../../common/FormPage";
import FormInput from "../../common/FormInput";
import FormSelect from "../../common/FormSelect";
import FormTextArea from "../../common/FormTextArea";
import { toast } from "react-toastify";
import {
  getCustomerById,
  createCustomer,
  updateCustomer,
  fetchCurrencies,
  fetchCompanies,
} from "./CustomerAPI";
import { Grid } from "@mui/material";

const CustomerForm = ({ customerId, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    CustomerName: "",
    CompanyID: "",
    ImportCode: "",
    BillingCurrencyID: "",
    Website: "",
    CustomerNotes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch currencies from the currency table
        const currenciesResponse = await fetchCurrencies();
        console.log("Currencies response:", currenciesResponse);

        if (currenciesResponse.success && currenciesResponse.data) {
          setCurrencies(currenciesResponse.data);
        } else {
          console.error("Failed to load currencies:", currenciesResponse.error);
          console.log("Failed to load currencies");
        }

        // Fetch companies from the company table
        const companiesResponse = await fetchCompanies();
        console.log("Companies response:", companiesResponse);

        if (companiesResponse.success && companiesResponse.data) {
          setCompanies(companiesResponse.data);
        } else {
          console.error("Failed to load companies:", companiesResponse.error);
          console.log("Failed to load companies");
        }

        // If editing, fetch customer data
        if (customerId) {
          const customerData = await getCustomerById(customerId);
          if (customerData) {
            setFormData({
              CustomerName: customerData.CustomerName || "",
              CompanyID: customerData.CompanyID || "",
              ImportCode: customerData.ImportCode || "",
              BillingCurrencyID: customerData.BillingCurrencyID || "",
              Website: customerData.Website || "",
              CustomerNotes: customerData.CustomerNotes || "",
              RowVersionColumn: customerData.RowVersionColumn || null,
            });
          }
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        console.log("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "CustomerName":
        if (!value) {
          error = "Customer Name is required";
        } else if (value.length < 3) {
          error = "Customer Name must be at least 3 characters";
        } else if (value.length > 100) {
          error = "Customer Name must be 100 characters or less";
        } else if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(value)) {
          error =
            "Customer Name can only contain letters, numbers, spaces, and &.,'-";
        }
        break;

      case "CompanyID":
        if (!value) {
          error = "Company selection is required";
        } else if (!companies.some((company) => company.CompanyID === value)) {
          error = "Invalid company selected";
        }
        break;

      case "ImportCode":
        if (!value) {
          error = "Import Code is required";
        } else if (value.length < 3) {
          error = "Import Code must be at least 3 characters";
        } else if (value.length > 50) {
          error = "Import Code must be 50 characters or less";
        } else if (!/^[a-zA-Z0-9-]+$/.test(value)) {
          error = "Import Code can only contain letters, numbers, and hyphens";
        }
        break;

      case "BillingCurrencyID":
        if (!value) {
          error = "Currency selection is required";
        } else if (
          !currencies.some((currency) => currency.CurrencyID === value)
        ) {
          error = "Invalid currency selected";
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

      case "CustomerNotes":
        if (!value) {
          error = "Customer Notes are required";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (isSubmitted) {
      validateField(name, value);
    }
  };

  // Add handleBlur function to validate fields on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitted(true);

    const validationErrors = {};

    validationErrors.CustomerName = validateField(
      "CustomerName",
      formData.CustomerName
    )
      ? ""
      : errors.CustomerName || "Customer Name is required";
    validationErrors.CompanyID = validateField("CompanyID", formData.CompanyID)
      ? ""
      : errors.CompanyID || "Company selection is required";
    validationErrors.ImportCode = validateField(
      "ImportCode",
      formData.ImportCode
    )
      ? ""
      : errors.ImportCode || "Import Code is required";
    validationErrors.BillingCurrencyID = validateField(
      "BillingCurrencyID",
      formData.BillingCurrencyID
    )
      ? ""
      : errors.BillingCurrencyID || "Currency selection is required";
    validationErrors.Website = validateField("Website", formData.Website)
      ? ""
      : errors.Website || "Website is required";
    validationErrors.CustomerNotes = validateField(
      "CustomerNotes",
      formData.CustomerNotes
    )
      ? ""
      : errors.CustomerNotes || "Customer Notes are required";

    const hasErrors = Object.values(validationErrors).some(
      (error) => error !== ""
    );

    if (hasErrors) {
      setErrors(validationErrors);
      console.log("Please fix the validation errors");
      return;
    }

    try {
      setLoading(true);
      if (customerId) {
        await updateCustomer(customerId, formData);
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(formData);
        toast.success("Customer created successfully");
      }
      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving customer:", error);
      console.log(
        `Failed to ${customerId ? "update" : "create"} customer: ${
          error.message || error
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage
      title={""}
      loading={loading}
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
          overflow: "hidden",
        }}
      >
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            required
            label="Customer Name"
            name="CustomerName"
            value={formData.CustomerName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.CustomerName}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormSelect
            label="Company *"
            name="CompanyID"
            value={formData.CompanyID}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.CompanyID}
            helperText={errors.CompanyID}
            options={companies.map((company) => ({
              value: company.CompanyID,
              label: company.CompanyName,
            }))}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            required
            label="Import Code"
            name="ImportCode"
            value={formData.ImportCode}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.ImportCode}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormSelect
            required
            label="Billing Currency"
            name="BillingCurrencyID"
            value={formData.BillingCurrencyID}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.BillingCurrencyID}
            helperText={errors.BillingCurrencyID}
            options={currencies.map((currency) => ({
              value: currency.CurrencyID,
              label: currency.CurrencyName,
            }))}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            required
            label="Website URL"
            name="Website"
            value={formData.Website}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.Website}
          />
        </Grid>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormTextArea
            required
            label="Customer Notes"
            name="CustomerNotes"
            value={formData.CustomerNotes}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.CustomerNotes}
            rows={4}
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default CustomerForm;