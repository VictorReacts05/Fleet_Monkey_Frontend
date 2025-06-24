import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { createSupplier, updateSupplier, getSupplierById } from "./SupplierAPI";
import { toast } from "react-toastify";
import FormInput from './../../Common/FormInput';

const SupplierForm = ({ supplierId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplierId) {
      loadSupplier();
    }
  }, [supplierId]);

  const loadSupplier = async () => {
    try {
      setLoading(true);
      const response = await getSupplierById(supplierId);
      console.log("Supplier response:", response);

      const supplier = response.data || response;

      setFormData({
        supplierName: supplier.SupplierName || "",
        supplierEmail: supplier.SupplierEmail || "",
      });
    } catch (error) {
      console.error("Error loading supplier:", error);
      console.log(
        "Failed to load supplier: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.supplierName?.trim()) {
      newErrors.supplierName = "Supplier name is required";
    }
    if (!formData.supplierEmail?.trim()) {
      newErrors.supplierEmail = "Supplier email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.supplierEmail)) {
      newErrors.supplierEmail = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      console.log("Please fix the validation errors");
      return;
    }

    try {
      setLoading(true);
      const supplierData = {
        supplierName: formData.supplierName,
        supplierEmail: formData.supplierEmail,
      };

      console.log("Submitting supplier data:", supplierData);

      if (supplierId) {
        await updateSupplier(supplierId, supplierData);
        toast.success("Supplier updated successfully");
      } else {
        await createSupplier(supplierData);
        toast.success("Supplier created successfully");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error(
        `Failed to ${supplierId ? "update" : "create"} supplier:`,
        error
      );
      console.log(
        `Failed to ${supplierId ? "update" : "create"} supplier: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" mb={3}>
        {supplierId ? "Edit Supplier" : "Create New Supplier"}
      </Typography>

      <FormInput
        fullWidth
        margin="normal"
        label="Supplier Name"
        name="supplierName"
        value={formData.supplierName}
        onChange={handleChange}
        error={!!errors.supplierName}
        helperText={errors.supplierName}
        required
      />

      <FormInput
        fullWidth
        margin="normal"
        label="Supplier Email"
        name="supplierEmail"
        value={formData.supplierEmail}
        onChange={handleChange}
        error={!!errors.supplierEmail}
        helperText={errors.supplierEmail}
        required
      />

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {supplierId ? "Update" : "Create"}
        </Button>
      </Box>
    </Box>
  );
};

export default SupplierForm;
