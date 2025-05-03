import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import { createBank, updateBank, getBankById } from "./BankAPI";
import { Grid } from "@mui/material";
import { toast } from "react-toastify";

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

  useEffect(() => {
    const loadBank = async () => {
      if (bankId) {
        try {
          setLoading(true);
          const data = await getBankById(bankId);

          // Make sure we're setting the form data with the correct property names
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
          console.error("Load bank error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          }); // Debug log
          toast.error("Failed to load bank details");
        } finally {
          setLoading(false);
        }
      }
    };
    loadBank();
  }, [bankId]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "AccountName":
        if (!value.trim()) {
          newErrors.AccountName = "Account name is required";
        } else if (value.trim().length < 3) {
          newErrors.AccountName = "Account name must be at least 3 characters";
        } else if (value.length > 16) {
          newErrors.AccountName = "Account name must be 16 characters or less";
        } else {
          delete newErrors.AccountName;
        }
        break;
      case "AccountType":
        if (!value) {
          newErrors.AccountType = "Account type is required";
        } else {
          delete newErrors.AccountType;
        }
        break;
      case "BankName":
        if (!value.trim()) {
          newErrors.BankName = "Bank name is required";
        } else if (value.trim().length < 2) {
          newErrors.BankName = "Bank name must be at least 2 characters";
        } else if (value.length > 50) {
          newErrors.BankName = "Bank name must be 50 characters or less";
        } else {
          delete newErrors.BankName;
        }
        break;
      case "BranchCode":
        if (value) {
          // Branch codes are typically 6-11 digits
          const branchCodeRegex = /^[0-9]{6,11}$/;
          if (!branchCodeRegex.test(value)) {
            newErrors.BranchCode = "Branch code must be 6-11 digits";
          } else {
            delete newErrors.BranchCode;
          }
        } else {
          delete newErrors.BranchCode;
        }
        break;

      case "IBAN":
        if (value) {
          // IBAN format: 2 letter country code + 2 check digits + up to 30 alphanumeric chars
          const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
          if (!ibanRegex.test(value)) {
            newErrors.IBAN =
              "Invalid IBAN format (e.g., GB29NWBK60161331926819)";
          } else {
            delete newErrors.IBAN;
          }
        } else {
          delete newErrors.IBAN;
        }
        break;

      case "IFSC":
        if (value) {
          // IFSC format: 4 letters (bank code) + 0 + 6 alphanumeric chars
          const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
          if (!ifscRegex.test(value)) {
            newErrors.IFSC = "Invalid IFSC format (e.g., SBIN0123456)";
          } else {
            delete newErrors.IFSC;
          }
        } else {
          delete newErrors.IFSC;
        }
        break;

      case "MICRA":
        if (value) {
          // MICR code is typically 9 digits
          const micrRegex = /^[0-9]{9}$/;
          if (!micrRegex.test(value)) {
            newErrors.MICRA = "MICR code must be exactly 9 digits";
          } else {
            delete newErrors.MICRA;
          }
        } else {
          delete newErrors.MICRA;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Only validate if the form has been submitted once
    if (submitted) {
      validateField(name, value);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate AccountName
    if (!formData.AccountName.trim()) {
      newErrors.AccountName = "Account name is required";
      isValid = false;
    } else if (formData.AccountName.trim().length < 3) {
      newErrors.AccountName = "Account name must be at least 3 characters";
      isValid = false;
    } else if (formData.AccountName.length > 50) {
      newErrors.AccountName = "Account name must be 50 characters or less";
      isValid = false;
    }

    // Validate AccountType
    if (!formData.AccountType) {
      newErrors.AccountType = "Account type is required";
      isValid = false;
    }

    // Validate BankName
    if (!formData.BankName.trim()) {
      newErrors.BankName = "Bank name is required";
      isValid = false;
    } else if (formData.BankName.trim().length < 2) {
      newErrors.BankName = "Bank name must be at least 2 characters";
      isValid = false;
    } else if (formData.BankName.length > 50) {
      newErrors.BankName = "Bank name must be 50 characters or less";
      isValid = false;
    }

    // Validate Branch Code - always check format even if empty
    const branchCodeRegex = /^[0-9]{6,11}$/;
    if (formData.BranchCode && !branchCodeRegex.test(formData.BranchCode)) {
      newErrors.BranchCode = "Branch code must be 6-11 digits";
      isValid = false;
    }

    // Validate IBAN - always check format even if empty
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    if (formData.IBAN && !ibanRegex.test(formData.IBAN)) {
      newErrors.IBAN = "Invalid IBAN format (e.g., GB29NWBK60161331926819)";
      isValid = false;
    }

    // Validate IFSC - always check format even if empty
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (formData.IFSC && !ifscRegex.test(formData.IFSC)) {
      newErrors.IFSC = "Invalid IFSC format (e.g., SBIN0123456)";
      isValid = false;
    }

    // Validate MICR - always check format even if empty
    const micrRegex = /^[0-9]{9}$/;
    if (formData.MICRA && !micrRegex.test(formData.MICRA)) {
      newErrors.MICRA = "MICR code must be exactly 9 digits";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    // Add null check for the event parameter
    if (e) {
      e.preventDefault();
    }

    setSubmitted(true);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Use the correct property names from formData (with uppercase first letters)
      const apiData = {
        AccountName: formData.AccountName,
        AccountType: formData.AccountType,
        BankName: formData.BankName,
        BranchCode: formData.BranchCode || null,
        IBAN: formData.IBAN || null,
        IFSC: formData.IFSC || null,
        MICRA: formData.MICRA || null,
      };

      console.log("Submitting bank data:", apiData);

      if (bankId) {
        await updateBank(bankId, apiData);
        toast.success("Bank account updated successfully");
      } else {
        await createBank(apiData);
        toast.success("Bank account created successfully");
      }

      if (onSave) onSave();
      if (onClose) onClose();
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
    // Clear any validation errors
    setErrors({});
    // Call the onClose function passed from parent
    onClose();
  };

  return (
    <FormPage
      title={bankId ? "Edit Bank Account" : "Create Bank Account"}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      loading={loading}
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
            label="Account Name *"
            name="AccountName"
            value={formData.AccountName}
            onChange={handleChange}
            error={errors.AccountName}
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
            error={errors.AccountType}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="Bank Name *"
            name="BankName"
            value={formData.BankName}
            onChange={handleChange}
            error={errors.BankName}
            helperText={errors.BankName || ""}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="Branch Code"
            name="BranchCode"
            value={formData.BranchCode}
            onChange={handleChange}
            error={errors.BranchCode}
            helperText={errors.BranchCode || ""}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="IBAN"
            name="IBAN"
            value={formData.IBAN}
            onChange={handleChange}
            error={errors.IBAN}
            helperText={errors.IBAN || ""}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="IFSC Code"
            name="IFSC"
            value={formData.IFSC}
            onChange={handleChange}
            error={errors.IFSC}
            helperText={errors.IFSC || ""}
          />
        </Grid>

        <Grid item xs={12} sx={{ width: "47%" }}>
          <FormInput
            label="MICR Code"
            name="MICRA"
            value={formData.MICRA}
            onChange={handleChange}
            error={errors.MICRA}
            helperText={errors.MICRA || ""}
          />
        </Grid>
      </Grid>
    </FormPage>
  );
};

export default BankForm;
