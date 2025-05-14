import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import { createBank, updateBank, getBankById } from "./BankAPI";
import { Grid } from "@mui/material";
import { toast } from "react-toastify";
import { showToast } from "../../toastNotification";

const BankForm = ({ bankId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    AccountName: "",
    AccountType: "",
    BankName: "",
    BranchCode: "",
    IBAN: "",
    IFSC: "",
    MICRA: "",
    RowVersionColumn: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Only mark truly required fields
  const requiredFields = {
    AccountName: true,
    AccountType: true,
    BankName: true,
    BranchCode:true,
    IBAN:true,
    IFSC:true,
    MICRA:true,

    
    // BranchCode, IBAN, IFSC, MICRA are optional
  };

  useEffect(() => {
    const loadBank = async () => {
      if (bankId) {
        try {
          setLoading(true);
          const data = await getBankById(bankId);
          setFormData({
            AccountName: data.AccountName || "",
            AccountType: data.AccountType || "",
            BankName: data.BankName || "",
            BranchCode: data.BranchCode || "",
            IBAN: data.IBAN || "",
            IFSC: data.IFSC || "",
            MICRA: data.MICRA || "",
            RowVersionColumn: data.RowVersionColumn || null,
          });
        } catch (error) {
          console.error("Load bank error:", error);
          toast.error("Failed to load bank details");
        } finally {
          setLoading(false);
        }
      }
    };
    loadBank();
  }, [bankId]);

  const validateField = (name, value, isSubmitting = false) => {
    let error = "";
    
    // First check if the field is required and empty
    if ((isSubmitting || submitted) && requiredFields[name] && !value) {
      error = `${name.replace(/([A-Z])/g, '$1').trim()} is required`;
    } 
    // Only validate format if there's a value
    else if (value) {
      switch (name) {
        case "AccountName":
          if (value.trim().length < 3) {
            error = "Account name must be at least 3 characters";
          } else if (value.length > 50) {
            error = "Account name must be 50 characters or less";
          }
          break;
        case "AccountType":
          if (!["Savings", "Current"].includes(value)) {
            error = "Please select a valid account type";
          }
          break;
        case "BankName":
          if (value.trim().length < 2) {
            error = "Bank name must be at least 2 characters";
          } else if (value.length > 50) {
            error = "Bank name must be 50 characters or less";
          }
          break;
        case "BranchCode":
          if (!/^[A-Za-z0-9]{6,11}$/.test(value)) {
            error = "Branch code must be 6-11 alphanumeric characters";
          }
          break;
        case "IBAN":
          const strippedIBAN = value.replace(/\s+/g,'').toUpperCase();
          if (!/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/.test(strippedIBAN)) {
            error = "Invalid IBAN format (e.g., GB29 NWBK 6016 1331 9268 19)";
          }
          break;
        case "IFSC":
          if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase())) {
            error = "Invalid IFSC format (e.g., SBIN0000123)";
          }
          break;
        case "MICRA":
          if (!/^[A-Z0-9]{9}$/.test(value.toUpperCase())) {
            error = "MICR code must be exactly 9 alphanumeric characters";
          }
          break;
        default:
          break;
      }
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate only required fields
    Object.keys(requiredFields).forEach(field => {
      const valid = validateField(field, formData[field], true);
      if (!valid) {
        isValid = false;
      }
    });

    // Validate optional fields only if they have values
    ["BranchCode", "IBAN", "IFSC", "MICRA"].forEach(field => {
      if (formData[field]) {
        const valid = validateField(field, formData[field], true);
        if (!valid) {
          isValid = false;
        }
      }
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for API
      const apiData = {
        AccountName: formData.AccountName,
        AccountType: formData.AccountType,
        BankName: formData.BankName,
        BranchCode: formData.BranchCode || null,
        IBAN: formData.IBAN || null,
        IFSC: formData.IFSC || null,
        MICRA: formData.MICRA || null,
      };

      if (bankId) {
        // Include RowVersionColumn only for updates
        await updateBank(bankId, { ...apiData, RowVersionColumn: formData.RowVersionColumn });
        toast.success("Bank account updated successfully");
        showToast("Bank account updated successfully","success");
      } else {
        await createBank(apiData);
        toast.success("Bank account created successfully");
        showToast("Bank account created successfully","success");
      }

      onSave?.();
      onClose?.();
    } catch (error) {
      console.error("API error:", error);
      toast.error(
        `Failed to ${bankId ? "update" : "create"} bank account: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose?.();
  };

  return (
    <FormPage
      title={bankId ? "Edit Bank Account" : "Create Bank Account"}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <Grid container spacing={2} sx={{ maxHeight: "calc(100vh - 200px)", width: "100%", margin: 0, overflow: "hidden" }}>
        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="Account Name *"
            name="AccountName"
            value={formData.AccountName}
            onChange={handleChange}
            error={!!errors.AccountName}
            helperText={errors.AccountName || ""}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormSelect
            label="Account Type *"
            name="AccountType"
            value={formData.AccountType}
            options={[
              { value: "Savings", label: "Savings" },
              { value: "Current", label: "Current" },
            ]}
            onChange={handleChange}
            error={!!errors.AccountType}
            helperText={errors.AccountType || ""}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="Bank Name *"
            name="BankName"
            value={formData.BankName}
            onChange={handleChange}
            error={!!errors.BankName}
            helperText={errors.BankName || ""}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="Branch Code"
            name="BranchCode"
            value={formData.BranchCode}
            onChange={handleChange}
            error={!!errors.BranchCode}
            helperText={errors.BranchCode || ""}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="IBAN"
            name="IBAN"
            value={formData.IBAN}
            onChange={handleChange}
            error={!!errors.IBAN}
            helperText={errors.IBAN || ""}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="IFSC Code"
            name="IFSC"
            value={formData.IFSC}
            onChange={handleChange}
            error={!!errors.IFSC}
            helperText={errors.IFSC || ""}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%",paddingBottom:"20px" }}>
          <FormInput
            label="MICR Code"
            name="MICRA"
            value={formData.MICRA}
            onChange={handleChange}
            error={!!errors.MICRA}
            helperText={errors.MICRA || ""}
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default BankForm;