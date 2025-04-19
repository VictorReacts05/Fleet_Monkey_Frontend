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

  useEffect(() => {
    const loadBank = async () => {
      if (bankId) {
        try {
          setLoading(true);
          console.log(`Loading bank ID ${bankId}`); // Debug log
          const data = await getBankById(bankId);
          console.log("Loaded bank data:", JSON.stringify(data, null, 2)); // Debug log
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
        } else if (value.length > 100) {
          newErrors.AccountName = "Account name must be 100 characters or less";
        } else {
          delete newErrors.AccountName;
        }
        break;
      case "AccountType":
        if (!value) {
          newErrors.AccountType = "Account type is required";
        } else if (!["Savings", "Current"].includes(value)) {
          newErrors.AccountType = "Invalid account type";
        } else {
          delete newErrors.AccountType;
        }
        break;
      case "BankName":
        if (!value.trim()) {
          newErrors.BankName = "Bank name is required";
        } else if (value.length > 100) {
          newErrors.BankName = "Bank name must be 100 characters or less";
        } else {
          delete newErrors.BankName;
        }
        break;
      case "BranchCode":
        if (value && !/^[a-zA-Z0-9]{1,20}$/.test(value)) {
          newErrors.BranchCode =
            "Branch code must be alphanumeric and up to 20 characters";
        } else {
          delete newErrors.BranchCode;
        }
        break;
      case "IBAN":
        if (value && !/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(value)) {
          newErrors.IBAN = "Invalid IBAN format";
        } else {
          delete newErrors.IBAN;
        }
        break;
      case "IFSC":
        if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
          newErrors.IFSC = "Invalid IFSC format (e.g., SBIN0001234)";
        } else {
          delete newErrors.IFSC;
        }
        break;
      case "MICRA":
        if (value && !/^[0-9]{9}$/.test(value)) {
          newErrors.MICRA = "MICR code must be exactly 9 digits";
        } else {
          delete newErrors.MICRA;
        }
        break;
      default:
        break;
    }

    console.log(`Validating ${name}:`, { value, errors: newErrors }); // Debug log
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name}=${value}`); // Debug log
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.AccountName.trim()) {
      newErrors.AccountName = "Account name is required";
    } else if (formData.AccountName.length > 100) {
      newErrors.AccountName = "Account name must be 100 characters or less";
    }

    if (!formData.AccountType) {
      newErrors.AccountType = "Account type is required";
    } else if (!["Savings", "Current"].includes(formData.AccountType)) {
      newErrors.AccountType = "Invalid account type";
    }

    if (!formData.BankName.trim()) {
      newErrors.BankName = "Bank name is required";
    } else if (formData.BankName.length > 100) {
      newErrors.BankName = "Bank name must be 100 characters or less";
    }

    if (
      formData.BranchCode &&
      !/^[a-zA-Z0-9]{1,20}$/.test(formData.BranchCode)
    ) {
      newErrors.BranchCode =
        "Branch code must be alphanumeric and up to 20 characters";
    }

    if (
      formData.IBAN &&
      !/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(formData.IBAN)
    ) {
      newErrors.IBAN = "Invalid IBAN format";
    }

    if (formData.IFSC && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.IFSC)) {
      newErrors.IFSC = "Invalid IFSC format (e.g., SBIN0001234)";
    }

    if (formData.MICRA && !/^[0-9]{9}$/.test(formData.MICRA)) {
      newErrors.MICRA = "MICR code must be exactly 9 digits";
    }

    console.log("Form validation errors:", newErrors); // Debug log
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started:", JSON.stringify(formData, null, 2)); // Debug log

    if (!validateForm()) {
      console.error("Validation failed:", errors); // Debug log
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

      console.log(
        "Sending API request with:",
        JSON.stringify(payload, null, 2)
      ); // Debug log

      let response;
      if (bankId) {
        response = await updateBank(bankId, payload);
      } else {
        response = await createBank(payload);
      }

      console.log("API response:", JSON.stringify(response, null, 2)); // Debug log
      if (response.result !== 0) {
        throw new Error(response.message || "Operation failed");
      }

      toast.success(
        `Bank account ${bankId ? "updated" : "created"} successfully`
      );
      console.log("Operation successful, triggering refresh"); // Debug log
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

  return (
    <FormPage
      title={bankId ? "Edit Bank Account" : "Create Bank Account"}
      onCancel={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <FormInput
        label="Account Name"
        name="AccountName"
        value={formData.AccountName}
        onChange={handleChange}
        error={errors.AccountName}
        required
      />

      <FormSelect
        label="Account Type"
        name="AccountType"
        value={formData.AccountType}
        options={[
          { value: "Savings", label: "Savings" },
          { value: "Current", label: "Current" },
        ]}
        onChange={handleChange}
        error={errors.AccountType}
        required
      />

      <FormInput
        label="Bank Name"
        name="BankName"
        value={formData.BankName}
        onChange={handleChange}
        error={errors.BankName}
        required
      />

      <FormInput
        label="Branch Code"
        name="BranchCode"
        value={formData.BranchCode}
        onChange={handleChange}
        error={errors.BranchCode}
      />

      <FormInput
        label="IBAN"
        name="IBAN"
        value={formData.IBAN}
        onChange={handleChange}
        error={errors.IBAN}
      />

      <FormInput
        label="IFSC Code"
        name="IFSC"
        value={formData.IFSC}
        onChange={handleChange}
        error={errors.IFSC}
      />

      <FormInput
        label="MICR Code"
        name="MICRA"
        value={formData.MICRA}
        onChange={handleChange}
        error={errors.MICRA}
      />
    </FormPage>
  );
};

export default BankForm;
