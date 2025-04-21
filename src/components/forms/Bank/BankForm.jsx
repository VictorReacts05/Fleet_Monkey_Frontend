import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormSelect from "../../Common/FormSelect";
import FormPage from "../../Common/FormPage";
import { createBank, updateBank, getBankById } from "./BankAPI";
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
            newErrors.IBAN = "Invalid IBAN format (e.g., GB29NWBK60161331926819)";
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
    e.preventDefault();
    setSubmitted(true);
    
    // Store validation errors directly instead of relying on state
    const validationErrors = {};
    
    // Validate required fields
    if (!formData.AccountName.trim()) {
      validationErrors.AccountName = "Account name is required";
    } else if (formData.AccountName.trim().length < 3) {
      validationErrors.AccountName = "Account name must be at least 3 characters";
    } else if (formData.AccountName.length > 16) {
      validationErrors.AccountName = "Account name must be 16 characters or less";
    }

    if (!formData.AccountType) {
      validationErrors.AccountType = "Account type is required";
    }

    if (!formData.BankName.trim()) {
      validationErrors.BankName = "Bank name is required";
    } else if (formData.BankName.trim().length < 2) {
      validationErrors.BankName = "Bank name must be at least 2 characters";
    } else if (formData.BankName.length > 50) {
      validationErrors.BankName = "Bank name must be 50 characters or less";
    }

    // Add placeholder validation messages for empty optional fields
    // This will show format requirements even when fields are empty
    if (formData.BranchCode === "") {
      validationErrors.BranchCode = "Branch code must be 6-11 digits if provided";
    } else if (formData.BranchCode) {
      const branchCodeRegex = /^[0-9]{6,11}$/;
      if (!branchCodeRegex.test(formData.BranchCode)) {
        validationErrors.BranchCode = "Branch code must be 6-11 digits";
      }
    }

    if (formData.IBAN === "") {
      validationErrors.IBAN = "IBAN must follow format: GB29NWBK60161331926819 if provided";
    } else if (formData.IBAN) {
      const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
      if (!ibanRegex.test(formData.IBAN)) {
        validationErrors.IBAN = "Invalid IBAN format (e.g., GB29NWBK60161331926819)";
      }
    }

    if (formData.IFSC === "") {
      validationErrors.IFSC = "IFSC must follow format: SBIN0123456 if provided";
    } else if (formData.IFSC) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(formData.IFSC)) {
        validationErrors.IFSC = "Invalid IFSC format (e.g., SBIN0123456)";
      }
    }

    if (formData.MICRA === "") {
      validationErrors.MICRA = "MICR code must be exactly 9 digits if provided";
    } else if (formData.MICRA) {
      const micrRegex = /^[0-9]{9}$/;
      if (!micrRegex.test(formData.MICRA)) {
        validationErrors.MICRA = "MICR code must be exactly 9 digits";
      }
    }
    
    // Update the errors state
    setErrors(validationErrors);
    
    // Check if there are any validation errors
    if (Object.keys(validationErrors).length > 0) {
      console.error("Validation failed:", validationErrors);
      toast.error("Please fix validation errors");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        accountName: formData.AccountName,
        accountType: formData.AccountType,
        bankName: formData.BankName,
        branchCode: formData.BranchCode,
        iban: formData.IBAN,
        ifsc: formData.IFSC,
        micra: formData.MICRA,
        rowVersionColumn: formData.RowVersionColumn,
      }; 

      let response;
      if (bankId) {
        response = await updateBank(bankId, payload);
      } else {
        response = await createBank(payload);
      }

      if (response.result !== 0) {
        throw new Error(response.message || "Operation failed");
      }

      toast.success(
        `Bank account ${bankId ? "updated" : "created"} successfully`
      );
      onSave();
      onClose();
    } catch (error) {
      console.error("API error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      }); // Debug log
      toast.error(error.message || "Failed to save bank account");
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
      <FormInput
        label="Account Name *"
        name="AccountName"
        value={formData.AccountName}
        onChange={handleChange}
        error={errors.AccountName}
        helperText={errors.AccountName || ""}
      />

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

      <FormInput
        label="Bank Name *"
        name="BankName"
        value={formData.BankName}
        onChange={handleChange}
        error={errors.BankName}
        helperText={errors.BankName || ""}
      />

      <FormInput
        label="Branch Code"
        name="BranchCode"
        value={formData.BranchCode}
        onChange={handleChange}
        error={errors.BranchCode}
        helperText={errors.BranchCode || ""}
      />

      <FormInput
        label="IBAN"
        name="IBAN"
        value={formData.IBAN}
        onChange={handleChange}
        error={errors.IBAN}
        helperText={errors.IBAN || ""}
      />

      <FormInput
        label="IFSC Code"
        name="IFSC"
        value={formData.IFSC}
        onChange={handleChange}
        error={errors.IFSC}
        helperText={errors.IFSC || ""}
      />

      <FormInput
        label="MICR Code"
        name="MICRA"
        value={formData.MICRA}
        onChange={handleChange}
        error={errors.MICRA}
        helperText={errors.MICRA || ""}
      />
    </FormPage>
  );
};

export default BankForm;
