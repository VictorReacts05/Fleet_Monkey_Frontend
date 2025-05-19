import React, { useState, useEffect } from "react";
import FormInput from "../../Common/FormInput";
import FormPage from "../../Common/FormPage";
import {
  createAddressType,
  updateAddressType,
  getAddressTypeById,
} from "./AddressTypeAPI";
import { toast } from "react-toastify";
import { showToast } from "../../toastNotification";

const AddressTypeForm = ({ addressTypeId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    addressType: "",
  });

  const [errors, setErrors] = useState({
    addressType: "",
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (addressTypeId) {
      loadAddressType();
    }
  }, [addressTypeId]);

  const loadAddressType = async () => {
    try {
      setLoading(true);
      const response = await getAddressTypeById(addressTypeId);
      console.log("Loaded address type response:", response);

      // Handle different response structures
      const addressTypeData = response.AddressTypeID
        ? response
        : response.data
        ? Array.isArray(response.data)
          ? response.data[0]
          : response.data
        : response;

      setFormData({
        addressType: addressTypeData.AddressType || "",
      });
    } catch (error) {
      console.error("Error loading address type:", error);
      toast.error(
        error.message || "Failed to load address type details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getValidationError = (field, value) => {
    switch (field) {
      case "addressType":
        if (!value.trim()) {
          return "Address type name is required";
        } else if (value.length < 2) {
          return "Address type name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s-]+$/.test(value)) {
          return "Address type name can only contain letters, spaces, and hyphens";
        }
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {
      addressType: getValidationError("addressType", formData.addressType),
    };

    setErrors(newErrors);
    return !newErrors.addressType;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitted(true);

    if (validateForm()) {
      try {
        setLoading(true);

        const addressTypeData = {
          AddressType: formData.addressType, // Changed to match API expectation
        };

        if (addressTypeId) {
          await updateAddressType(addressTypeId, addressTypeData);
          toast.success("Address type updated successfully");
        } else {
          await createAddressType(addressTypeData);
          toast.success("Address type created successfully");
        }

        if (onSave) onSave();
        if (onClose) onClose();
      } catch (error) {
        console.error("Error saving address type:", error);
        toast.error(
          error.response?.data?.message || error.message || "Failed to save address type. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (isSubmitted) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: getValidationError(name, value),
      }));
    }
  };

  return (
    <FormPage
      title={addressTypeId ? "Edit Address Type" : "Create Address Type"}
      onSubmit={handleSubmit}
      onCancel={onClose}
      loading={loading}
    >
      <FormInput
        label="Address Type Name"
        name="addressType"
        value={formData.addressType}
        onChange={handleChange}
        error={errors.addressType}
        required
      />
    </FormPage>
  );
};

export default AddressTypeForm;